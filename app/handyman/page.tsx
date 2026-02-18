import { getJobs } from "@/lib/db";
import Link from "next/link";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import type { Job } from "@/lib/types";
import ScheduleTabs from "./_components/ScheduleTabs";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; cls: string }> = {
  Pending:       { label: "Pending",     cls: "badge-pending" },
  "In Progress": { label: "In Progress", cls: "badge-in-progress" },
  Completed:     { label: "Completed",   cls: "badge-completed" },
};

export default async function HandymanSchedulePage() {
  // Fetch all jobs — the calendar needs the full picture
  const allJobs = await getJobs();

  const today     = startOfDay(new Date());
  const weekEnd   = addDays(today, 7);

  // Upcoming non-completed jobs for the list view (next 7 days)
  const upcomingJobs = allJobs
    .filter(j => {
      const d = new Date(j.date);
      return d >= today && d <= weekEnd && j.status !== "Completed";
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Jobs sorted ascending for the calendar
  const calendarJobs = [...allJobs].sort((a, b) => a.date.localeCompare(b.date));

  // Group list jobs by date
  const grouped: Record<string, typeof upcomingJobs> = {};
  for (const job of upcomingJobs) {
    const key = format(new Date(job.date), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(job);
  }

  const dayLabel = (dateKey: string) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (isSameDay(date, today))              return "Today";
    if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
    return format(date, "EEEE, MMMM d");
  };

  const todayKey  = format(today, "yyyy-MM-dd");
  const todayJobs = grouped[todayKey] ?? [];
  const otherDays = Object.entries(grouped).filter(([k]) => k !== todayKey);

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[13px] font-medium" style={{ color: "var(--label-tertiary)" }}>
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="ios-large-title mt-0.5">Schedule</h1>
      </div>

      {/* ScheduleTabs wraps List + Calendar with a tab switcher */}
      <ScheduleTabs jobs={calendarJobs}>
        {/* List view — server-rendered, passed as children */}
        {upcomingJobs.length === 0 ? (
          <div
            className="ios-card flex flex-col items-center text-center py-14 px-6"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(52,199,89,0.12)" }}
            >
              <span className="text-3xl">🎉</span>
            </div>
            <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
              All Clear!
            </p>
            <p className="text-[15px] mt-1" style={{ color: "var(--label-secondary)" }}>
              No jobs scheduled for the next 7 days
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TODAY section — prominent */}
            {todayJobs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <p className="ios-section-header">Today</p>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--brand)" }}>
                    {todayJobs.length} {todayJobs.length === 1 ? "job" : "jobs"}
                  </span>
                </div>
                <div className="space-y-3">
                  {todayJobs.map(job => (
                    <JobCard key={job.id} job={job} isToday />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming days */}
            {otherDays.map(([dateKey, dayJobs]) => (
              <section key={dateKey}>
                <p className="ios-section-header mb-3">{dayLabel(dateKey)}</p>
                <div className="space-y-2">
                  {dayJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </ScheduleTabs>
    </div>
  );
}

// ─── Job card (server component) ─────────────────────────────────────────────

function JobCard({ job, isToday }: { job: Job; isToday?: boolean }) {
  const status = statusConfig[job.status] ?? { label: job.status, cls: "badge-pending" };

  return (
    <Link href={`/handyman/jobs/${job.id}`} className="block touch-scale">
      <div
        className="ios-card overflow-hidden"
        style={isToday ? { borderLeft: "4px solid var(--brand)" } : undefined}
      >
        <div className="p-4">
          {/* Time + badge */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--label-tertiary)" }} />
              <span className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                {format(new Date(job.date), "h:mm a")}
              </span>
            </div>
            <span className={status.cls}>{status.label}</span>
          </div>

          {/* Title */}
          <p className="font-semibold text-[17px] leading-snug" style={{ color: "var(--label-primary)" }}>
            {job.title}
          </p>
          <p className="text-[14px] mt-0.5" style={{ color: "var(--label-secondary)" }}>
            {job.clientName}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--label-quaternary)" }} />
            <span className="text-[13px] truncate" style={{ color: "var(--label-tertiary)" }}>
              {job.location}
            </span>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: "0.5px solid var(--separator)" }}
          >
            <span className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
              {job.handymanName ? `👤 ${job.handymanName}` : "Unassigned"}
            </span>
            <ChevronRight className="w-[18px] h-[18px]" style={{ color: "var(--label-quaternary)" }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
