import { getJobs, getInvoices, filterWeekJobs, filterMonthJobs, filterPaidInvoices } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { Calendar, TrendingUp } from "lucide-react";

export default async function WeekMonthStats() {
  const companyId = await getCompanyIdFromCookie();
  const [allJobs, allInvoices] = await Promise.all([getJobs(companyId), getInvoices(companyId)]);

  const weekJobs = filterWeekJobs(allJobs);
  const monthJobs = filterMonthJobs(allJobs);
  const paidInvoices = filterPaidInvoices(allInvoices);

  const weekCompleted = weekJobs.filter((j) => j.status === "Completed").length;
  const monthCompleted = monthJobs.filter((j) => j.status === "Completed").length;

  const today = new Date();
  const dow = today.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const weekRevenue = paidInvoices
    .filter((i) => i.jobDate >= weekStart.toISOString() && i.jobDate < weekEnd.toISOString())
    .reduce((s, i) => s + i.total, 0);
  const monthRevenue = paidInvoices
    .filter((i) => i.jobDate >= monthStart.toISOString() && i.jobDate < monthEnd.toISOString())
    .reduce((s, i) => s + i.total, 0);

  const fmtZAR = (n: number) =>
    n >= 1000 ? `R${(n / 1000).toFixed(1)}k` : `R${n.toFixed(0)}`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="ios-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: "rgba(0,122,255,0.10)" }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: "var(--ios-blue)" }} />
          </div>
          <p className="text-[13px] font-semibold" style={{ color: "var(--label-secondary)" }}>
            This Week
          </p>
        </div>
        <p
          className="text-[24px] font-bold tracking-tight stat-number"
          style={{ color: "var(--label-primary)" }}
        >
          {weekCompleted}
          <span className="text-[16px] font-medium" style={{ color: "var(--label-tertiary)" }}>
            /{weekJobs.length}
          </span>
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
          jobs done
        </p>
        <div className="mt-3 pt-3" style={{ borderTop: "0.5px solid var(--separator)" }}>
          <p className="text-[16px] font-bold stat-number" style={{ color: "var(--ios-green)" }}>
            {fmtZAR(weekRevenue)}
          </p>
          <p className="text-[11px]" style={{ color: "var(--label-tertiary)" }}>
            collected
          </p>
        </div>
      </div>

      <div className="ios-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: "rgba(175,82,222,0.10)" }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--ios-purple)" }} />
          </div>
          <p className="text-[13px] font-semibold" style={{ color: "var(--label-secondary)" }}>
            This Month
          </p>
        </div>
        <p
          className="text-[24px] font-bold tracking-tight stat-number"
          style={{ color: "var(--label-primary)" }}
        >
          {monthCompleted}
          <span className="text-[16px] font-medium" style={{ color: "var(--label-tertiary)" }}>
            /{monthJobs.length}
          </span>
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
          jobs done
        </p>
        <div className="mt-3 pt-3" style={{ borderTop: "0.5px solid var(--separator)" }}>
          <p className="text-[16px] font-bold stat-number" style={{ color: "var(--ios-green)" }}>
            {fmtZAR(monthRevenue)}
          </p>
          <p className="text-[11px]" style={{ color: "var(--label-tertiary)" }}>
            collected
          </p>
        </div>
      </div>
    </div>
  );
}
