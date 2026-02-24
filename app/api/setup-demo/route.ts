import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebase-admin";

const DEMO_ADMIN_EMAIL = "demo-admin@rosco.app";
const DEMO_ADMIN_PASSWORD = "demo123456";
const DEMO_HANDYMAN_EMAIL = "demo-handyman@rosco.app";
const DEMO_HANDYMAN_PASSWORD = "demo123456";
const DEMO_COMPANY_ID = "DEMO";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (!role || (role !== "admin" && role !== "handyman")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const auth = getAuth();

    const email = role === "admin" ? DEMO_ADMIN_EMAIL : DEMO_HANDYMAN_EMAIL;
    const password = role === "admin" ? DEMO_ADMIN_PASSWORD : DEMO_HANDYMAN_PASSWORD;
    const displayName = role === "admin" ? "Demo Admin" : "Demo Handyman";

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // User doesn't exist, create it
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
        });
      } else {
        throw error;
      }
    }

    // Create or update Firestore user document
    const userRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: userRecord.uid,
        email,
        displayName,
        role,
        companyId: DEMO_COMPANY_ID,
        onboardingComplete: true,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Ensure demo company exists
    const companyRef = db.collection("companies").doc(DEMO_COMPANY_ID);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      await companyRef.set({
        id: DEMO_COMPANY_ID,
        name: "ROSCO Demo Company",
        companyNameLower: "rosco demo company",
        companyCode: "ROSCO-DEMO",
        adminUid: role === "admin" ? userRecord.uid : "demo-admin",
        settings: {
          businessType: "general",
          phone: "+1-555-0100",
          teamSize: "5-10",
        },
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Setup demo error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup demo" },
      { status: 500 }
    );
  }
}
