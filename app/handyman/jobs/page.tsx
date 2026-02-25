/**
 * Handyman — All Jobs list · Server Component with Suspense streaming.
 *
 * The page shell renders instantly with header.
 * Jobs data streams in via async component wrapped in Suspense.
 */
import { Suspense } from "react";
import AllJobsList from "./_components/all-jobs-list";
import AllJobsSkeleton from "./_components/all-jobs-skeleton";

export const dynamic = "force-dynamic";

export default async function AllJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  return (
    <div className="space-y-6 pb-4">
      {/* Header — renders immediately */}
      <div className="pt-2">
        <h1 className="ios-large-title">All Jobs</h1>
        {/* Total count will appear after data loads */}
      </div>

      {/* Jobs list streams in */}
      <Suspense fallback={<AllJobsSkeleton />}>
        <AllJobsList page={page} />
      </Suspense>
    </div>
  );
}
