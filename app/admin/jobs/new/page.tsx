import { getHandymen, getJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import JobForm from "../_components/JobForm";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const companyId = await getCompanyIdFromCookie();
  const [handymen, allJobs] = await Promise.all([
    getHandymen(companyId),
    getJobs(companyId),
  ]);
  return (
    <div>
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1 -ml-1 min-h-[44px] px-1 mb-2"
        style={{ color: "var(--brand)" }}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        <span className="text-[17px]">Jobs</span>
      </Link>
      <h1 className="ios-title mb-5">New Job</h1>
      <JobForm handymen={handymen} allJobs={allJobs} />
    </div>
  );
}
