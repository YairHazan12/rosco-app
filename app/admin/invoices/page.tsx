/**
 * Invoices list — Server Component with Suspense streaming.
 *
 * The page shell renders instantly with header.
 * Invoice data (including summary totals) streams in via async component wrapped in Suspense.
 */
import { Suspense } from "react";
import InvoicesList from "./_components/invoices-list";
import InvoicesListSkeleton from "./_components/invoices-list-skeleton";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  return (
    <div className="space-y-5">
      {/* Header — renders immediately */}
      <h1 className="ios-large-title pt-1">Invoices</h1>

      {/* Summary + invoices stream in together */}
      <Suspense fallback={<InvoicesListSkeleton />}>
        <InvoicesList page={page} />
      </Suspense>
    </div>
  );
}
