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

export async function GET() {
  try {
    const settings = await getSettings();
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
    const settings = await updateSettings(body);
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
