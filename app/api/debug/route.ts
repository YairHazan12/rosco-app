import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length ?? 0,
    privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30),
    hasLiteralNewlines: process.env.FIREBASE_PRIVATE_KEY?.includes("\\n"),
    hasRealNewlines: process.env.FIREBASE_PRIVATE_KEY?.includes("\n"),
  };

  try {
    const { db } = await import("@/lib/firebase-admin");
    const snap = await db.collection("jobs").limit(1).get();
    return NextResponse.json({ ok: true, jobCount: snap.size, ...info });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error, ...info }, { status: 500 });
  }
}
