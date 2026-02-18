"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { Clock, MapPin, ChevronRight, ChevronLeft, Download } from "lucide-react";
import type { Job } from "@/lib/types";

// ─── ICS helpers ─────────────────────────────────────────────────────────────

function fmtICS(d: Date): string {
  // Format: 20260218T100000Z
  return d.toISOString().replace(/[-:]/g, "").replace(".000", "");
}

function buildICS(jobs: Job[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ROSCO//Handyman App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:ROSCO Jobs",
  ];

  for (const job of jobs) {
    const start = new Date(job.date);
    const end   = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    const desc  = [
      `Client: ${job.clientName}`,
      job.clientPhone   ? `Phone: ${job.clientPhone}`         : "",
      job.handymanName  ? `Handyman: ${job.handymanName}`     : "",
      job.description   ? `Notes: ${job.description}`         : "",
    ].filter(Boolean).join("\\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:rosco-job-${job.id}@rosco.app`,
      `DTSTAMP:${fmtICS(new Date())}`,
      `DTSTART:${fmtICS(start)}`,
      `DTEND:${fmtICS(end)}`,
      `SUMMARY:${job.title.replace(/,/g, "\\,")}`,
      `LOCATION:${job.location.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${desc}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(jobs: Job[]) {
  const content = buildICS(jobs);
  const blob    = new Blob([content], { type: "text/calendar;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = "rosco-jobs.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Pending:       "var(--ios-orange)",
  "In Progress": "var(--ios-blue)",
  Completed:     "var(--ios-green)",
};

const STATUS_BADGE: Record<string, string> = {
  Pending:       "badge-pending",
  "In Progress": "badge-in-progress",
  Completed:     "badge-completed",
};

// ─── Calendar View ────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarView({ jobs }: { jobs: Job[] }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDay,  setSelectedDay]  = useState<Date>(today);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 }); // Mon
  const calEnd     = endOfWeek(monthEnd,     { weekStartsOn: 1 });
  const calDays    = eachDayOfInterval({ start: calStart, end: calEnd });

  const jobsOnDay = useCallback(
    (day: Date) => jobs.filter(j => isSameDay(new Date(j.date), day)),
    [jobs],
  );

  const selectedJobs = jobsOnDay(selectedDay);

  return (
    <div className="space-y-4">
      {/* Calendar card */}
      <div className="ios-card p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "var(--bg-grouped)" }}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </button>
          <h2
            className="font-bold text-[17px]"
            style={{ color: "var(--label-primary)", letterSpacing: "-0.3px" }}
          >
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "var(--bg-grouped)" }}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => (
            <div
              key={d}
              className="text-center text-[11px] font-semibold py-1"
              style={{ color: "var(--label-tertiary)" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {calDays.map(day => {
            const dayJobs    = jobsOnDay(day);
            const isToday    = isSameDay(day, today);
            const isInMonth  = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className="flex flex-col items-center py-1 rounded-xl transition-colors duration-150"
                style={{
                  background: isSelected
                    ? "var(--brand)"
                    : isToday && !isSelected
                    ? "rgba(255,107,53,0.1)"
                    : "transparent",
                }}
              >
                {/* Day number */}
                <span
                  className="text-[14px] w-8 h-8 flex items-center justify-center rounded-full"
                  style={{
                    color: isSelected
                      ? "#fff"
                      : isToday
                      ? "var(--brand)"
                      : isInMonth
                      ? "var(--label-primary)"
                      : "var(--label-quaternary)",
                    fontWeight: isToday || isSelected ? 700 : 400,
                  }}
                >
                  {format(day, "d")}
                </span>

                {/* Job-status dots (up to 3) */}
                <div className="flex gap-0.5 mt-0.5 h-1.5 items-center justify-center">
                  {dayJobs.slice(0, 3).map((job, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: isSelected
                          ? "rgba(255,255,255,0.75)"
                          : STATUS_COLORS[job.status] ?? "var(--label-quaternary)",
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected-day jobs */}
      <div>
        <p className="ios-section-header mb-3">
          {isSameDay(selectedDay, today)
            ? "Today"
            : format(selectedDay, "EEEE, MMMM d")}
        </p>

        {selectedJobs.length === 0 ? (
          <div
            className="ios-card p-8 text-center"
            style={{ border: "1.5px dashed var(--separator)" }}
          >
            <span className="text-2xl">📅</span>
            <p className="font-semibold text-[15px] mt-2" style={{ color: "var(--label-secondary)" }}>
              No jobs this day
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedJobs.map(job => (
              <Link key={job.id} href={`/handyman/jobs/${job.id}`} className="block touch-scale">
                <div className="ios-card overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
                        <span className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                          {format(new Date(job.date), "h:mm a")}
                        </span>
                      </div>
                      <span className={STATUS_BADGE[job.status] ?? "badge-pending"}>
                        {job.status}
                      </span>
                    </div>

                    <p className="font-semibold text-[16px]" style={{ color: "var(--label-primary)" }}>
                      {job.title}
                    </p>
                    <p className="text-[14px] mt-0.5" style={{ color: "var(--label-secondary)" }}>
                      {job.clientName}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--label-quaternary)" }} />
                      <span className="text-[13px] truncate" style={{ color: "var(--label-tertiary)" }}>
                        {job.location}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between mt-2.5 pt-2.5"
                      style={{ borderTop: "0.5px solid var(--separator)" }}
                    >
                      <span className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
                        {job.handymanName ? `👤 ${job.handymanName}` : "Unassigned"}
                      </span>
                      <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ScheduleTabs (exported) ──────────────────────────────────────────────────

export default function ScheduleTabs({
  jobs,
  children,
}: {
  /** All jobs — used by the calendar view and ICS export. */
  jobs: Job[];
  /** The server-rendered list view. */
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-4">
      {/* Tab row */}
      <div className="flex items-center justify-between">
        {/* Segmented control */}
        <div
          className="flex rounded-xl p-0.5"
          style={{ background: "var(--bg-grouped)" }}
        >
          {(["list", "calendar"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-1.5 text-[14px] font-semibold rounded-[10px] transition-all duration-200 capitalize"
              style={{
                background: activeTab === tab ? "var(--bg-card)" : "transparent",
                color:      activeTab === tab ? "var(--label-primary)" : "var(--label-tertiary)",
                boxShadow:  activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {tab === "list" ? "List" : "Calendar"}
            </button>
          ))}
        </div>

        {/* Export ICS */}
        {jobs.length > 0 && (
          <button
            onClick={() => downloadICS(jobs)}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-xl"
            style={{
              color:      "var(--brand)",
              background: "rgba(255,107,53,0.1)",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "list"
        ? children
        : <CalendarView jobs={jobs} />
      }
    </div>
  );
}
