import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { job: true, items: true },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, items, vatEnabled, vatRate, subtotal, vatAmount, total } = body;

    const invoice = await prisma.invoice.create({
      data: {
        jobId,
        vatEnabled,
        vatRate,
        subtotal,
        vatAmount,
        total,
        status: "Draft",
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number; total: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
