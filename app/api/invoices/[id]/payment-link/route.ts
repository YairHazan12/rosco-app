import { NextResponse } from "next/server";
import { getInvoice, updateInvoice } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { db as adminDb } from "@/lib/firebase-admin";
import type { Company } from "@/lib/auth-types";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Get companyId from cookie (server-side auth)
  const companyId = await getCompanyIdFromCookie();
  const invoice = await getInvoice(id, companyId);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Mock implementation if no Paystack key
  if (!paystackKey || paystackKey === "sk_test_placeholder") {
    const mockLink = `${appUrl}/pay/${invoice.id}`;
    await updateInvoice(id, { paystackAuthorizationUrl: mockLink, status: "Sent" }, companyId);
    return NextResponse.json({ paymentLink: mockLink });
  }

  try {
    // Fetch company to get subaccount code
    const companyDoc = await adminDb.collection("companies").doc(companyId).get();
    const company = companyDoc.exists ? (companyDoc.data() as Company) : null;
    
    // Generate unique reference
    const reference = `ROSCO-${invoice.id}-${Date.now()}`;
    
    // Build transaction payload
    const transactionPayload: any = {
      email: invoice.clientEmail || "customer@example.com",
      amount: Math.round(invoice.total * 100), // Convert to kobo (cents)
      currency: "ZAR",
      reference,
      callback_url: `${appUrl}/pay/${invoice.id}/success`,
      metadata: {
        invoiceId: invoice.id,
        companyId: invoice.companyId,
        clientName: invoice.clientName,
        handymanName: invoice.handymanName,
        jobTitle: invoice.jobTitle,
        custom_fields: [
          {
            display_name: "Invoice ID",
            variable_name: "invoice_id",
            value: invoice.id,
          },
          {
            display_name: "Job Title",
            variable_name: "job_title",
            value: invoice.jobTitle,
          },
        ],
      },
    };
    
    // Add subaccount for split payment if available
    // Split is configured in the subaccount: 95% to company, 5% to platform
    if (company?.subaccountCode) {
      transactionPayload.subaccount = company.subaccountCode;
      console.log(`💰 Split payment enabled: 95% → ${company.name}, 5% → ROSCO Platform`);
    } else {
      console.warn(`⚠️  No subaccount found for company ${companyId}, full payment goes to platform account`);
    }
    
    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Paystack API error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Paystack initialization failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.status || !data.data) {
      console.error("Invalid Paystack response:", data);
      return NextResponse.json(
        { error: "Invalid response from Paystack" },
        { status: 500 }
      );
    }

    // Update invoice with Paystack details
    await updateInvoice(
      id,
      {
        paystackReference: reference,
        paystackAccessCode: data.data.access_code,
        paystackAuthorizationUrl: data.data.authorization_url,
        status: "Sent",
      },
      companyId
    );

    return NextResponse.json({ paymentLink: data.data.authorization_url });
  } catch (e) {
    console.error("Paystack error:", e);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}
