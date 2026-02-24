/**
 * /api/jobs
 *
 * GET  — Returns jobs with optional pagination.
 *         Query params: ?page=1&limit=10 (defaults: page=1, limit=10)
 *         Response: { data: Job[], total: number, page: number, totalPages: number }
 *         Also carries a short-lived Cache-Control header so
 *         repeated client fetches within 30 s don't even reach the server.
 * POST — Creates a new job and revalidates the "jobs" cache tag.
 */
import { NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageParam  = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const allJobs = await getJobs();
  const total   = allJobs.length;

  const page  = Math.max(1, parseInt(pageParam  ?? "1",  10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(limitParam ?? "10", 10) || 10));

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage   = Math.min(page, totalPages);
  const startIdx   = (safePage - 1) * limit;
  const data       = allJobs.slice(startIdx, startIdx + limit);

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
    const job = await createJob({
      clientName: body.clientName,
      clientPhone: body.clientPhone || undefined,
      clientEmail: body.clientEmail || undefined,
      title: body.title,
      description: body.description || undefined,
      date: new Date(body.date).toISOString(),
      location: body.location,
      status: body.status || "Pending",
      handymanId: body.handymanId || undefined,
      handymanName: body.handymanName || undefined,
    });
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
