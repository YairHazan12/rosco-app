/**
 * Jobs list — Server Component with Suspense streaming.
 *
 * The page shell renders instantly with header and button.
 * Jobs data streams in via async component wrapped in Suspense.
 */
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import JobsList from "./_components/jobs-list";
import JobsListSkeleton from "./_components/jobs-list-skeleton";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  return (
    <div className="space-y-5">
      {/* Header — renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ios-large-title">Jobs</h1>
          {/* Total count will appear after data loads, but shell is instant */}
        </div>
        <Link href="/admin/jobs/new">
          <button
            className="flex items-center gap-1.5 font-semibold text-[15px] px-4 h-[44px] rounded-[12px] text-white transition-opacity active:opacity-75"
            style={{
              background: "linear-gradient(145deg, #FF7A47, #FF5500)",
              boxShadow: "0 3px 10px rgba(255,107,53,0.30)",
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Job
          </button>
        </Link>
      </div>

      {/* Jobs list streams in */}
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsList page={page} />
      </Suspense>
    </div>
  );
}
