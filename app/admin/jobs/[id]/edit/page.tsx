import { getJob, getHandymen } from "@/lib/db";
import { notFound } from "next/navigation";
import JobForm from "../../_components/JobForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, handymen] = await Promise.all([getJob(id), getHandymen()]);
  if (!job) notFound();

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/jobs/${id}`} className="text-sm text-gray-400 hover:text-gray-600">← Back to Job</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-2">Edit Job</h1>
      <JobForm handymen={handymen} job={job} />
    </div>
  );
}
