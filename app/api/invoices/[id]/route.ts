import { NextResponse } from "next/server";
import { getInvoice, updateInvoice } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Get companyId from cookie (server-side auth), not from query params
  const companyId = await getCompanyIdFromCookie();
  
  const invoice = await getInvoice(id, companyId);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    // Get companyId from cookie (server-side auth), not from body
    const companyId = await getCompanyIdFromCookie();
    const update: Record<string, unknown> = {};
    if (body.status) update.status = body.status;
    if (body.status === "Paid") update.paidAt = new Date().toISOString();
    if (body.stripePaymentLink) update.stripePaymentLink = body.stripePaymentLink;
    if (body.stripeSessionId) update.stripeSessionId = body.stripeSessionId;
    await updateInvoice(id, update, companyId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
