/**
 * /api/billing
 *
 * POST — Creates a new Quote or BillingInvoice.
 *        Body must include `docType: "quote" | "invoice"` plus document fields.
 *        Returns { id: string }
 */
import { NextResponse } from "next/server";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { createQuote, createBillingInvoice } from "@/lib/billing-db";
import { revalidateTag } from "next/cache";

// Shared company + banking fields pulled from request body
function companyFields(data: Record<string, unknown>) {
  return {
    companyName: data.companyName as string | undefined,
    companyVatNumber: data.companyVatNumber as string | undefined,
    companyRegistrationNumber: data.companyRegistrationNumber as string | undefined,
    companyAddress: data.companyAddress as string | undefined,
    companyPhone: data.companyPhone as string | undefined,
    companyEmail: data.companyEmail as string | undefined,
    bankName: data.bankName as string | undefined,
    bankAccountHolder: data.bankAccountHolder as string | undefined,
    bankAccountNumber: data.bankAccountNumber as string | undefined,
    branchCode: data.branchCode as string | undefined,
    bankAccountType: data.bankAccountType as string | undefined,
  };
}

export async function POST(req: Request) {
  try {
    const companyId = await getCompanyIdFromCookie();
    const body = await req.json();
    const { docType, ...data } = body;

    if (docType !== "quote" && docType !== "invoice") {
      return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
    }

    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (docType === "quote") {
      const quote = await createQuote(companyId, {
        type: "quote",
        documentNumber: data.documentNumber,
        title: data.title,
        status: data.status ?? "draft",
        ...companyFields(data),
        clientId: data.clientId,
        clientName: data.clientName ?? "Unknown Client",
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        clientVatNumber: data.clientVatNumber,
        issueDate: data.issueDate,
        validUntil: data.validUntil,
        poNumber: data.poNumber,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        lineItems: data.lineItems ?? [],
        subtotal: data.subtotal ?? 0,
        vatTotal: data.vatTotal ?? 0,
        total: data.total ?? 0,
        depositRequired: data.depositRequired ?? false,
        depositPercentage: data.depositPercentage,
        depositAmount: data.depositAmount,
        activityLog: data.activityLog ?? [],
      });
      revalidateTag(`billing-quotes-${companyId}`);
      return NextResponse.json({ id: quote.id });
    } else {
      const invoice = await createBillingInvoice(companyId, {
        type: "invoice",
        documentNumber: data.documentNumber,
        title: data.title,
        status: data.status ?? "draft",
        ...companyFields(data),
        clientId: data.clientId,
        clientName: data.clientName ?? "Unknown Client",
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        clientVatNumber: data.clientVatNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        poNumber: data.poNumber,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        lineItems: data.lineItems ?? [],
        subtotal: data.subtotal ?? 0,
        vatTotal: data.vatTotal ?? 0,
        total: data.total ?? 0,
        amountPaid: 0,
        amountOutstanding: data.total ?? 0,
        depositRequired: data.depositRequired ?? false,
        depositPercentage: data.depositPercentage,
        depositAmount: data.depositAmount,
        sourceQuoteId: data.sourceQuoteId,
        activityLog: data.activityLog ?? [],
      });
      revalidateTag(`billing-invoices-${companyId}`);
      return NextResponse.json({ id: invoice.id });
    }
  } catch (err) {
    console.error("[/api/billing POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
