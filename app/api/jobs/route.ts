import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const jobs = await prisma.job.findMany({
    orderBy: { date: "desc" },
    include: { handyman: true, invoice: true },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const job = await prisma.job.create({
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone || null,
        clientEmail: body.clientEmail || null,
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        location: body.location,
        status: body.status || "Pending",
        handymanId: body.handymanId || null,
      },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
