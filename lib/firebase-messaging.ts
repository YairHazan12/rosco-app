import { getApps } from "firebase/app";

const isMessagingSupported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

export async function requestNotificationPermission(): Promise<string | null> {
  if (!isMessagingSupported || typeof Notification === "undefined") return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const app = getApps()[0];
  if (!app) return null;

  try {
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error("Missing VAPID key");
      return null;
    }

    // Register service worker for FCM
    const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration });
    return token;
  } catch (err) {
    console.warn("⚠️ FCM not available in this environment:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!isMessagingSupported) return () => {};

  const app = getApps()[0];
  if (!app) return () => {};

  try {
    const { getMessaging, onMessage } = require("firebase/messaging");
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch (err) {
    console.warn("⚠️ FCM onForegroundMessage not available:", err);
    return () => {};
  }
}
