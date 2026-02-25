import { getJobs } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Clock, ChevronRight, ChevronLeft } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const STATUS_ORDER: Record<string, number> = {
  "In Progress": 0,
  Pending: 1,
  Completed: 2,
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  Pending: { label: "Pending", cls: "badge-pending" },
  "In Progress": { label: "In Progress", cls: "badge-in-progress" },
  Completed: { label: "Completed", cls: "badge-completed" },
};

export default async function AllJobsList({ page }: { page: number }) {
  const allJobs = await getJobs();

  // Sort: status priority, then newest-first within each group
  const sorted = [...allJobs].sort((a, b) => {
    const orderDiff = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    if (orderDiff !== 0) return orderDiff;
    return b.date.localeCompare(a.date);
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, total);
  const pageJobs = sorted.slice(startIdx, endIdx);

  // Re-group the current page slice by status for display
  const groups = (["In Progress", "Pending", "Completed"] as const)
    .map((status) => ({
      status,
      jobs: pageJobs.filter((j) => j.status === status),
    }))
    .filter((g) => g.jobs.length > 0);

  if (total === 0) {
    return (
      <div className="ios-card flex flex-col items-center text-center py-14 px-6">
        <span className="text-4xl mb-3">📋</span>
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          No jobs yet
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Job groups for this page */}
      <div className="space-y-6">
        {groups.map(({ status, jobs }) => (
          <section key={status}>
            <p className="ios-section-header mb-2.5">{status}</p>
            <div className="space-y-2">
              {jobs.map((job) => {
                const sc = statusConfig[job.status] ?? { label: job.status, cls: "badge-pending" };
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
                          <span className={sc.cls}>{sc.label}</span>
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
                          <span className="text-[13px] truncate" style={{ color: "var(--label-tertiary)" }}>
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
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ios-card p-4">
          <p className="text-center text-[12px] mb-3" style={{ color: "var(--label-tertiary)" }}>
            Showing {startIdx + 1}–{endIdx} of {total}
          </p>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/handyman/jobs?page=${safePage - 1}`}
              aria-disabled={safePage === 1}
              className={`flex items-center gap-1 px-4 h-[44px] rounded-[12px] font-semibold text-[14px] transition-opacity active:opacity-75 ${
                safePage === 1 ? "pointer-events-none opacity-30" : ""
              }`}
              style={{ background: "rgba(120,120,128,0.12)", color: "var(--brand)" }}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Prev
            </Link>

            <span className="text-[14px] font-semibold" style={{ color: "var(--label-secondary)" }}>
              Page {safePage} of {totalPages}
            </span>

            <Link
              href={`/handyman/jobs?page=${safePage + 1}`}
              aria-disabled={safePage === totalPages}
              className={`flex items-center gap-1 px-4 h-[44px] rounded-[12px] font-semibold text-[14px] transition-opacity active:opacity-75 ${
                safePage === totalPages ? "pointer-events-none opacity-30" : ""
              }`}
              style={{ background: "rgba(120,120,128,0.12)", color: "var(--brand)" }}
            >
              Next
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}

      {totalPages === 1 && total > 0 && (
        <p className="text-center text-[12px]" style={{ color: "var(--label-quaternary)" }}>
          Showing {startIdx + 1}–{endIdx} of {total}
        </p>
      )}
    </>
  );
}
