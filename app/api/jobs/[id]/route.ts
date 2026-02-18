import { NextResponse } from "next/server";
import { getJob, updateJob, deleteJob, getHandyman } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();

    // Resolve handyman name if ID provided
    let handymanName: string | undefined;
    if (body.handymanId) {
      const h = await getHandyman(body.handymanId);
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
