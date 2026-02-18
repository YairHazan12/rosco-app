import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, MapPin, Phone, Mail, Calendar, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { handyman: true, invoice: { include: { items: true } } },
  });
  if (!job) notFound();

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(job.location)}&navigate=yes`;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <Link href="/admin/jobs" className="text-sm text-gray-400 active:text-gray-600">← Jobs</Link>
        <div className="flex items-start justify-between mt-2 gap-2">
          <h1 className="text-xl font-bold text-gray-900 flex-1">{job.title}</h1>
          <Link href={`/admin/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 flex-shrink-0">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </Link>
        </div>
        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyles[job.status] || "bg-gray-100"}`}>
          {job.status}
        </span>
      </div>

      {/* Date/Time card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm font-semibold">{format(new Date(job.date), "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Time</p>
              <p className="text-sm font-semibold">{format(new Date(job.date), "h:mm a")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Location with Waze button */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Location</p>
            <p className="text-sm font-semibold">{job.location}</p>
            <a
              href={wazeUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#00C8D7] font-medium"
            >
              <ExternalLink className="w-3 h-3" /> Open in Waze
            </a>
          </div>
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-400 mb-1">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>
      )}

      {/* Client */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</p>
        <p className="font-semibold text-gray-900">{job.clientName}</p>
        {job.clientPhone && (
          <a href={`tel:${job.clientPhone}`} className="flex items-center gap-2 text-blue-600 active:text-blue-800">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{job.clientPhone}</span>
          </a>
        )}
        {job.clientEmail && (
          <a href={`mailto:${job.clientEmail}`} className="flex items-center gap-2 text-blue-600 active:text-blue-800">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{job.clientEmail}</span>
          </a>
        )}
      </div>

      {/* Handyman */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Handyman</p>
        {job.handyman ? (
          <div>
            <p className="font-semibold text-gray-900">{job.handyman.name}</p>
            {job.handyman.phone && (
              <a href={`tel:${job.handyman.phone}`} className="text-sm text-blue-600">{job.handyman.phone}</a>
            )}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">No handyman assigned</p>
        )}
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Invoice</p>
        {job.invoice ? (
          <Link href={`/admin/invoices/${job.invoice.id}`}>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 active:bg-gray-100 transition-colors">
              <div>
                <span className="text-sm font-medium">{job.invoice.status}</span>
                <p className="text-xs text-gray-400 mt-0.5">₪{job.invoice.total.toFixed(2)}</p>
              </div>
              <span className="text-blue-500 text-sm">View →</span>
            </div>
          </Link>
        ) : job.status === "Completed" ? (
          <Link href={`/admin/invoices/new?jobId=${job.id}`}>
            <Button className="w-full h-12">Create Invoice</Button>
          </Link>
        ) : (
          <p className="text-sm text-gray-400">Available once job is completed</p>
        )}
      </div>
    </div>
  );
}
