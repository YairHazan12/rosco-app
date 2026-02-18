import { getJobs } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Clock, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; cls: string }> = {
  Pending:       { label: "Pending",     cls: "badge-pending" },
  "In Progress": { label: "In Progress", cls: "badge-in-progress" },
  Completed:     { label: "Completed",   cls: "badge-completed" },
};

export default async function AllJobsPage() {
  const jobs = await getJobs();

  const pending     = jobs.filter(j => j.status === "Pending");
  const inProgress  = jobs.filter(j => j.status === "In Progress");
  const completed   = jobs.filter(j => j.status === "Completed");

  return (
    <div className="space-y-6 pb-4">
      {/* Large title */}
      <div className="pt-2">
        <h1 className="ios-large-title">All Jobs</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
          {jobs.length} total
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="ios-card flex flex-col items-center text-center py-14 px-6">
          <span className="text-4xl mb-3">📋</span>
          <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
            No jobs yet
          </p>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <JobSection title="In Progress" jobs={inProgress} />
          )}
          {pending.length > 0 && (
            <JobSection title="Pending" jobs={pending} />
          )}
          {completed.length > 0 && (
            <JobSection title="Completed" jobs={completed} />
          )}
        </>
      )}
    </div>
  );
}

function JobSection({
  title,
  jobs,
}: {
  title: string;
  jobs: Awaited<ReturnType<typeof getJobs>>;
}) {
  return (
    <section>
      <p className="ios-section-header mb-2.5">{title}</p>
      <div className="space-y-2">
        {jobs.map((job) => {
          const status = statusConfig[job.status] ?? { label: job.status, cls: "badge-pending" };
          return (
            <Link key={job.id} href={`/handyman/jobs/${job.id}`} className="block touch-scale">
              <div className="ios-card">
                <div className="p-4">
                  {/* Time + badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className="w-[14px] h-[14px] flex-shrink-0"
                        style={{ color: "var(--label-tertiary)" }}
                      />
                      <span
                        className="text-[14px] font-medium"
                        style={{ color: "var(--label-secondary)" }}
                      >
                        {format(new Date(job.date), "MMM d · h:mm a")}
                      </span>
                    </div>
                    <span className={status.cls}>{status.label}</span>
                  </div>

                  <p
                    className="font-semibold text-[17px] leading-snug"
                    style={{ color: "var(--label-primary)" }}
                  >
                    {job.title}
                  </p>
                  <p className="text-[14px] mt-0.5" style={{ color: "var(--label-secondary)" }}>
                    {job.clientName}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
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
                    <span className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
                      {job.handymanName ? `👤 ${job.handymanName}` : "Unassigned"}
                    </span>
                    <ChevronRight
                      className="w-[18px] h-[18px]"
                      style={{ color: "var(--label-quaternary)" }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
