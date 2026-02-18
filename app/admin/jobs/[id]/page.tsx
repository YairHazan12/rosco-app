import { getJob } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, MapPin, Phone, Mail, Calendar, Clock, ExternalLink, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { cls: string }> = {
  Pending:       { cls: "badge-pending" },
  "In Progress": { cls: "badge-in-progress" },
  Completed:     { cls: "badge-completed" },
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(job.location)}&navigate=yes`;
  const cfg = statusConfig[job.status] ?? statusConfig.Pending;

  return (
    <div className="space-y-4 pb-6">
      {/* Back nav */}
      <div>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1 -ml-1 min-h-[44px] px-1"
          style={{ color: "var(--brand)" }}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-[17px]">Jobs</span>
        </Link>

        <div className="flex items-start justify-between gap-3 mt-1">
          <h1
            className="text-[22px] font-bold flex-1 leading-tight"
            style={{ color: "var(--label-primary)", letterSpacing: "-0.4px" }}
          >
            {job.title}
          </h1>
          <Link href={`/admin/jobs/${job.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-9 flex-shrink-0 rounded-xl border"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </Link>
        </div>
        <span className={`inline-block mt-2 ${cfg.cls}`}>{job.status}</span>
      </div>

      {/* Date + Time */}
      <div>
        <p className="ios-section-header mb-2">Schedule</p>
        <div className="ios-group">
          <div className="ios-group-row">
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
              style={{ background: "rgba(0,122,255,0.1)" }}
            >
              <Calendar className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
            </div>
            <div>
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Date</p>
              <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                {format(new Date(job.date), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="ios-group-row">
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
              style={{ background: "rgba(255,107,53,0.1)" }}
            >
              <Clock className="w-[18px] h-[18px]" style={{ color: "var(--brand)" }} />
            </div>
            <div>
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Time</p>
              <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                {format(new Date(job.date), "h:mm a")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="ios-section-header mb-2">Location</p>
        <div className="ios-group">
          <div className="ios-group-row">
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
              style={{ background: "rgba(52,199,89,0.1)" }}
            >
              <MapPin className="w-[18px] h-[18px]" style={{ color: "var(--ios-green)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                {job.location}
              </p>
              <a
                href={wazeUrl}
                target="_blank"
                className="inline-flex items-center gap-1 mt-1 text-[13px] font-medium"
                style={{ color: "#00C8D7" }}
              >
                <ExternalLink className="w-3 h-3" /> Open in Waze
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {job.description && (
        <div>
          <p className="ios-section-header mb-2">Notes</p>
          <div className="ios-card p-4">
            <p
              className="text-[15px] leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--label-primary)" }}
            >
              {job.description}
            </p>
          </div>
        </div>
      )}

      {/* Client */}
      <div>
        <p className="ios-section-header mb-2">Client</p>
        <div className="ios-group">
          <div className="ios-group-row">
            <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
              {job.clientName}
            </p>
          </div>
          {job.clientPhone && (
            <a
              href={`tel:${job.clientPhone}`}
              className="ios-group-row"
              style={{ color: "var(--ios-blue)" }}
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                style={{ background: "rgba(52,199,89,0.1)" }}
              >
                <Phone className="w-[18px] h-[18px]" style={{ color: "var(--ios-green)" }} />
              </div>
              <span className="font-medium text-[15px]" style={{ color: "var(--ios-green)" }}>
                {job.clientPhone}
              </span>
            </a>
          )}
          {job.clientEmail && (
            <a
              href={`mailto:${job.clientEmail}`}
              className="ios-group-row"
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                style={{ background: "rgba(0,122,255,0.1)" }}
              >
                <Mail className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
              </div>
              <span className="font-medium text-[15px]" style={{ color: "var(--ios-blue)" }}>
                {job.clientEmail}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Handyman */}
      <div>
        <p className="ios-section-header mb-2">Handyman</p>
        <div className="ios-group">
          <div className="ios-group-row">
            {job.handymanName ? (
              <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                {job.handymanName}
              </p>
            ) : (
              <p className="text-[15px] italic" style={{ color: "var(--label-quaternary)" }}>
                No handyman assigned
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice */}
      <div>
        <p className="ios-section-header mb-2">Invoice</p>
        <div className="ios-group">
          <div className="ios-group-row">
            {job.invoiceId ? (
              <Link href={`/admin/invoices/${job.invoiceId}`} className="flex items-center w-full">
                <span className="flex-1 font-medium text-[15px]" style={{ color: "var(--ios-blue)" }}>
                  View Invoice →
                </span>
              </Link>
            ) : job.status === "Completed" ? (
              <Link href={`/admin/invoices/new?jobId=${job.id}`} className="w-full">
                <Button className="w-full h-12 rounded-xl text-[16px] font-semibold" style={{ background: "var(--brand)" }}>
                  Create Invoice
                </Button>
              </Link>
            ) : (
              <p className="text-[14px] italic" style={{ color: "var(--label-quaternary)" }}>
                Available once job is completed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
