/**
 * /api/billing/[id]
 *
 * PATCH — Updates a Quote or BillingInvoice (status, fields, etc.)
 *         Body: { docType: "quote" | "invoice", ...fields }
 */
import { NextResponse } from "next/server";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { updateQuote, updateBillingInvoice, getQuote, getBillingInvoice } from "@/lib/billing-db";
import { revalidateTag } from "next/cache";
import type { ActivityEvent } from "@/lib/billing-types";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const companyId = await getCompanyIdFromCookie();
    const body = await req.json();
    const { docType, ...updates } = body;

    if (docType !== "quote" && docType !== "invoice") {
      return NextResponse.json({ error: "Invalid docType" }, { status: 400 });
    }

    // Build activity log entry if status changed
    let activityAppend: ActivityEvent | null = null;
    if (updates.status) {
      const doc = docType === "quote"
        ? await getQuote(id, companyId)
        : await getBillingInvoice(id, companyId);

      if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const label = docType === "quote" ? "Quote" : "Invoice";
      activityAppend = {
        id: genId(),
        type: updates.status,
        timestamp: new Date().toISOString(),
        description: `${label} marked as ${updates.status}`,
      };

      // If marking paid, update amountOutstanding
      if (docType === "invoice" && updates.status === "paid") {
        updates.amountPaid = doc.total;
        updates.amountOutstanding = 0;
      }

      // Append to existing activity log
      updates.activityLog = [...(doc.activityLog ?? []), activityAppend];
    }

    if (docType === "quote") {
      await updateQuote(id, companyId, updates);
      revalidateTag(`billing-quotes-${companyId}`);
    } else {
      await updateBillingInvoice(id, companyId, updates);
      revalidateTag(`billing-invoices-${companyId}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/billing/[id] PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
