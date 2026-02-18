import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import InvoiceEditor from "../_components/InvoiceEditor";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  if (!jobId) redirect("/admin/invoices");

  const [job, presets] = await Promise.all([
    prisma.job.findUnique({ where: { id: jobId } }),
    prisma.servicePreset.findMany({ orderBy: { category: "asc" } }),
  ]);

  if (!job) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Invoice</h1>
      <p className="text-gray-500 mb-6">
        For: <span className="font-medium">{job.clientName}</span> — {job.title}
      </p>
      <InvoiceEditor job={job} presets={presets} />
    </div>
  );
}
