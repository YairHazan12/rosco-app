import { getJobs, filterTodayJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

const statusConfig: Record<string, { bar: string }> = {
  Pending: { bar: "var(--ios-orange)" },
  "In Progress": { bar: "var(--ios-blue)" },
  Completed: { bar: "var(--ios-green)" },
};

export default async function TodayProgress() {
  const companyId = await getCompanyIdFromCookie();
  const allJobs = await getJobs(companyId);
  const todayJobs = filterTodayJobs(allJobs);

  if (todayJobs.length === 0) return null;

  const doneToday = todayJobs.filter((j) => j.status === "Completed").length;
  const inProgressToday = todayJobs.filter((j) => j.status === "In Progress").length;
  const pendingToday = todayJobs.length - doneToday - inProgressToday;

  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
          Today&apos;s Progress
        </p>
        <p className="text-[13px] font-medium" style={{ color: "var(--label-tertiary)" }}>
          {doneToday} of {todayJobs.length}
        </p>
      </div>

      <div
        className="flex gap-1 h-2.5 rounded-full overflow-hidden"
        style={{ background: "var(--separator)" }}
      >
        {todayJobs.map((j) => (
          <div
            key={j.id}
            className="flex-1 rounded-full transition-colors duration-300"
            style={{ background: statusConfig[j.status]?.bar ?? "var(--separator)" }}
          />
        ))}
      </div>

      <div className="flex gap-3 mt-2.5">
        {inProgressToday > 0 && (
          <span className="text-[12px] font-semibold" style={{ color: "var(--ios-blue)" }}>
            {inProgressToday} in progress
          </span>
        )}
        {pendingToday > 0 && (
          <span className="text-[12px] font-semibold" style={{ color: "var(--ios-orange)" }}>
            {pendingToday} pending
          </span>
        )}
        {doneToday > 0 && (
          <span className="text-[12px] font-semibold" style={{ color: "var(--ios-green)" }}>
            {doneToday} done
          </span>
        )}
      </div>
    </div>
  );
}
