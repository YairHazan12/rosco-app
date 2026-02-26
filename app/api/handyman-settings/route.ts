import { NextRequest, NextResponse } from "next/server";
import { getHandymanSettings, updateHandymanSettings } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const handymanId = searchParams.get("handymanId");

    if (!handymanId) {
      return NextResponse.json(
        { error: "handymanId is required" },
        { status: 400 }
      );
    }

    const settings = await getHandymanSettings(handymanId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching handyman settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const handymanId = searchParams.get("handymanId");

    if (!handymanId) {
      return NextResponse.json(
        { error: "handymanId is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const settings = await updateHandymanSettings(handymanId, body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating handyman settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
