import { NextRequest, NextResponse } from "next/server";
import { db as adminDb } from "@/lib/firebase-admin";
import type { Company } from "@/lib/auth-types";

/**
 * PUT /api/companies/[id]
 * Update company details (including bank details for Paystack subaccount)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const updates = await req.json();
    
    // Get current company data
    const companyRef = adminDb.collection("companies").doc(companyId);
    const companyDoc = await companyRef.get();
    
    if (!companyDoc.exists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    
    const currentData = companyDoc.data() as Company;
    
    // Check if bank details are being added and we don't have a subaccount yet
    const hasBankDetails = updates.settlementBank && updates.accountNumber;
    const needsSubaccount = hasBankDetails && !currentData.subaccountCode;
    
    if (needsSubaccount) {
      try {
        // Create Paystack subaccount
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/paystack/subaccounts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: currentData.name,
            settlementBank: updates.settlementBank,
            accountNumber: updates.accountNumber,
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.subaccountCode) {
            updates.subaccountCode = result.subaccountCode;
            console.log(`✅ Paystack subaccount created: ${result.subaccountCode}`);
          }
        } else {
          const errorData = await response.json();
          console.error("❌ Paystack subaccount creation failed:", errorData);
          return NextResponse.json(
            { 
              error: "Failed to create Paystack subaccount",
              message: errorData.message,
            },
            { status: 400 }
          );
        }
      } catch (error: any) {
        console.error("❌ Error creating Paystack subaccount:", error);
        return NextResponse.json(
          { 
            error: "Failed to create Paystack subaccount",
            message: error.message,
          },
          { status: 500 }
        );
      }
    }
    
    // Update company document
    await companyRef.update(updates);
    
    // Fetch and return updated data
    const updatedDoc = await companyRef.get();
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() } as Company;
    
    return NextResponse.json({
      success: true,
      data: updatedData,
    });
    
  } catch (error: any) {
    console.error("Failed to update company:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to update company",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/companies/[id]
 * Get company details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    
    const companyRef = adminDb.collection("companies").doc(companyId);
    const companyDoc = await companyRef.get();
    
    if (!companyDoc.exists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    
    const companyData = { id: companyDoc.id, ...companyDoc.data() } as Company;
    
    return NextResponse.json({
      success: true,
      data: companyData,
    });
    
  } catch (error: any) {
    console.error("Failed to fetch company:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch company",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
