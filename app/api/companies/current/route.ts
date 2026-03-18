import { NextResponse } from "next/server";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { db as adminDb } from "@/lib/firebase-admin";
import type { Company } from "@/lib/auth-types";

/**
 * GET /api/companies/current
 * Get the current user's company details
 */
export async function GET() {
  try {
    const companyId = await getCompanyIdFromCookie();
    
    if (!companyId || companyId === "DEMO") {
      return NextResponse.json(
        { error: "No company found" },
        { status: 404 }
      );
    }
    
    const companyRef = adminDb.collection("companies").doc(companyId);
    const companyDoc = await companyRef.get();
    
    if (!companyDoc.exists) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }
    
    const company = { id: companyDoc.id, ...companyDoc.data() } as Company;
    
    return NextResponse.json({
      success: true,
      company,
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
