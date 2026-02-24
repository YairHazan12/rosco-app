import { NextResponse } from "next/server";
import { getInvoice, updateInvoice } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "DEMO";
  
  const invoice = await getInvoice(id, companyId);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const companyId = body.companyId || "DEMO";
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
