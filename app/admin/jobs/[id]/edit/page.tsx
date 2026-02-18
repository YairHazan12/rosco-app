import { getJob, getHandymen } from "@/lib/db";
import { notFound } from "next/navigation";
import JobForm from "../../_components/JobForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, handymen] = await Promise.all([getJob(id), getHandymen()]);
  if (!job) notFound();

  return (
    <div>
      <Link
        href={`/admin/jobs/${id}`}
        className="inline-flex items-center gap-1 -ml-1 min-h-[44px] px-1 mb-2"
        style={{ color: "var(--brand)" }}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        <span className="text-[17px]">Job</span>
      </Link>
      <h1 className="ios-title mb-5">Edit Job</h1>
      <JobForm handymen={handymen} job={job} />
    </div>
  );
}
