import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getApps } from "firebase/app";

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || typeof Notification === "undefined") return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const app = getApps()[0];
  if (!app) return null;

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
}

export function onForegroundMessage(callback: (payload: any) => void) {
  const app = getApps()[0];
  if (!app || typeof window === "undefined") return () => {};
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}
