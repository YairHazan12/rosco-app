import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

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

if (typeof window !== "undefined") {
  try {
    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize Firestore (without persistence to avoid offline errors)
    db = getFirestore(app);
    
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
}

export const clientDb = db as Firestore;
