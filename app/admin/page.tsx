import { Suspense } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";

// Async components
import KPIStrip from "./_components/kpi-strip";
import JobPipeline from "./_components/job-pipeline";
import TodayProgress from "./_components/today-progress";
import TodayJobs from "./_components/today-jobs";
import UpcomingJobs from "./_components/upcoming-jobs";
import TeamUtilization from "./_components/team-utilization";
import OutstandingInvoices from "./_components/outstanding-invoices";
import RecentJobs from "./_components/recent-jobs";
import BankSetupBanner from "./_components/bank-setup-banner";

// Skeletons
import {
  KPISkeleton,
  PipelineSkeleton,
  TodayProgressSkeleton,
  JobsSkeleton,
  TeamSkeleton,
  InvoicesSkeleton,
} from "./_components/skeletons";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Bank Setup Banner (if not configured) ───── */}
      <BankSetupBanner />

      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium" style={{ color: "var(--label-tertiary)" }}>
            {format(new Date(), "EEEE")}
          </p>
          <h1 className="ios-large-title mt-0.5">{format(new Date(), "MMMM d, yyyy")}</h1>
        </div>
        <Link href="/admin/jobs/new">
          <button
            className="flex items-center gap-1.5 font-semibold text-[15px] px-5 h-[48px] rounded-[14px] text-white transition-all active:scale-[0.97] active:opacity-90"
            style={{
              background: "#F07028",
              boxShadow: "0px 4px 16px rgba(240, 112, 40, 0.30)",
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Job
          </button>
        </Link>
      </div>

      {/* ── KPI Strip ───────────────────────────────── */}
      <Suspense fallback={<KPISkeleton />}>
        <KPIStrip />
      </Suspense>

      {/* ── Job Pipeline ─────────────────────────────── */}
      <Suspense fallback={<PipelineSkeleton />}>
        <JobPipeline />
      </Suspense>

      {/* ── Today Progress ──────────────────────────── */}
      <Suspense fallback={<TodayProgressSkeleton />}>
        <TodayProgress />
      </Suspense>

      {/* ── Today's Jobs ─────────────────────────────── */}
      <Suspense fallback={<JobsSkeleton />}>
        <TodayJobs />
      </Suspense>

      {/* ── Upcoming Jobs ───────────────────────────── */}
      <Suspense fallback={<JobsSkeleton />}>
        <UpcomingJobs />
      </Suspense>

      {/* ── Handyman Utilization ─────────────────────── */}
      <Suspense fallback={<TeamSkeleton />}>
        <TeamUtilization />
      </Suspense>

      {/* ── Outstanding Invoices ──────────────────────── */}
      <Suspense fallback={<InvoicesSkeleton />}>
        <OutstandingInvoices />
      </Suspense>

      {/* ── Recent Jobs ─────────────────────────────── */}
      <Suspense fallback={<JobsSkeleton />}>
        <RecentJobs />
      </Suspense>
    </div>
  );
}
