import { getHandymen } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import JobForm from "../_components/JobForm";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const handymen = await getHandymen();
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
      <JobForm handymen={handymen} />
    </div>
  );
}
