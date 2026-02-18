import { getTodayJobs, getOutstandingInvoices, getPaidInvoices, getJobs } from "@/lib/db";
import { Briefcase, TrendingUp, AlertCircle, ChevronRight, MapPin, Clock, User, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { cls: string; bar: string }> = {
  Pending:       { cls: "badge-pending",     bar: "var(--ios-orange)" },
  "In Progress": { cls: "badge-in-progress", bar: "var(--ios-blue)" },
  Completed:     { cls: "badge-completed",   bar: "var(--ios-green)" },
};

export default async function AdminDashboard() {
  const [todayJobs, outstanding, paid, recentJobs] = await Promise.all([
    getTodayJobs(),
    getOutstandingInvoices(),
    getPaidInvoices(),
    getJobs(),
  ]);

  const recentPast = recentJobs.filter(j => new Date(j.date) < new Date()).slice(0, 5);
  const totalRevenue     = paid.reduce((s, i) => s + i.total, 0);
  const outstandingTotal = outstanding.reduce((s, i) => s + i.total, 0);
  const doneCount        = todayJobs.filter(j => j.status === "Completed").length;
  const inProgressCount  = todayJobs.filter(j => j.status === "In Progress").length;
  const pendingCount     = todayJobs.length - doneCount - inProgressCount;

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today */}
        <div className="ios-card p-4">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center mb-2.5"
            style={{ background: "rgba(255,107,53,0.12)" }}
          >
            <Briefcase className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </div>
          <p
            className="text-[28px] font-bold tracking-tight leading-none"
            style={{ color: "var(--label-primary)" }}
          >
            {todayJobs.length}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>
            Today
          </p>
          {todayJobs.length > 0 && (
            <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--ios-green)" }}>
              {doneCount}/{todayJobs.length} done
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
          <p
            className="text-[28px] font-bold tracking-tight leading-none"
            style={{ color: "var(--label-primary)" }}
          >
            {outstanding.length}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>
            Unpaid
          </p>
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
          <p
            className="text-[22px] font-bold tracking-tight leading-none"
            style={{ color: "var(--label-primary)" }}
          >
            ₪{totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + "k" : totalRevenue.toFixed(0)}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>
            Collected
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {todayJobs.length > 0 && (
        <div className="ios-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
              Today&apos;s Progress
            </p>
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
              {doneCount} of {todayJobs.length}
            </p>
          </div>
          {/* Segmented progress */}
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
            {inProgressCount > 0 && (
              <span className="text-[12px] font-medium" style={{ color: "var(--ios-blue)" }}>
                {inProgressCount} in progress
              </span>
            )}
            {pendingCount > 0 && (
              <span className="text-[12px] font-medium" style={{ color: "var(--ios-orange)" }}>
                {pendingCount} pending
              </span>
            )}
            {doneCount > 0 && (
              <span className="text-[12px] font-medium" style={{ color: "var(--ios-green)" }}>
                {doneCount} done
              </span>
            )}
          </div>
        </div>
      )}

      {/* Today's Jobs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
            Today&apos;s Jobs
          </p>
          <Link
            href="/admin/jobs"
            className="text-[15px] font-medium"
            style={{ color: "var(--brand)" }}
          >
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
                      {/* Status bar */}
                      <div
                        className="w-1 flex-shrink-0"
                        style={{ background: cfg.bar }}
                      />
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
                            <User className="w-3 h-3" />
                            {job.clientName}
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

      {/* Outstanding Invoices */}
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
                      <p className="text-[11px]" style={{ color: "var(--label-quaternary)" }}>
                        {inv.status}
                      </p>
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

      {/* Recent Jobs */}
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
