/**
 * /api/jobs/[id]
 *
 * GET    — Returns a single job (derived from cached jobs collection, 0 extra reads).
 * PUT    — Updates job, revalidates "jobs" tag.
 * DELETE — Deletes job, revalidates "jobs" tag.
 */
import { NextResponse } from "next/server";
import { getJob, updateJob, deleteJob, getHandyman } from "@/lib/db";
import { getCompanyIdFromCookie, getUserUidFromCookie, getUserRoleFromCookie } from "@/lib/server-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await getCompanyIdFromCookie();
  const userRole = await getUserRoleFromCookie();
  const userUid = await getUserUidFromCookie();
  
  const job = await getJob(id, companyId);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  // RBAC: Handymen can only access their own jobs
  if (userRole === "handyman" && userUid && job.handymanId !== userUid) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  return NextResponse.json(job, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    // Get companyId from cookie (server-side auth), not from body
    const companyId = await getCompanyIdFromCookie();

    let handymanName: string | undefined;
    if (body.handymanId) {
      const h = await getHandyman(body.handymanId, companyId); // from cached handymen collection
      handymanName = h?.name;
    }

    await updateJob(id, {
      clientName: body.clientName,
      clientPhone: body.clientPhone || undefined,
      clientEmail: body.clientEmail || undefined,
      title: body.title,
      description: body.description || undefined,
      date: new Date(body.date).toISOString(),
      location: body.location,
      status: body.status,
      handymanId: body.handymanId || undefined,
      handymanName,
    }, companyId);

    const updated = await getJob(id, companyId);
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Get companyId from cookie (server-side auth), not from query params
  const companyId = await getCompanyIdFromCookie();
  
  await deleteJob(id, companyId);
  return NextResponse.json({ success: true });
}
