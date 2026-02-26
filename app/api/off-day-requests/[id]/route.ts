import { NextRequest, NextResponse } from "next/server";
import { updateOffDayRequest, deleteOffDayRequest } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reviewedBy, companyId } = body;

    if (!status || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await updateOffDayRequest(
      id,
      {
        status,
        reviewedBy,
        reviewedAt: new Date().toISOString(),
      },
      companyId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating off-day request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const companyId = searchParams.get("companyId") || "DEMO";

    await deleteOffDayRequest(id, companyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting off-day request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
