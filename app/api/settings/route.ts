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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || "DEMO";
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
    const companyId = body.companyId || "DEMO";
    const { companyId: _, ...settingsData } = body; // Remove companyId from settings data
    const settings = await updateSettings(settingsData, companyId);
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
