import {
  getJobs,
  getInvoices,
  filterTodayJobs,
  filterOutstandingInvoices,
  filterPaidInvoices,
  filterWeekJobs,
  filterMonthJobs,
} from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { TrendingUp, AlertCircle, Briefcase, LayoutGrid } from "lucide-react";
import TotalJobsToggle from "./total-jobs-toggle";

export default async function KPIStrip() {
  const companyId = await getCompanyIdFromCookie();
  const [allJobs, allInvoices] = await Promise.all([getJobs(companyId), getInvoices(companyId)]);

  const todayJobs = filterTodayJobs(allJobs);
  const outstanding = filterOutstandingInvoices(allInvoices);
  const paidInvoices = filterPaidInvoices(allInvoices);
  const weekJobs = filterWeekJobs(allJobs);
  const monthJobs = filterMonthJobs(allJobs);

  const doneToday = todayJobs.filter((j) => j.status === "Completed").length;
  const weekCompleted = weekJobs.filter((j) => j.status === "Completed").length;
  const monthCompleted = monthJobs.filter((j) => j.status === "Completed").length;

  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const outstandingTotal = outstanding.reduce((s, i) => s + i.total, 0);

  const fmtZAR = (n: number) =>
    n >= 1000 ? `R${(n / 1000).toFixed(1)}k` : `R${n.toFixed(0)}`;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Top-left: Total Revenue Collected */}
      <div className="ios-card p-4">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
          style={{ background: "rgba(52,199,89,0.10)" }}
        >
          <TrendingUp className="w-[18px] h-[18px]" style={{ color: "var(--ios-green)" }} />
        </div>
        <p
          className="text-[26px] font-bold tracking-tight leading-none stat-number"
          style={{ color: "var(--label-primary)" }}
        >
          {fmtZAR(totalRevenue)}
        </p>
        <p className="text-[12px] mt-1.5 font-medium" style={{ color: "var(--label-tertiary)" }}>
          Total Revenue
        </p>
      </div>

      {/* Top-right: Unpaid Invoices */}
      <div className="ios-card p-4">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
          style={{ background: "rgba(255,59,48,0.10)" }}
        >
          <AlertCircle className="w-[18px] h-[18px]" style={{ color: "var(--ios-red)" }} />
        </div>
        <p
          className="text-[30px] font-bold tracking-tight leading-none stat-number"
          style={{ color: "var(--label-primary)" }}
        >
          {outstanding.length}
        </p>
        <p className="text-[12px] mt-1.5 font-medium" style={{ color: "var(--label-tertiary)" }}>
          Unpaid Invoices
        </p>
        {outstanding.length > 0 && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--ios-red)" }}>
            {fmtZAR(outstandingTotal)} outstanding
          </p>
        )}
      </div>

      {/* Bottom-left: Today's Jobs */}
      <div className="ios-card p-4">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
          style={{ background: "rgba(255,107,53,0.12)" }}
        >
          <Briefcase className="w-[18px] h-[18px]" style={{ color: "var(--brand)" }} />
        </div>
        <p
          className="text-[30px] font-bold tracking-tight leading-none stat-number"
          style={{ color: "var(--label-primary)" }}
        >
          {todayJobs.length}
        </p>
        <p className="text-[12px] mt-1.5 font-medium" style={{ color: "var(--label-tertiary)" }}>
          Today&apos;s Jobs
        </p>
        {todayJobs.length > 0 && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--ios-green)" }}>
            {doneToday}/{todayJobs.length} done
          </p>
        )}
      </div>

      {/* Bottom-right: Total Jobs with weekly/monthly toggle */}
      <div className="ios-card p-4">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
          style={{ background: "rgba(0,122,255,0.10)" }}
        >
          <LayoutGrid className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
        </div>
        <TotalJobsToggle
          totalJobs={allJobs.length}
          weekJobs={weekJobs.length}
          weekCompleted={weekCompleted}
          monthJobs={monthJobs.length}
          monthCompleted={monthCompleted}
        />
      </div>
    </div>
  );
}
