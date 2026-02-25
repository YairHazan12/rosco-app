/**
 * /api/settings
 *
 * GET — Returns app settings (server-side cached via unstable_cache, 5 min).
 *        NOTE: The settings page no longer calls this on mount (it receives
 *        settings as props from the server component). This endpoint exists
 *        for external integrations only.
 * PUT — Updates settings and revalidates the "settings" cache tag.
 */
import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

export async function GET(req: Request) {
  try {
    // Get companyId from cookie (server-side auth), not from query params
    const companyId = await getCompanyIdFromCookie();
    const settings = await getSettings(companyId);
    return NextResponse.json(settings, {
      headers: {
        // Settings rarely change — cache for 5 minutes
        "Cache-Control": "private, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // Get companyId from cookie (server-side auth), not from body
    const companyId = await getCompanyIdFromCookie();
    const settings = await updateSettings(body, companyId);
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
