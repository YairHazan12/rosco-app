import { initializeApp, getApps, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";
  // Handle both literal \n and real newlines
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function createApp(): App {
  if (getApps().length > 0) return getApps()[0];

  if (process.env.FIREBASE_CLIENT_EMAIL) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: getPrivateKey(),
      }),
    });
  }

  // Local dev fallback: Application Default Credentials
  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || "rosco-app-prod",
  });
}

const app = createApp();
export const db = getFirestore(app);
