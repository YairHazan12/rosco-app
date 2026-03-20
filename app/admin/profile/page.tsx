/**
 * Profile page — Server Component wrapper.
 *
 * Fetches user data, company data, and settings to display a comprehensive profile.
 */
import { getSettings } from "@/lib/db";
import { getCompanyIdFromCookie, getUserUidFromCookie } from "@/lib/server-auth";
import { db as adminDb } from "@/lib/firebase-admin";
import type { Company, User } from "@/lib/auth-types";
import { redirect } from "next/navigation";
import ProfileView from "./_components/ProfileView";

// Render fresh HTML each request
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // Fetch settings (cached 5 min)
  const settings = await getSettings();
  
  // Fetch company data
  const companyId = await getCompanyIdFromCookie();
  const userId = await getUserUidFromCookie();
  
  if (!companyId || !userId) {
    redirect("/login");
  }

  // Demo users don't have a real company profile — redirect gracefully
  if (companyId === "DEMO") {
    redirect("/admin/dashboard");
  }

  // Fetch company
  const companyDoc = await adminDb.collection("companies").doc(companyId).get();
  if (!companyDoc.exists) {
    redirect("/login");
  }
  const company = { id: companyDoc.id, ...companyDoc.data() } as Company;

  // Fetch user
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    redirect("/login");
  }
  const user = { uid: userDoc.id, ...userDoc.data() } as User;

  return <ProfileView user={user} company={company} settings={settings} />;
}
