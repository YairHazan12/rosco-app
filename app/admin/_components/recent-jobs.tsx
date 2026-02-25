import { getJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { ChevronRight } from "lucide-react";

const statusConfig: Record<string, { cls: string }> = {
  Pending: { cls: "badge-pending" },
  "In Progress": { cls: "badge-in-progress" },
  Completed: { cls: "badge-completed" },
};

export default async function RecentJobs() {
  const companyId = await getCompanyIdFromCookie();
  const allJobs = await getJobs(companyId);

  const today = new Date();
  const recentPast = allJobs
    .filter((j) => new Date(j.date) < startOfDay(today))
    .slice(0, 5);

  if (recentPast.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          Recent Jobs
        </p>
        <Link
          href="/admin/jobs"
          className="text-[15px] font-semibold"
          style={{ color: "var(--brand)" }}
        >
          All →
        </Link>
      </div>
      <div className="ios-group">
        {recentPast.map((job, i) => {
          const cfg = statusConfig[job.status] ?? statusConfig.Pending;
          return (
            <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
              <div
                className="flex items-center px-4 py-3 min-h-[52px] transition-colors active:bg-[var(--bg-grouped)]"
                style={{
                  borderBottom:
                    i < recentPast.length - 1 ? "0.5px solid var(--separator)" : "none",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-[15px] truncate"
                    style={{ color: "var(--label-primary)" }}
                  >
                    {job.title}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                    {job.clientName} · {format(new Date(job.date), "MMM d")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className={cfg.cls}>{job.status}</span>
                  <ChevronRight
                    className="w-4 h-4"
                    style={{ color: "var(--label-quaternary)" }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
