import { getJobs } from "@/lib/db";
import Link from "next/link";
import { Plus, ChevronRight, MapPin, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { cls: string; bar: string }> = {
  Pending:       { cls: "badge-pending",     bar: "var(--ios-orange)" },
  "In Progress": { cls: "badge-in-progress", bar: "var(--ios-blue)" },
  Completed:     { cls: "badge-completed",   bar: "var(--ios-green)" },
};

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ios-large-title">Jobs</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
            {jobs.length} total
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <button
            className="flex items-center gap-1.5 font-semibold text-[15px] px-4 h-[44px] rounded-[12px] text-white transition-opacity active:opacity-75"
            style={{
              background: "linear-gradient(145deg, #FF7A47, #FF5500)",
              boxShadow: "0 3px 10px rgba(255,107,53,0.30)",
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Job
          </button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,107,53,0.08)" }}
          >
            <span className="text-3xl">🔧</span>
          </div>
          <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
            No jobs yet
          </p>
          <Link href="/admin/jobs/new">
            <span className="text-[15px] mt-1 block" style={{ color: "var(--brand)" }}>
              + Create your first job
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => {
            const cfg = statusConfig[job.status] ?? statusConfig.Pending;
            return (
              <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block touch-scale">
                <div className="ios-card overflow-hidden">
                  <div className="flex">
                    {/* Left accent bar */}
                    <div
                      className="w-[3px] flex-shrink-0"
                      style={{ background: cfg.bar }}
                    />
                    <div className="flex-1 p-4">
                      {/* Status + Date row */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={cfg.cls}>{job.status}</span>
                        <div
                          className="flex items-center gap-1 text-[13px]"
                          style={{ color: "var(--label-tertiary)" }}
                        >
                          <Clock className="w-3 h-3" />
                          {format(new Date(job.date), "MMM d · h:mm a")}
                        </div>
                      </div>

                      <p
                        className="font-semibold text-[16px]"
                        style={{ color: "var(--label-primary)" }}
                      >
                        {job.title}
                      </p>
                      <p
                        className="text-[14px] mt-0.5"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        {job.clientName}
                      </p>

                      <div className="flex items-center gap-1 mt-2">
                        <MapPin
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--label-quaternary)" }}
                        />
                        <span
                          className="text-[13px] truncate"
                          style={{ color: "var(--label-tertiary)" }}
                        >
                          {job.location}
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between mt-3 pt-3"
                        style={{ borderTop: "0.5px solid var(--separator)" }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
                            {job.handymanName ? (
                              `👤 ${job.handymanName}`
                            ) : (
                              <span
                                style={{
                                  color: "var(--label-quaternary)",
                                  fontStyle: "italic",
                                }}
                              >
                                Unassigned
                              </span>
                            )}
                          </span>
                          {job.invoiceId && (
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold"
                              style={{
                                background: "rgba(175,82,222,0.10)",
                                color: "var(--ios-purple)",
                              }}
                            >
                              <FileText className="w-3 h-3" /> Invoice
                            </span>
                          )}
                          {!job.invoiceId && job.status === "Completed" && (
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "rgba(255,107,53,0.10)",
                                color: "var(--brand)",
                              }}
                            >
                              No invoice
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          className="w-4 h-4"
                          style={{ color: "var(--label-quaternary)" }}
                        />
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
  );
}
