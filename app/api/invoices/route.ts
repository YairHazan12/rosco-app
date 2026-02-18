import { NextResponse } from "next/server";
import { getInvoices, createInvoice, getJob } from "@/lib/db";

export async function GET() {
  const invoices = await getInvoices();
  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const job = await getJob(body.jobId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const invoice = await createInvoice({
      jobId: body.jobId,
      clientName: job.clientName,
      clientEmail: job.clientEmail,
      clientPhone: job.clientPhone,
      jobTitle: job.title,
      jobDate: job.date,
      jobLocation: job.location,
      handymanName: job.handymanName,
      items: body.items,
      subtotal: body.subtotal,
      vatEnabled: body.vatEnabled,
      vatRate: body.vatRate,
      vatAmount: body.vatAmount,
      total: body.total,
      status: "Draft",
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
