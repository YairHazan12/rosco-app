import { NextResponse } from "next/server";
import { updateJob } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  await updateJob(id, { status });
  return NextResponse.json({ success: true });
}
