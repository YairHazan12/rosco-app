import { initializeApp, getApps, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function createApp(): App {
  if (getApps().length > 0) return getApps()[0];

  // Production: use explicit service account from env
  if (process.env.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  // Local dev: use Application Default Credentials (gcloud auth login)
  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || "rosco-app-prod",
  });
}

const app = createApp();
export const db = getFirestore(app);
