/**
 * Server-side authentication utilities
 * Used by Server Components and API Routes to get the authenticated user's companyId
 */

import { cookies } from "next/headers";
import { COMPANY_ID_COOKIE_NAME, USER_UID_COOKIE_NAME, USER_ROLE_COOKIE_NAME } from "./auth-constants";

/**
 * Get the current user's companyId from cookies (server-side only)
 * Returns "DEMO" if no cookie is set (guest/demo mode)
 * 
 * Note: cookies() is async in Next.js 15+
 */
export async function getCompanyIdFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const companyId = cookieStore.get(COMPANY_ID_COOKIE_NAME)?.value;
  return companyId || "DEMO";
}

/**
 * Get the current user's UID from cookies (server-side only)
 * Returns null if no cookie is set (guest/demo mode)
 */
export async function getUserUidFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_UID_COOKIE_NAME)?.value || null;
}

/**
 * Get the current user's role from cookies (server-side only)
 * Returns null if no cookie is set (guest/demo mode)
 */
export async function getUserRoleFromCookie(): Promise<"admin" | "handyman" | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;
  if (role === "admin" || role === "handyman") return role;
  return null;
}
