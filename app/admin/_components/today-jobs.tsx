import { getJobs, filterTodayJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Clock, User, ChevronRight } from "lucide-react";
import CreateInvoiceLink from "./CreateInvoiceLink";

const statusConfig: Record<string, { cls: string; bar: string }> = {
  Pending: { cls: "badge-pending", bar: "var(--ios-orange)" },
  "In Progress": { cls: "badge-in-progress", bar: "var(--ios-blue)" },
  Completed: { cls: "badge-completed", bar: "var(--ios-green)" },
};

export default async function TodayJobs() {
  const companyId = await getCompanyIdFromCookie();
  const allJobs = await getJobs(companyId);
  const todayJobs = filterTodayJobs(allJobs);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          Today&apos;s Jobs
        </p>
        <Link
          href="/admin/jobs"
          className="text-[15px] font-semibold"
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
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(255,107,53,0.08)" }}
          >
            <span className="text-3xl">📋</span>
          </div>
          <p className="font-semibold text-[15px]" style={{ color: "var(--label-secondary)" }}>
            No jobs today
          </p>
          <Link href="/admin/jobs/new">
            <button
              className="mt-4 text-[14px] font-semibold px-4 py-2 rounded-xl transition-opacity active:opacity-75"
              style={{ background: "rgba(255,107,53,0.10)", color: "var(--brand)" }}
            >
              + Schedule a job
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {todayJobs.map((job) => {
            const cfg = statusConfig[job.status] ?? statusConfig.Pending;
            return (
              <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block touch-scale">
                <div className="ios-card overflow-hidden">
                  <div className="flex">
                    <div className="w-[3px] flex-shrink-0" style={{ background: cfg.bar }} />
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--label-quaternary)" }}
                          />
                          <span
                            className="text-[14px] font-medium"
                            style={{ color: "var(--label-secondary)" }}
                          >
                            {format(new Date(job.date), "h:mm a")}
                          </span>
                        </div>
                        <span className={cfg.cls}>{job.status}</span>
                      </div>

                      <p
                        className="font-semibold text-[16px]"
                        style={{ color: "var(--label-primary)" }}
                      >
                        {job.title}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5">
                        <span
                          className="flex items-center gap-1 text-[13px]"
                          style={{ color: "var(--label-tertiary)" }}
                        >
                          <User className="w-3 h-3" />
                          {job.clientName}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[13px] min-w-0"
                          style={{ color: "var(--label-quaternary)" }}
                        >
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-between mt-2.5 pt-2.5"
                        style={{ borderTop: "0.5px solid var(--separator)" }}
                      >
                        <span className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
                          {job.handymanName ? (
                            `👤 ${job.handymanName}`
                          ) : (
                            <span style={{ color: "var(--ios-orange)" }}>⚠ Unassigned</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {job.invoiceId ? (
                            <span
                              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "rgba(175,82,222,0.10)",
                                color: "var(--ios-purple)",
                              }}
                            >
                              Has invoice
                            </span>
                          ) : job.status === "Completed" ? (
                            <CreateInvoiceLink
                              jobId={job.id}
                              className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "rgba(255,107,53,0.10)",
                                color: "var(--brand)",
                              }}
                            >
                              + Invoice
                            </CreateInvoiceLink>
                          ) : null}
                          <ChevronRight
                            className="w-4 h-4"
                            style={{ color: "var(--label-quaternary)" }}
                          />
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
  );
}
