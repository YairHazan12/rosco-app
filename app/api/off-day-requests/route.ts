import { NextRequest, NextResponse } from "next/server";
import { createOffDayRequest, getOffDayRequests } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handymanId, handymanName, date, reason, companyId } = body;

    if (!handymanId || !handymanName || !date || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const request = await createOffDayRequest({
      companyId,
      handymanId,
      handymanName,
      date,
      reason,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Error creating off-day request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const companyId = searchParams.get("companyId") || "DEMO";

    const requests = await getOffDayRequests(companyId);
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching off-day requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
