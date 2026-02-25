import { NextResponse } from "next/server";
import { updateJob } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // Get companyId from cookie (server-side auth), not from body
  const companyId = await getCompanyIdFromCookie();
  await updateJob(id, { status: body.status }, companyId);
  return NextResponse.json({ success: true });
}
