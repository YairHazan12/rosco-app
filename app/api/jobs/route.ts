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
import { getJobs, createJob, getHandyman } from "@/lib/db";
import { getCompanyIdFromCookie, getUserUidFromCookie, getUserRoleFromCookie } from "@/lib/server-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageParam  = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  // Get companyId from cookie (server-side auth), not from query params (security!)
  const companyId = await getCompanyIdFromCookie();
  const userRole = await getUserRoleFromCookie();
  const userUid = await getUserUidFromCookie();

  // RBAC: Handymen only see their own jobs, admins see all
  let allJobs = await getJobs(companyId);
  if (userRole === "handyman" && userUid) {
    allJobs = allJobs.filter(job => job.handymanId === userUid);
  }
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
    // Get companyId from cookie (server-side auth), not from body (security!)
    const companyId = await getCompanyIdFromCookie();
    
    // Look up handyman name from the selected handyman
    let handymanName: string | undefined;
    if (body.handymanId) {
      const handyman = await getHandyman(body.handymanId, companyId);
      handymanName = handyman?.name || undefined;
    }

    // Build job data, excluding undefined values to avoid Firestore errors
    const jobData: Parameters<typeof createJob>[0] = {
      companyId,
      clientName: body.clientName,
      title: body.title,
      date: new Date(body.date).toISOString(),
      location: body.location,
      status: body.status || "Pending",
    };
    if (body.clientPhone) jobData.clientPhone = body.clientPhone;
    if (body.clientEmail) jobData.clientEmail = body.clientEmail;
    if (body.description) jobData.description = body.description;
    if (body.handymanId) jobData.handymanId = body.handymanId;
    if (handymanName) jobData.handymanName = handymanName;

    // Sync customer from job data (create or update customer record)
    const { syncCustomerFromJob } = await import("@/lib/db");
    const customerId = await syncCustomerFromJob({
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      date: jobData.date,
    }, companyId);
    
    if (customerId) {
      jobData.customerId = customerId;
    }

    const job = await createJob(jobData);
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
