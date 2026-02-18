import { getJob, getServicePresets } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import InvoiceEditor from "../_components/InvoiceEditor";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  if (!jobId) redirect("/admin/invoices");

  const [job, presets] = await Promise.all([getJob(jobId), getServicePresets()]);
  if (!job) notFound();

  return (
    <div>
      <Link
        href={`/admin/jobs/${jobId}`}
        className="inline-flex items-center gap-1 -ml-1 min-h-[44px] px-1 mb-2"
        style={{ color: "var(--brand)" }}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        <span className="text-[17px]">Job</span>
      </Link>
      <h1 className="ios-title mb-1">Create Invoice</h1>
      <p className="text-[14px] mb-5" style={{ color: "var(--label-tertiary)" }}>
        {job.clientName} — {job.title}
      </p>
      <InvoiceEditor job={job} presets={presets} />
    </div>
  );
}
