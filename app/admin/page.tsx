import { getTodayJobs, getOutstandingInvoices, getPaidInvoices, getJobs } from "@/lib/db";
import { Briefcase, TrendingUp, AlertCircle, ChevronRight, MapPin, Clock, User, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { pill: string; bar: string }> = {
  Pending:       { pill: "bg-amber-100 text-amber-800",    bar: "bg-amber-400" },
  "In Progress": { pill: "bg-blue-100 text-blue-800",      bar: "bg-blue-500" },
  Completed:     { pill: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" },
};

export default async function AdminDashboard() {
  const [todayJobs, outstanding, paid, recentJobs] = await Promise.all([
    getTodayJobs(),
    getOutstandingInvoices(),
    getPaidInvoices(),
    getJobs(),
  ]);

  const recentPast = recentJobs.filter(j => new Date(j.date) < new Date()).slice(0, 5);
  const totalRevenue = paid.reduce((s, i) => s + i.total, 0);
  const outstandingTotal = outstanding.reduce((s, i) => s + i.total, 0);
  const doneCount = todayJobs.filter(j => j.status === "Completed").length;
  const inProgressCount = todayJobs.filter(j => j.status === "In Progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{format(new Date(), "EEEE")}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{format(new Date(), "MMMM d, yyyy")}</h1>
        </div>
        <Link href="/admin/jobs/new">
          <button className="flex items-center gap-1.5 bg-orange-500 active:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-orange-200">
            <Plus className="w-4 h-4" /> New Job
          </button>
        </Link>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mb-2">
            <Briefcase className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayJobs.length}</p>
          <p className="text-xs text-gray-400 font-medium">Today</p>
          {todayJobs.length > 0 && (
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">{doneCount}/{todayJobs.length} done</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center mb-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{outstanding.length}</p>
          <p className="text-xs text-gray-400 font-medium">Unpaid</p>
          {outstanding.length > 0 && (
            <p className="text-xs text-rose-500 font-semibold mt-0.5">₪{outstandingTotal.toFixed(0)}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">₪{totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + "k" : totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-400 font-medium">Collected</p>
        </div>
      </div>

      {/* Progress bar */}
      {todayJobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700">Today&apos;s Progress</p>
            <p className="text-xs text-gray-400">{doneCount} of {todayJobs.length} complete</p>
          </div>
          <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
            {todayJobs.map(j => (
              <div key={j.id} className={`flex-1 rounded-full ${statusStyles[j.status]?.bar ?? "bg-gray-300"}`} />
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {inProgressCount > 0 && <span className="text-xs text-blue-600 font-medium">{inProgressCount} in progress</span>}
            {(todayJobs.length - doneCount - inProgressCount) > 0 && <span className="text-xs text-amber-600 font-medium">{todayJobs.length - doneCount - inProgressCount} pending</span>}
            {doneCount > 0 && <span className="text-xs text-emerald-600 font-medium">{doneCount} done</span>}
          </div>
        </div>
      )}

      {/* Today's Jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-gray-900">Today&apos;s Jobs</p>
          <Link href="/admin/jobs" className="text-xs text-orange-500 font-semibold">All jobs →</Link>
        </div>
        {todayJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-600 font-semibold">No jobs today</p>
            <Link href="/admin/jobs/new">
              <button className="mt-4 text-sm font-semibold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl">+ Schedule a job</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayJobs.map(job => {
              const style = statusStyles[job.status] ?? statusStyles.Pending;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.99] transition-all">
                    <div className="flex">
                      <div className={`w-1 flex-shrink-0 ${style.bar}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {format(new Date(job.date), "h:mm a")}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.pill}`}>{job.status}</span>
                        </div>
                        <p className="font-bold text-gray-900 text-[15px]">{job.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-gray-500"><User className="w-3 h-3 text-gray-300" />{job.clientName}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 min-w-0"><MapPin className="w-3 h-3 flex-shrink-0" /><span className="truncate">{job.location}</span></span>
                        </div>
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                          <span className="text-xs text-gray-400">{job.handymanName ? `👤 ${job.handymanName}` : <span className="text-amber-500 font-medium">⚠ Unassigned</span>}</span>
                          <div className="flex items-center gap-2">
                            {job.invoiceId ? (
                              <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">Has invoice</span>
                            ) : job.status === "Completed" ? (
                              <Link href={`/admin/invoices/new?jobId=${job.id}`} onClick={e => e.stopPropagation()}
                                className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-semibold">+ Invoice</Link>
                            ) : null}
                            <ChevronRight className="w-4 h-4 text-gray-300" />
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
      </div>

      {/* Outstanding */}
      {outstanding.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-bold text-gray-900">Awaiting Payment</p>
            <Link href="/admin/invoices" className="text-xs text-orange-500 font-semibold">All invoices →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {outstanding.map((inv, i) => (
              <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block">
                <div className={`flex items-center justify-between px-4 py-3.5 active:bg-gray-50 ${i === 0 ? "rounded-t-2xl" : ""} ${i === outstanding.length - 1 ? "rounded-b-2xl" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{inv.clientName}</p>
                    <p className="text-xs text-gray-400 truncate">{inv.jobTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600">₪{inv.total.toFixed(0)}</p>
                      <p className="text-xs text-gray-400">{inv.status}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <p className="text-xs text-gray-400">{outstanding.length} invoice{outstanding.length > 1 ? "s" : ""}</p>
            <p className="text-sm font-bold text-rose-600">₪{outstandingTotal.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* Recent past jobs */}
      {recentPast.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-bold text-gray-900">Recent Jobs</p>
            <Link href="/admin/jobs" className="text-xs text-orange-500 font-semibold">All →</Link>
          </div>
          <div className="space-y-2">
            {recentPast.map(job => (
              <Link key={job.id} href={`/admin/jobs/${job.id}`}>
                <div className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center justify-between active:scale-[0.99]">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.clientName} · {format(new Date(job.date), "MMM d")}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[job.status]?.pill ?? "bg-gray-100"}`}>{job.status}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
