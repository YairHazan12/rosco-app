/**
 * /api/billing/convert
 *
 * POST — Converts an accepted Quote into a BillingInvoice.
 *        Body: { quoteId: string }
 *        Returns: { id: string }  (new invoice id)
 */
import { NextResponse } from "next/server";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getQuote, createBillingInvoice, updateQuote, getNextDocumentNumber } from "@/lib/billing-db";
import { revalidateTag } from "next/cache";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: Request) {
  try {
    const companyId = await getCompanyIdFromCookie();
    const { quoteId } = await req.json();

    if (!quoteId) {
      return NextResponse.json({ error: "quoteId is required" }, { status: 400 });
    }

    const quote = await getQuote(quoteId, companyId);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const documentNumber = await getNextDocumentNumber(companyId, "invoice");
    const now = new Date().toISOString();

    // Default due date: 30 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await createBillingInvoice(companyId, {
      type: "invoice",
      documentNumber,
      title: quote.title,
      status: "draft",
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientPhone: quote.clientPhone,
      clientAddress: quote.clientAddress,
      jobId: quote.jobId,
      jobTitle: quote.jobTitle,
      issueDate: now.split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      poNumber: quote.poNumber,
      notes: quote.notes,
      lineItems: quote.lineItems,
      subtotal: quote.subtotal,
      vatTotal: quote.vatTotal,
      total: quote.total,
      amountPaid: 0,
      amountOutstanding: quote.total,
      depositRequired: quote.depositRequired,
      depositAmount: quote.depositAmount,
      depositPercentage: quote.depositPercentage,
      sourceQuoteId: quote.id,
      activityLog: [
        {
          id: genId(),
          type: "created",
          timestamp: now,
          description: `Invoice ${documentNumber} created from quote ${quote.documentNumber}`,
        },
        {
          id: genId(),
          type: "converted",
          timestamp: now,
          description: `Converted from quote ${quote.documentNumber}`,
        },
      ],
    });

    // Mark the quote as converted
    await updateQuote(quoteId, companyId, {
      activityLog: [
        ...quote.activityLog,
        {
          id: genId(),
          type: "converted",
          timestamp: now,
          description: `Converted to invoice ${documentNumber}`,
        },
      ],
    });

    revalidateTag(`billing-quotes-${companyId}`);
    revalidateTag(`billing-invoices-${companyId}`);

    return NextResponse.json({ id: invoice.id });
  } catch (err) {
    console.error("[/api/billing/convert POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
