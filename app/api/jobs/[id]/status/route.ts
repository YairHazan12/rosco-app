import { NextResponse } from "next/server";
import { updateJob } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const companyId = body.companyId || "DEMO";
  await updateJob(id, { status: body.status }, companyId);
  return NextResponse.json({ success: true });
}
