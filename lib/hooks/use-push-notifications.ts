"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { messaging, clientDb } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

interface UsePushNotificationsReturn {
  requestPermission: () => Promise<boolean>;
  revokePermission: () => Promise<void>;
  hasPermission: boolean | null; // null = unknown/loading
  isSupported: boolean;
  loading: boolean;
}

export function usePushNotifications(handymanId: string | null | undefined): UsePushNotificationsReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect support on mount
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      const current = Notification.permission;
      setHasPermission(current === "granted");
    }
  }, []);

  /**
   * Register FCM service worker, get token, save to Firestore.
   */
  const registerToken = useCallback(async (uid: string): Promise<string | null> => {
    if (!messaging || !VAPID_KEY) {
      console.warn("FCM messaging not initialized or VAPID key missing");
      return null;
    }

    try {
      // Ensure firebase-messaging SW is registered
      let swRegistration: ServiceWorkerRegistration | undefined;
      try {
        swRegistration = await navigator.serviceWorker.register("/sw.js");
      } catch {
        swRegistration = await navigator.serviceWorker.ready;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        // Persist token to Firestore users/{uid}
        const ref = doc(clientDb, "users", uid);
        await updateDoc(ref, { fcmToken: token });
        console.log("✅ FCM token saved:", token.slice(0, 20) + "...");
      }

      return token;
    } catch (err) {
      console.error("❌ Failed to get FCM token:", err);
      return null;
    }
  }, []);

  /**
   * Request notification permission + register FCM token.
   * Returns true if permission granted.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !handymanId) return false;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasPermission(granted);

      if (granted) {
        await registerToken(handymanId);
      }

      return granted;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, handymanId, registerToken]);

  /**
   * Clear FCM token from Firestore (called when user turns off push notifications).
   */
  const revokePermission = useCallback(async (): Promise<void> => {
    if (!handymanId || !clientDb) return;
    try {
      const ref = doc(clientDb, "users", handymanId);
      await updateDoc(ref, { fcmToken: null });
      console.log("✅ FCM token cleared from Firestore");
    } catch (err) {
      console.error("Error clearing FCM token:", err);
    }
  }, [handymanId]);

  // Listen for foreground messages (optional: show toast or in-app alert)
  useEffect(() => {
    if (!messaging || !hasPermission) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 Foreground FCM message:", payload);
      // Foreground notifications are handled here if needed.
      // The service worker handles background notifications automatically.
    });
    return unsubscribe;
  }, [hasPermission]);

  return {
    requestPermission,
    revokePermission,
    hasPermission,
    isSupported,
    loading,
  };
}
