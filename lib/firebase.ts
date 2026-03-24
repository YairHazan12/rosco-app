import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
};

// Only initialize Firebase on the client side
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let messaging: Messaging | undefined;

// Promise that resolves when messaging is initialized (or null if unsupported)
let messagingInitPromise: Promise<Messaging | null> | undefined;

if (typeof window !== "undefined") {
  try {
    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize Firestore (without persistence to avoid offline errors)
    db = getFirestore(app);

    // Ensure auth session persists across page navigations (LOCAL = IndexedDB/localStorage)
    // This runs independently of messaging — auth must never be blocked by messaging failures.
    const auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("⚠️ Could not set auth persistence:", err);
    });

    // Initialize Firebase Cloud Messaging asynchronously and optionally.
    // FCM is not supported in Safari, incognito mode, or browsers without ServiceWorker/PushManager.
    // The app must function normally even when messaging is unavailable.
    const appRef = app;
    messagingInitPromise = isSupported()
      .then((supported: boolean) => {
        if (!supported) {
          console.info("ℹ️ Firebase Messaging not supported in this browser (e.g. Safari/incognito). Notifications disabled.");
          return null;
        }
        try {
          const msg = getMessaging(appRef);
          messaging = msg;
          return msg;
        } catch (err: unknown) {
          console.warn("⚠️ FCM getMessaging() failed:", err);
          return null;
        }
      })
      .catch((err: unknown) => {
        console.warn("⚠️ FCM isSupported() check failed:", err);
        return null;
      });

    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
}

export const clientDb = db as Firestore;
export { messaging, messagingInitPromise };
