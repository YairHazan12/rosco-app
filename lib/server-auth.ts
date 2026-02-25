/**
 * Server-side authentication utilities
 * Used by Server Components and API Routes to get the authenticated user's companyId
 */

import { cookies } from "next/headers";
import { COMPANY_ID_COOKIE_NAME } from "./auth-constants";

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
