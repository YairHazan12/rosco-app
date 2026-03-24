/**
 * Server-side push notification helpers.
 * Sends FCM messages to handymen when jobs are assigned or updated.
 */
import admin from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

interface NotifyHandymanOptions {
  handymanId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Send a push notification to a handyman (if they have an FCM token registered).
 * Fails silently — notifications are best-effort and should never block job operations.
 */
export async function notifyHandyman({
  handymanId,
  title,
  body,
  url = "/handyman",
  tag = "rosco-job",
}: NotifyHandymanOptions): Promise<boolean> {
  try {
    // FCM token is stored in the user document, not handymen
    const userDoc = await db.collection("users").doc(handymanId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) return false;

    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: { url, tag },
      webpush: {
        notification: {
          icon: "/AppLogo.png",
          badge: "/AppLogo.png",
        },
        fcmOptions: { link: url },
      },
    });

    return true;
  } catch (err) {
    // Log but don't throw — notifications are non-critical
    console.warn("Push notification failed (non-critical):", err);
    return false;
  }
}

/**
 * Notify a handyman about a new job assignment.
 */
export async function notifyJobAssigned(
  handymanId: string,
  jobTitle: string,
  clientName: string,
  jobDate: string
): Promise<boolean> {
  return notifyHandyman({
    handymanId,
    title: "📋 New Job Assigned",
    body: `${jobTitle} for ${clientName} on ${new Date(jobDate).toLocaleDateString()}`,
    url: "/handyman",
    tag: "rosco-job-assigned",
  });
}

/**
 * Notify a handyman about a job status change.
 */
export async function notifyJobStatusChanged(
  handymanId: string,
  jobTitle: string,
  newStatus: string
): Promise<boolean> {
  return notifyHandyman({
    handymanId,
    title: "🔄 Job Updated",
    body: `${jobTitle} — Status changed to ${newStatus}`,
    url: "/handyman",
    tag: "rosco-job-status",
  });
}
