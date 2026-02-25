import { getJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import Link from "next/link";
import { format, addDays, startOfDay } from "date-fns";
import { ChevronRight } from "lucide-react";

const statusConfig: Record<string, { cls: string }> = {
  Pending: { cls: "badge-pending" },
  "In Progress": { cls: "badge-in-progress" },
  Completed: { cls: "badge-completed" },
};

export default async function UpcomingJobs() {
  const companyId = await getCompanyIdFromCookie();
  const allJobs = await getJobs(companyId);

  const today = new Date();
  const tomorrowStart = addDays(startOfDay(today), 1);
  const upcomingJobs = allJobs
    .filter((j) => new Date(j.date) >= tomorrowStart)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (upcomingJobs.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          Upcoming Jobs
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
        {upcomingJobs.map((job, i) => {
          const cfg = statusConfig[job.status] ?? statusConfig.Pending;
          return (
            <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
              <div
                className="flex items-center px-4 py-3 min-h-[60px] transition-colors active:bg-[var(--bg-grouped)]"
                style={{
                  borderBottom:
                    i < upcomingJobs.length - 1 ? "0.5px solid var(--separator)" : "none",
                }}
              >
                {/* Date badge */}
                <div
                  className="w-11 flex-shrink-0 mr-3 text-center rounded-xl py-1.5"
                  style={{ background: "rgba(255,107,53,0.08)" }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "var(--brand)" }}
                  >
                    {format(new Date(job.date), "MMM")}
                  </p>
                  <p
                    className="text-[19px] font-bold leading-tight stat-number"
                    style={{ color: "var(--brand)" }}
                  >
                    {format(new Date(job.date), "d")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-[15px] truncate"
                    style={{ color: "var(--label-primary)" }}
                  >
                    {job.title}
                  </p>
                  <p
                    className="text-[13px] truncate mt-0.5"
                    style={{ color: "var(--label-tertiary)" }}
                  >
                    {job.clientName} · {format(new Date(job.date), "h:mm a")}
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
