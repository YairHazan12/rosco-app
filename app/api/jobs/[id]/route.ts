/**
 * /api/jobs/[id]
 *
 * GET    — Returns a single job (derived from cached jobs collection, 0 extra reads).
 * PUT    — Updates job, revalidates "jobs" tag.
 * DELETE — Deletes job, revalidates "jobs" tag.
 */
import { NextResponse } from "next/server";
import { getJob, updateJob, deleteJob, getHandyman } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id); // derived from cached collection, 0 Firestore reads on hit
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" },
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();

    let handymanName: string | undefined;
    if (body.handymanId) {
      const h = await getHandyman(body.handymanId); // from cached handymen collection
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
    });

    const updated = await getJob(id);
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteJob(id);
  return NextResponse.json({ success: true });
}
