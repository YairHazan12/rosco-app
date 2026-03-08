"use server";

import { revalidateTag } from "next/cache";

/**
 * Revalidate the handymen cache for a specific company.
 * Call this after adding, updating, or removing handymen.
 */
export async function revalidateHandymen(companyId: string) {
  console.log(`[♻️ Server Action] Revalidating handymen-${companyId} cache`);
  revalidateTag(`handymen-${companyId}`, "max");
}
