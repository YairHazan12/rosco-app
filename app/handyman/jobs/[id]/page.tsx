import { getJob } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Calendar, Clock, ChevronLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import MarkDoneButton from "./_components/MarkDoneButton";
import WazeButton from "./_components/WazeButton";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; cls: string }> = {
  Pending:       { label: "Pending",     cls: "badge-pending" },
  "In Progress": { label: "In Progress", cls: "badge-in-progress" },
  Completed:     { label: "Completed",   cls: "badge-completed" },
};

// ─── Google Calendar URL helper ───────────────────────────────────────────────

function googleCalendarUrl(job: Job): string {
  const start = new Date(job.date);
  const end   = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

  // Format: YYYYMMDDTHHmmssZ
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(".000", "");

  const details = [
    `Client: ${job.clientName}`,
    job.clientPhone  ? `Phone: ${job.clientPhone}`     : "",
    job.handymanName ? `Handyman: ${job.handymanName}` : "",
    job.description  ? `Notes: ${job.description}`     : "",
  ].filter(Boolean).join("\n");

  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     job.title,
    dates:    `${fmt(start)}/${fmt(end)}`,
    location: job.location,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HandymanJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const isCompleted = job.status === "Completed";
  const status      = statusConfig[job.status] ?? { label: job.status, cls: "badge-pending" };
  const gcalUrl     = googleCalendarUrl(job);

  return (
    <div className={isCompleted ? "space-y-3 pb-4" : "space-y-3 pb-40"}>
      {/* Back nav + title */}
      <div className="pt-1">
        <Link
          href="/handyman"
          className="inline-flex items-center gap-1 mb-3 -ml-1 min-h-[44px] px-1"
          style={{ color: "var(--brand)" }}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-[17px]">Schedule</span>
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1
            className="font-bold text-[22px] leading-tight flex-1"
            style={{ color: "var(--label-primary)", letterSpacing: "-0.4px" }}
          >
            {job.title}
          </h1>
          <span className={`${status.cls} flex-shrink-0 mt-1`}>{status.label}</span>
        </div>
        <p className="text-[15px] mt-1" style={{ color: "var(--label-secondary)" }}>
          {job.clientName}
        </p>
      </div>

      {/* Date & Time */}
      <div className="ios-group">
        <div className="ios-group-row">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
            style={{ background: "rgba(0,122,255,0.12)" }}
          >
            <Calendar className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Date</p>
            <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
              {format(new Date(job.date), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="ios-group-row">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
            style={{ background: "rgba(255,107,53,0.12)" }}
          >
            <Clock className="w-[18px] h-[18px]" style={{ color: "var(--brand)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Time</p>
            <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
              {format(new Date(job.date), "h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {/* Add to Google Calendar */}
      <a
        href={gcalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 ios-card p-4 touch-scale"
        style={{ textDecoration: "none" }}
      >
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(52,199,89,0.12)" }}
        >
          {/* Google Calendar icon (simplified) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="var(--ios-green)" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="var(--ios-green)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="var(--ios-green)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
            Add to Google Calendar
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
            {format(new Date(job.date), "EEE, MMM d 'at' h:mm a")}
          </p>
        </div>
        <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: "var(--label-quaternary)" }} />
      </a>

      {/* Waze Navigation */}
      <WazeButton address={job.location} />

      {/* Notes */}
      {job.description && (
        <div className="ios-group">
          <div className="p-4">
            <p className="ios-section-header mb-2">Notes</p>
            <p
              className="text-[15px] leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--label-primary)" }}
            >
              {job.description}
            </p>
          </div>
        </div>
      )}

      {/* Client info */}
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
              style={{ color: "var(--ios-green)" }}
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                style={{ background: "rgba(52,199,89,0.12)" }}
              >
                <Phone className="w-[18px] h-[18px]" style={{ color: "var(--ios-green)" }} />
              </div>
              <span className="font-medium text-[15px]">{job.clientPhone}</span>
            </a>
          )}
          {job.clientEmail && (
            <a
              href={`mailto:${job.clientEmail}`}
              className="ios-group-row"
              style={{ color: "var(--ios-blue)" }}
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                style={{ background: "rgba(0,122,255,0.1)" }}
              >
                <Mail className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
              </div>
              <span className="font-medium text-[15px] truncate">{job.clientEmail}</span>
            </a>
          )}
        </div>
      </div>

      {/* Completed state */}
      {isCompleted && (
        <div
          className="ios-card p-6 text-center"
          style={{ background: "rgba(52,199,89,0.08)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 animate-circle-scale"
            style={{ background: "var(--ios-green)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5L9.5 17L19 8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-bold text-[18px]" style={{ color: "#248A3D" }}>
            Job Complete!
          </p>
          {job.invoiceId && (
            <p className="text-[14px] mt-1" style={{ color: "rgba(36,138,61,0.7)" }}>
              Invoice created ✓
            </p>
          )}
        </div>
      )}

      {!isCompleted && <MarkDoneButton jobId={job.id} currentStatus={job.status} />}
    </div>
  );
}
