/**
 * /api/invoices
 *
 * GET  — Returns all invoices (server-side cached via unstable_cache, 60 s).
 *         Response carries a short-lived Cache-Control header.
 * POST — Creates a new invoice and revalidates "invoices" + "jobs" cache tags.
 */
import { NextResponse } from "next/server";
import { getInvoices, createInvoice, getJob } from "@/lib/db";

export async function GET() {
  const invoices = await getInvoices();
  return NextResponse.json(invoices, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
    },
  });
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
