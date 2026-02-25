import { getJobs, getInvoices, filterTodayJobs, filterOutstandingInvoices, filterPaidInvoices } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { Briefcase, TrendingUp, AlertCircle } from "lucide-react";

export default async function KPIStrip() {
  const companyId = await getCompanyIdFromCookie();
  const [allJobs, allInvoices] = await Promise.all([getJobs(companyId), getInvoices(companyId)]);

  const todayJobs = filterTodayJobs(allJobs);
  const outstanding = filterOutstandingInvoices(allInvoices);
  const paidInvoices = filterPaidInvoices(allInvoices);

  const doneToday = todayJobs.filter((j) => j.status === "Completed").length;
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
  const outstandingTotal = outstanding.reduce((s, i) => s + i.total, 0);

  const fmtZAR = (n: number) =>
    n >= 1000 ? `R${(n / 1000).toFixed(1)}k` : `R${n.toFixed(0)}`;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Today */}
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
          Today
        </p>
        {todayJobs.length > 0 && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--ios-green)" }}>
            {doneToday}/{todayJobs.length} done
          </p>
        )}
      </div>

      {/* Unpaid */}
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
          Unpaid
        </p>
        {outstanding.length > 0 && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--ios-red)" }}>
            R{outstandingTotal.toFixed(0)}
          </p>
        )}
      </div>

      {/* Revenue */}
      <div className="ios-card p-4">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
          style={{ background: "rgba(52,199,89,0.10)" }}
        >
          <TrendingUp className="w-[18px] h-[18px]" style={{ color: "var(--ios-green)" }} />
        </div>
        <p
          className="text-[22px] font-bold tracking-tight leading-none stat-number"
          style={{ color: "var(--label-primary)" }}
        >
          {fmtZAR(totalRevenue)}
        </p>
        <p className="text-[12px] mt-1.5 font-medium" style={{ color: "var(--label-tertiary)" }}>
          Collected
        </p>
      </div>
    </div>
  );
}
