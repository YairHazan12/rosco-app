import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/db";
import { getCompanyIdFromCookie, getUserUidFromCookie, getUserRoleFromCookie } from "@/lib/server-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const companyId = await getCompanyIdFromCookie();
    const userRole = await getUserRoleFromCookie();
    const userUid = await getUserUidFromCookie();
    
    // RBAC: Handymen can only update their own jobs' status
    if (userRole === "handyman" && userUid) {
      const job = await getJob(id, companyId);
      if (!job || job.handymanId !== userUid) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    
    await updateJob(id, { status: body.status }, companyId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to update job status:", e);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
