/**
 * Server-side push notification helpers.
 * Sends FCM messages and writes in-app notifications to Firestore.
 */
import admin from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

interface NotifyHandymanOptions {
  handymanId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  notificationType?: "job_assigned" | "job_updated" | "job_status" | "invoice_paid" | "team_joined" | "general";
}

/**
 * Write an in-app notification to Firestore for a user.
 */
async function writeInAppNotification({
  userId,
  companyId,
  type,
  title,
  message,
}: {
  userId: string;
  companyId: string;
  type: string;
  title: string;
  message: string;
}) {
  try {
    await db.collection("notifications").add({
      userId,
      companyId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("In-app notification write failed (non-critical):", err);
  }
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
  notificationType = "general",
}: NotifyHandymanOptions): Promise<boolean> {
  try {
    // FCM token is stored in the user document, not handymen
    const userDoc = await db.collection("users").doc(handymanId).get();
    const fcmToken = userDoc.data()?.fcmToken;
    const companyId = userDoc.data()?.companyId ?? "";

    // Always write in-app notification regardless of FCM
    await writeInAppNotification({
      userId: handymanId,
      companyId,
      type: notificationType,
      title,
      message: body,
    });

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
    title: "New Job Assigned",
    body: `${jobTitle} for ${clientName} on ${new Date(jobDate).toLocaleDateString()}`,
    url: "/handyman",
    tag: "rosco-job-assigned",
    notificationType: "job_assigned",
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
    title: "Job Status Updated",
    body: `${jobTitle} is now ${newStatus}`,
    url: "/handyman",
    tag: "rosco-job-status",
    notificationType: "job_status",
  });
}
