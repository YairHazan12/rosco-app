import { NextRequest, NextResponse } from "next/server";
import { revalidateHandymen } from "@/lib/server-actions";

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await req.json();
    
    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }
    
    await revalidateHandymen(companyId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revalidate handymen cache:", error);
    return NextResponse.json(
      { error: "Failed to revalidate cache" },
      { status: 500 }
    );
  }
}
