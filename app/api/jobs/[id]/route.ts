import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { handyman: true, invoice: { include: { items: true } } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const job = await prisma.job.update({
      where: { id },
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone || null,
        clientEmail: body.clientEmail || null,
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        location: body.location,
        status: body.status,
        handymanId: body.handymanId || null,
      },
    });
    return NextResponse.json(job);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
