import {
  getTodayJobs,
  getOutstandingInvoices,
  getInvoices,
  getJobs,
  getHandymen,
  getWeekJobs,
  getMonthJobs,
} from "@/lib/db";
import {
  Briefcase,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  MapPin,
  Clock,
  User,
  Plus,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { format, addDays, startOfDay } from "date-fns";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { cls: string; bar: string; color: string }> = {
  Pending:       { cls: "badge-pending",     bar: "var(--ios-orange)", color: "var(--ios-orange)" },
  "In Progress": { cls: "badge-in-progress", bar: "var(--ios-blue)",   color: "var(--ios-blue)"   },
  Completed:     { cls: "badge-completed",   bar: "var(--ios-green)",  color: "var(--ios-green)"  },
};

export default async function AdminDashboard() {
  const [todayJobs, outstanding, allInvoices, allJobs, weekJobs, monthJobs, handymen] =
    await Promise.all([
      getTodayJobs(),
      getOutstandingInvoices(),
      getInvoices(),
      getJobs(),
      getWeekJobs(),
      getMonthJobs(),
      getHandymen(),
    ]);

  // ── KPI: today ────────────────────────────────────────────────────────────
  const doneToday      = todayJobs.filter(j => j.status === "Completed").length;
  const inProgressToday= todayJobs.filter(j => j.status === "In Progress").length;
  const pendingToday   = todayJobs.length - doneToday - inProgressToday;

  // ── KPI: financials ────────────────────────────────────────────────────────
  const paidInvoices      = allInvoices.filter(i => i.status === "Paid");
  const totalRevenue      = paidInvoices.reduce((s, i) => s + i.total, 0);
  const outstandingTotal  = outstanding.reduce((s, i) => s + i.total, 0);

  // ── Week / Month summaries ─────────────────────────────────────────────────
  const weekCompleted = weekJobs.filter(j => j.status === "Completed").length;

  // Week revenue = paid invoices whose jobDate falls in this week
  const today = new Date();
  const dow   = today.getDay();
  const diff  = dow === 0 ? -6 : 1 - dow;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const weekRevenue  = paidInvoices
    .filter(i => i.jobDate >= weekStart.toISOString() && i.jobDate < weekEnd.toISOString())
    .reduce((s, i) => s + i.total, 0);
  const monthRevenue = paidInvoices
    .filter(i => i.jobDate >= monthStart.toISOString() && i.jobDate < monthEnd.toISOString())
    .reduce((s, i) => s + i.total, 0);

  const monthCompleted = monthJobs.filter(j => j.status === "Completed").length;

  // ── Pipeline: all jobs by status ────────────────────────────────────────────
  const pipeline = {
    Pending:       allJobs.filter(j => j.status === "Pending").length,
    "In Progress": allJobs.filter(j => j.status === "In Progress").length,
    Completed:     allJobs.filter(j => j.status === "Completed").length,
  };
  const pipelineTotal = allJobs.length;

  // ── Handyman utilization (this week) ───────────────────────────────────────
  const handymanUtil = handymen.map(h => ({
    ...h,
    weekCount: weekJobs.filter(j => j.handymanId === h.id).length,
  }));

  // ── Upcoming jobs: next 5 jobs with date > today (not today, all statuses) ─
  const tomorrowStart = addDays(startOfDay(today), 1);
  const upcomingJobs = allJobs
    .filter(j => new Date(j.date) >= tomorrowStart)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // ── Recent past (for reference if needed) ─────────────────────────────────
  const recentPast = allJobs
    .filter(j => new Date(j.date) < startOfDay(today))
    .slice(0, 5);

  const fmtNIS = (n: number) =>
    n >= 1000 ? `₪${(n / 1000).toFixed(1)}k` : `₪${n.toFixed(0)}`;

  return (
    <div className="space-y-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium" style={{ color: "var(--label-tertiary)" }}>
            {format(new Date(), "EEEE")}
          </p>
          <h1 className="ios-large-title mt-0.5">{format(new Date(), "MMMM d")}</h1>
        </div>
        <Link href="/admin/jobs/new">
          <button
            className="flex items-center gap-1.5 font-semibold text-[15px] px-4 h-[44px] rounded-xl text-white"
            style={{ background: "var(--brand)" }}
          >
            <Plus className="w-4 h-4" />
            New Job
          </button>
        </Link>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today */}
        <div className="ios-card p-4">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center mb-2.5"
            style={{ background: "rgba(255,107,53,0.12)" }}
          >
            <Briefcase className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </div>
          <p className="text-[28px] font-bold tracking-tight leading-none" style={{ color: "var(--label-primary)" }}>
            {todayJobs.length}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>Today</p>
          {todayJobs.length > 0 && (
            <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--ios-green)" }}>
              {doneToday}/{todayJobs.length} done
            </p>
          )}
        </div>

        {/* Unpaid */}
        <div className="ios-card p-4">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center mb-2.5"
            style={{ background: "rgba(255,59,48,0.1)" }}
          >
            <AlertCircle className="w-4 h-4" style={{ color: "var(--ios-red)" }} />
          </div>
          <p className="text-[28px] font-bold tracking-tight leading-none" style={{ color: "var(--label-primary)" }}>
            {outstanding.length}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>Unpaid</p>
          {outstanding.length > 0 && (
            <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--ios-red)" }}>
              ₪{outstandingTotal.toFixed(0)}
            </p>
          )}
        </div>

        {/* Revenue */}
        <div className="ios-card p-4">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center mb-2.5"
            style={{ background: "rgba(52,199,89,0.1)" }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "var(--ios-green)" }} />
          </div>
          <p className="text-[22px] font-bold tracking-tight leading-none" style={{ color: "var(--label-primary)" }}>
            {fmtNIS(totalRevenue)}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>Collected</p>
        </div>
      </div>

      {/* ── This Week + This Month ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* This Week */}
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: "rgba(0,122,255,0.1)" }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: "var(--ios-blue)" }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--label-secondary)" }}>This Week</p>
          </div>
          <p className="text-[24px] font-bold tracking-tight" style={{ color: "var(--label-primary)" }}>
            {weekCompleted}<span className="text-[16px] font-medium" style={{ color: "var(--label-tertiary)" }}>/{weekJobs.length}</span>
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>jobs done</p>
          <div
            className="mt-3 pt-3"
            style={{ borderTop: "0.5px solid var(--separator)" }}
          >
            <p className="text-[16px] font-bold" style={{ color: "var(--ios-green)" }}>{fmtNIS(weekRevenue)}</p>
            <p className="text-[11px]" style={{ color: "var(--label-tertiary)" }}>collected</p>
          </div>
        </div>

        {/* This Month */}
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: "rgba(175,82,222,0.1)" }}
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--ios-purple)" }} />
            </div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--label-secondary)" }}>This Month</p>
          </div>
          <p className="text-[24px] font-bold tracking-tight" style={{ color: "var(--label-primary)" }}>
            {monthCompleted}<span className="text-[16px] font-medium" style={{ color: "var(--label-tertiary)" }}>/{monthJobs.length}</span>
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>jobs done</p>
          <div
            className="mt-3 pt-3"
            style={{ borderTop: "0.5px solid var(--separator)" }}
          >
            <p className="text-[16px] font-bold" style={{ color: "var(--ios-green)" }}>{fmtNIS(monthRevenue)}</p>
            <p className="text-[11px]" style={{ color: "var(--label-tertiary)" }}>collected</p>
          </div>
        </div>
      </div>

      {/* ── Job Pipeline ────────────────────────────────────────────────── */}
      {pipelineTotal > 0 && (
        <div className="ios-card p-4">
          <p className="font-semibold text-[15px] mb-3" style={{ color: "var(--label-primary)" }}>
            Job Pipeline
          </p>

          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
            {pipeline.Pending > 0 && (
              <div
                className="rounded-full"
                style={{
                  width: `${(pipeline.Pending / pipelineTotal) * 100}%`,
                  background: "var(--ios-orange)",
                }}
              />
            )}
            {pipeline["In Progress"] > 0 && (
              <div
                className="rounded-full"
                style={{
                  width: `${(pipeline["In Progress"] / pipelineTotal) * 100}%`,
                  background: "var(--ios-blue)",
                }}
              />
            )}
            {pipeline.Completed > 0 && (
              <div
                className="rounded-full"
                style={{
                  width: `${(pipeline.Completed / pipelineTotal) * 100}%`,
                  background: "var(--ios-green)",
                }}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-4">
            {(["Pending", "In Progress", "Completed"] as const).map(status => (
              pipeline[status] > 0 && (
                <div key={status} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusConfig[status].color }} />
                  <span className="text-[12px] font-medium" style={{ color: "var(--label-secondary)" }}>
                    {pipeline[status]} {status}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* ── Today Progress ───────────────────────────────────────────────── */}
      {todayJobs.length > 0 && (
        <div className="ios-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
              Today&apos;s Progress
            </p>
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
              {doneToday} of {todayJobs.length}
            </p>
          </div>
          <div className="flex gap-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--separator)" }}>
            {todayJobs.map(j => (
              <div
                key={j.id}
                className="flex-1 rounded-full transition-colors duration-300"
                style={{ background: statusConfig[j.status]?.bar ?? "var(--separator)" }}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-2.5">
            {inProgressToday > 0 && (
              <span className="text-[12px] font-medium" style={{ color: "var(--ios-blue)" }}>
                {inProgressToday} in progress
              </span>
            )}
            {pendingToday > 0 && (
              <span className="text-[12px] font-medium" style={{ color: "var(--ios-orange)" }}>
                {pendingToday} pending
              </span>
            )}
            {doneToday > 0 && (
              <span className="text-[12px] font-medium" style={{ color: "var(--ios-green)" }}>
                {doneToday} done
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Today's Jobs ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
            Today&apos;s Jobs
          </p>
          <Link href="/admin/jobs" className="text-[15px] font-medium" style={{ color: "var(--brand)" }}>
            All →
          </Link>
        </div>

        {todayJobs.length === 0 ? (
          <div
            className="ios-card p-8 text-center"
            style={{ border: "1.5px dashed var(--separator)" }}
          >
            <span className="text-3xl">📋</span>
            <p className="font-semibold text-[15px] mt-2" style={{ color: "var(--label-secondary)" }}>
              No jobs today
            </p>
            <Link href="/admin/jobs/new">
              <button
                className="mt-4 text-[14px] font-semibold px-4 py-2 rounded-xl"
                style={{ background: "rgba(255,107,53,0.1)", color: "var(--brand)" }}
              >
                + Schedule a job
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayJobs.map(job => {
              const cfg = statusConfig[job.status] ?? statusConfig.Pending;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block touch-scale">
                  <div className="ios-card overflow-hidden">
                    <div className="flex">
                      <div className="w-1 flex-shrink-0" style={{ background: cfg.bar }} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" style={{ color: "var(--label-quaternary)" }} />
                            <span className="text-[14px] font-medium" style={{ color: "var(--label-secondary)" }}>
                              {format(new Date(job.date), "h:mm a")}
                            </span>
                          </div>
                          <span className={cfg.cls}>{job.status}</span>
                        </div>
                        <p className="font-semibold text-[16px]" style={{ color: "var(--label-primary)" }}>
                          {job.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[13px]" style={{ color: "var(--label-tertiary)" }}>
                            <User className="w-3 h-3" />{job.clientName}
                          </span>
                          <span className="flex items-center gap-1 text-[13px] min-w-0" style={{ color: "var(--label-quaternary)" }}>
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </span>
                        </div>
                        <div
                          className="flex items-center justify-between mt-2.5 pt-2.5"
                          style={{ borderTop: "0.5px solid var(--separator)" }}
                        >
                          <span className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
                            {job.handymanName ? `👤 ${job.handymanName}` : (
                              <span style={{ color: "var(--ios-orange)" }}>⚠ Unassigned</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {job.invoiceId ? (
                              <span
                                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: "rgba(175,82,222,0.1)", color: "var(--ios-purple)" }}
                              >
                                Has invoice
                              </span>
                            ) : job.status === "Completed" ? (
                              <Link
                                href={`/admin/invoices/new?jobId=${job.id}`}
                                onClick={e => e.stopPropagation()}
                                className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: "rgba(255,107,53,0.1)", color: "var(--brand)" }}
                              >
                                + Invoice
                              </Link>
                            ) : null}
                            <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Upcoming Jobs ───────────────────────────────────────────────── */}
      {upcomingJobs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
              Upcoming Jobs
            </p>
            <Link href="/admin/jobs" className="text-[15px] font-medium" style={{ color: "var(--brand)" }}>
              All →
            </Link>
          </div>
          <div className="ios-group">
            {upcomingJobs.map((job, i) => {
              const cfg = statusConfig[job.status] ?? statusConfig.Pending;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
                  <div
                    className="flex items-center px-4 py-3 min-h-[56px]"
                    style={{
                      borderBottom: i < upcomingJobs.length - 1 ? "0.5px solid var(--separator)" : "none",
                    }}
                  >
                    {/* Date badge */}
                    <div
                      className="w-11 flex-shrink-0 mr-3 text-center rounded-xl py-1.5"
                      style={{ background: "rgba(255,107,53,0.08)" }}
                    >
                      <p className="text-[11px] font-semibold uppercase" style={{ color: "var(--brand)" }}>
                        {format(new Date(job.date), "MMM")}
                      </p>
                      <p className="text-[18px] font-bold leading-none" style={{ color: "var(--brand)" }}>
                        {format(new Date(job.date), "d")}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px] truncate" style={{ color: "var(--label-primary)" }}>
                        {job.title}
                      </p>
                      <p className="text-[13px] truncate mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                        {job.clientName} · {format(new Date(job.date), "h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={cfg.cls}>{job.status}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Handyman Utilization ─────────────────────────────────────────── */}
      {handymen.length > 0 && weekJobs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
              Team This Week
            </p>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
              <span className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
                {weekJobs.length} job{weekJobs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="ios-group">
            {handymanUtil.map((h, i) => {
              const maxJobs = Math.max(...handymanUtil.map(x => x.weekCount), 1);
              const pct     = h.weekCount > 0 ? (h.weekCount / maxJobs) * 100 : 0;
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-3 px-4 py-3.5 min-h-[56px]"
                  style={{
                    borderBottom: i < handymanUtil.length - 1 ? "0.5px solid var(--separator)" : "none",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[15px] text-white"
                    style={{ background: h.weekCount > 0 ? "var(--brand)" : "var(--separator)" }}
                  >
                    {h.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-[15px] truncate" style={{ color: "var(--label-primary)" }}>
                        {h.name}
                      </p>
                      <p className="text-[13px] font-semibold flex-shrink-0 ml-2" style={{ color: h.weekCount > 0 ? "var(--brand)" : "var(--label-quaternary)" }}>
                        {h.weekCount} job{h.weekCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {/* Utilization mini-bar */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--separator)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: h.weekCount > 0 ? "var(--brand)" : "transparent",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Outstanding Invoices ─────────────────────────────────────────── */}
      {outstanding.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
              Awaiting Payment
            </p>
            <Link href="/admin/invoices" className="text-[15px] font-medium" style={{ color: "var(--brand)" }}>
              All →
            </Link>
          </div>
          <div className="ios-group">
            {outstanding.map((inv, i) => (
              <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block">
                <div
                  className="flex items-center px-4 py-3.5 min-h-[56px]"
                  style={{
                    borderBottom: i < outstanding.length - 1 ? "0.5px solid var(--separator)" : "none",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] truncate" style={{ color: "var(--label-primary)" }}>
                      {inv.clientName}
                    </p>
                    <p className="text-[13px] truncate mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                      {inv.jobTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-[15px]" style={{ color: "var(--ios-red)" }}>
                        ₪{inv.total.toFixed(0)}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--label-quaternary)" }}>{inv.status}</p>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <p className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
              {outstanding.length} invoice{outstanding.length > 1 ? "s" : ""}
            </p>
            <p className="font-bold text-[15px]" style={{ color: "var(--ios-red)" }}>
              ₪{outstandingTotal.toFixed(0)}
            </p>
          </div>
        </section>
      )}

      {/* ── Recent Jobs ─────────────────────────────────────────────────── */}
      {recentPast.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
              Recent Jobs
            </p>
            <Link href="/admin/jobs" className="text-[15px] font-medium" style={{ color: "var(--brand)" }}>
              All →
            </Link>
          </div>
          <div className="ios-group">
            {recentPast.map((job, i) => {
              const cfg = statusConfig[job.status] ?? statusConfig.Pending;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
                  <div
                    className="flex items-center px-4 py-3 min-h-[52px]"
                    style={{
                      borderBottom: i < recentPast.length - 1 ? "0.5px solid var(--separator)" : "none",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px] truncate" style={{ color: "var(--label-primary)" }}>
                        {job.title}
                      </p>
                      <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                        {job.clientName} · {format(new Date(job.date), "MMM d")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={cfg.cls}>{job.status}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
