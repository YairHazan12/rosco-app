import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateInvoice } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Get the signature from the headers
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.error("No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Get the raw body as text
    const body = await req.text();

    // Verify the signature
    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the event
    const event = JSON.parse(body);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, metadata, amount } = event.data;
      const invoiceId = metadata?.invoiceId;
      const companyId = metadata?.companyId || "DEMO";

      console.log(`[💰 Webhook] charge.success received:`, {
        invoiceId,
        companyId,
        reference,
        amount,
        fullMetadata: metadata,
      });

      if (!invoiceId) {
        console.error("❌ No invoice ID in webhook metadata");
        return NextResponse.json({ error: "No invoice ID" }, { status: 400 });
      }

      if (!companyId || companyId === "DEMO") {
        console.warn(`⚠️  CompanyId missing or defaulted to DEMO. Metadata:`, metadata);
      }

      try {
        console.log(`[🔥 Webhook → DB] Updating invoice ${invoiceId} for company ${companyId}`);
        
        await updateInvoice(
          invoiceId,
          {
            status: "Paid",
            paidAt: new Date().toISOString(),
            paystackReference: reference,
          },
          companyId
        );

        console.log(`✅ Invoice ${invoiceId} marked as paid (company: ${companyId}, reference: ${reference})`);
        console.log(`[♻️ Webhook] Cache should be invalidated for "invoices-${companyId}"`);
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("❌ Error updating invoice:", error);
        return NextResponse.json(
          { error: "Failed to update invoice" },
          { status: 500 }
        );
      }
    }

    // For other events, just acknowledge
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
