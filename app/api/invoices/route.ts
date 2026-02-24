/**
 * /api/invoices
 *
 * GET  — Returns invoices with optional pagination.
 *         Query params: ?page=1&limit=10 (defaults: page=1, limit=10)
 *         Response: { data: Invoice[], total: number, page: number, totalPages: number }
 *         Also carries a short-lived Cache-Control header.
 * POST — Creates a new invoice and revalidates "invoices" + "jobs" cache tags.
 */
import { NextResponse } from "next/server";
import { getInvoices, createInvoice, getJob } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageParam  = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const companyId  = searchParams.get("companyId") || "DEMO";

  const allInvoices = await getInvoices(companyId);
  const total       = allInvoices.length;

  const page  = Math.max(1, parseInt(pageParam  ?? "1",  10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(limitParam ?? "10", 10) || 10));

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage   = Math.min(page, totalPages);
  const startIdx   = (safePage - 1) * limit;
  const data       = allInvoices.slice(startIdx, startIdx + limit);

  return NextResponse.json(
    { data, total, page: safePage, totalPages },
    {
      headers: {
        // Match server-side cache: 5 min cache + 5 min stale-while-revalidate
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      },
    },
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = body.companyId || "DEMO";
    const job = await getJob(body.jobId, companyId);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const invoice = await createInvoice({
      companyId,
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
