import { NextRequest, NextResponse } from "next/server";
import { createPaystackSubaccount, getPaystackBanks } from "@/lib/paystack";

/**
 * POST /api/paystack/subaccounts
 * Create a Paystack subaccount for a company
 * Platform revenue split: 5% to ROSCO, 95% to company
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { businessName, settlementBank, accountNumber } = body;
    
    // Validation
    if (!businessName || !settlementBank || !accountNumber) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          required: ["businessName", "settlementBank", "accountNumber"]
        },
        { status: 400 }
      );
    }
    
    // Create subaccount (95% to company, 5% platform fee)
    const subaccount = await createPaystackSubaccount({
      businessName,
      settlementBank,
      accountNumber,
      description: `ROSCO Platform - ${businessName}`,
    });
    
    return NextResponse.json({
      success: true,
      subaccountCode: subaccount.subaccount_code,
      data: subaccount,
    });
    
  } catch (error: any) {
    console.error("Paystack subaccount creation failed:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to create subaccount",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/paystack/subaccounts
 * Get list of supported banks
 */
export async function GET() {
  try {
    const banks = await getPaystackBanks();
    
    return NextResponse.json({
      success: true,
      banks,
    });
  } catch (error: any) {
    console.error("Failed to fetch banks:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch banks",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
