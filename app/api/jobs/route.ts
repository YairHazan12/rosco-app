/**
 * /api/jobs
 *
 * GET  — Returns all jobs (server-side cached via unstable_cache, 60 s).
 *         Response also carries a short-lived Cache-Control header so
 *         repeated client fetches within 30 s don't even reach the server.
 * POST — Creates a new job and revalidates the "jobs" cache tag.
 */
import { NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/db";

export async function GET() {
  const jobs = await getJobs();
  return NextResponse.json(jobs, {
    headers: {
      // Allow CDN / browser to cache for 30 s; stale-while-revalidate another 30 s
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
    },
  });
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
