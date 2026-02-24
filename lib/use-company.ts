"use client";

import { useAuth } from "./auth-context";

/**
 * Returns the current company ID.
 * Falls back to "DEMO" for unauthenticated users or demo mode.
 */
export function useCompany() {
  const { user } = useAuth();
  return user?.companyId || "DEMO";
}
