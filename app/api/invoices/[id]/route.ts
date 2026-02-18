import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { job: true, items: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.status) updateData.status = body.status;
    if (body.status === "Paid") updateData.paidAt = new Date();
    if (body.stripePaymentLink) updateData.stripePaymentLink = body.stripePaymentLink;
    if (body.stripeSessionId) updateData.stripeSessionId = body.stripeSessionId;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
