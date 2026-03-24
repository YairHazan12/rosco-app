import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { handymanId, title, body, data } = await req.json();

    if (!handymanId || !title) {
      return NextResponse.json(
        { error: "Missing handymanId or title" },
        { status: 400 }
      );
    }

    // Get handyman's FCM token from their user document
    const userDoc = await db.collection("users").doc(handymanId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      return NextResponse.json(
        { error: "No FCM token registered for this handyman" },
        { status: 404 }
      );
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: { title, body: body || "" },
      data: data || {},
      webpush: {
        notification: {
          icon: "/AppLogo.png",
          badge: "/AppLogo.png",
        },
        fcmOptions: { link: data?.url || "/handyman" },
      },
    };

    const result = await admin.messaging().send(message);
    return NextResponse.json({ success: true, messageId: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Send notification error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
