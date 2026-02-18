import { prisma } from "@/lib/prisma";
import { Briefcase, TrendingUp, AlertCircle, ChevronRight, MapPin, Clock, User, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { pill: string; bar: string }> = {
  Pending:      { pill: "bg-amber-100 text-amber-800",   bar: "bg-amber-400" },
  "In Progress":{ pill: "bg-blue-100 text-blue-800",     bar: "bg-blue-500" },
  Completed:    { pill: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" },
};

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayJobs, allOutstanding, paidInvoices] = await Promise.all([
    prisma.job.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      orderBy: { date: "asc" },
      include: { handyman: true, invoice: true },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["Outstanding", "Sent"] } },
      include: { job: { select: { clientName: true, title: true, clientPhone: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({ where: { status: "Paid" } }),
  ]);

  const totalRevenue    = paidInvoices.reduce((s, i) => s + i.total, 0);
  const outstandingTotal = allOutstanding.reduce((s, i) => s + i.total, 0);
  const doneCount       = todayJobs.filter(j => j.status === "Completed").length;
  const inProgressCount = todayJobs.filter(j => j.status === "In Progress").length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {format(today, "EEEE")}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
            {format(today, "MMMM d, yyyy")}
          </h1>
        </div>
        <Link href="/admin/jobs/new">
          <button className="flex items-center gap-1.5 bg-orange-500 active:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-orange-200 transition-colors">
            <Plus className="w-4 h-4" /> New Job
          </button>
        </Link>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Today */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mb-1">
            <Briefcase className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{todayJobs.length}</p>
          <p className="text-xs text-gray-400 font-medium">Today</p>
          {todayJobs.length > 0 && (
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">{doneCount}/{todayJobs.length} done</p>
          )}
        </div>

        {/* Outstanding */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center mb-1">
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{allOutstanding.length}</p>
          <p className="text-xs text-gray-400 font-medium">Unpaid</p>
          {allOutstanding.length > 0 && (
            <p className="text-xs text-rose-500 font-semibold mt-0.5">₪{outstandingTotal.toFixed(0)}</p>
          )}
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 leading-none">₪{totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + "k" : totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-400 font-medium">Collected</p>
        </div>
      </div>

      {/* ── Today's Progress Bar ── */}
      {todayJobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700">Today's Progress</p>
            <p className="text-xs text-gray-400">{doneCount} of {todayJobs.length} complete</p>
          </div>
          {/* Segmented bar */}
          <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
            {todayJobs.map((job) => (
              <div
                key={job.id}
                className={`flex-1 rounded-full ${statusStyles[job.status]?.bar ?? "bg-gray-300"}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-2">
            {inProgressCount > 0 && (
              <span className="text-xs text-blue-600 font-medium">{inProgressCount} in progress</span>
            )}
            {(todayJobs.length - doneCount - inProgressCount) > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                {todayJobs.length - doneCount - inProgressCount} pending
              </span>
            )}
            {doneCount > 0 && (
              <span className="text-xs text-emerald-600 font-medium">{doneCount} done</span>
            )}
          </div>
        </div>
      )}

      {/* ── Today's Jobs ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-gray-900">Today's Jobs</p>
          <Link href="/admin/jobs" className="text-xs text-orange-500 font-semibold">All jobs →</Link>
        </div>

        {todayJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-gray-600 font-semibold">No jobs scheduled today</p>
            <Link href="/admin/jobs/new">
              <button className="mt-4 text-sm font-semibold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl active:bg-orange-100 transition-colors">
                + Schedule a job
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayJobs.map((job) => {
              const style = statusStyles[job.status] ?? statusStyles.Pending;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.99] transition-all">
                    {/* Colored left accent */}
                    <div className="flex">
                      <div className={`w-1 flex-shrink-0 ${style.bar}`} />
                      <div className="flex-1 p-4">
                        {/* Row 1: time + status */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {format(new Date(job.date), "h:mm a")}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.pill}`}>
                            {job.status}
                          </span>
                        </div>

                        {/* Row 2: title */}
                        <p className="font-bold text-gray-900 text-[15px] leading-snug">{job.title}</p>

                        {/* Row 3: client + location */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="w-3 h-3 text-gray-300" /> {job.clientName}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 min-w-0">
                            <MapPin className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </span>
                        </div>

                        {/* Row 4: handyman + invoice shortcut */}
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                          <span className="text-xs text-gray-400">
                            {job.handyman
                              ? `👤 ${job.handyman.name}`
                              : <span className="text-amber-500 font-medium">⚠ Unassigned</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            {job.invoice ? (
                              <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                                {job.invoice.status}
                              </span>
                            ) : job.status === "Completed" ? (
                              <Link
                                href={`/admin/invoices/new?jobId=${job.id}`}
                                onClick={e => e.stopPropagation()}
                                className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-semibold active:bg-orange-100"
                              >
                                + Invoice
                              </Link>
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

      {/* ── Outstanding Invoices ── */}
      {allOutstanding.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-bold text-gray-900">Awaiting Payment</p>
            <Link href="/admin/invoices" className="text-xs text-orange-500 font-semibold">All invoices →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {allOutstanding.map((inv, idx) => (
              <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block">
                <div className={`flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors ${idx === 0 ? "rounded-t-2xl" : ""} ${idx === allOutstanding.length - 1 ? "rounded-b-2xl" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{inv.job.clientName}</p>
                    <p className="text-xs text-gray-400 truncate">{inv.job.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
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
            <p className="text-xs text-gray-400">{allOutstanding.length} invoice{allOutstanding.length > 1 ? "s" : ""} outstanding</p>
            <p className="text-sm font-bold text-rose-600">Total: ₪{outstandingTotal.toFixed(0)}</p>
          </div>
        </div>
      )}

    </div>
  );
}
