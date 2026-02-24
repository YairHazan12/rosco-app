import { initializeApp, getApps, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getPrivateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";
  // Handle both literal \n and real newlines
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

function createApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

  if (clientEmail) {
    const privateKey = getPrivateKey();
    if (!privateKey || !privateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error(
        "FIREBASE_PRIVATE_KEY is missing or malformed. " +
        "Ensure it includes the full PEM block with -----BEGIN PRIVATE KEY----- header."
      );
    }
    return initializeApp({
      credential: cert({
        projectId: projectId!,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Local dev fallback: Application Default Credentials
  return initializeApp({
    credential: applicationDefault(),
    projectId: projectId || "rosco-app-prod",
  });
}

let app: App;
let _db: ReturnType<typeof getFirestore>;

try {
  app = createApp();
  _db = getFirestore(app);
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
  throw error;
}

export const db = _db;
