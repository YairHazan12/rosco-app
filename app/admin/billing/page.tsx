import { Suspense } from "react";
import Link from "next/link";
import SegmentControl from "./_components/segment-control";
import QuotesList from "./_components/quotes-list";
import BillingInvoicesList from "./_components/billing-invoices-list";
import BillingSkeleton from "./_components/billing-skeleton";

export const dynamic = "force-dynamic";

interface BillingPageProps {
  searchParams: Promise<{ tab?: string; filter?: string }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { tab, filter } = await searchParams;
  const activeTab = tab === "invoices" ? "invoices" : "quotes";

  const newHref = activeTab === "quotes" ? "/admin/billing/quotes/new" : "/admin/billing/invoices/new";
  const newLabel = activeTab === "quotes" ? "+ New Quote" : "+ New Invoice";

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-2">
        <h1 className="ios-large-title">Billing</h1>
        <Link href={newHref}>
          <button
            className="flex items-center gap-1.5 font-semibold rounded-[14px] text-white transition-all active:scale-[0.97] active:opacity-90"
            style={{
              height: "44px",
              padding: "0 20px",
              fontSize: "14px",
              background: "#F07028",
              boxShadow: "0px 4px 16px rgba(240,112,40,0.28)",
            }}
          >
            {newLabel}
          </button>
        </Link>
      </div>

      {/* Segment control */}
      <SegmentControl activeTab={activeTab} />

      {/* Content */}
      <Suspense fallback={<BillingSkeleton />}>
        {activeTab === "quotes" ? (
          <QuotesList filter={filter} />
        ) : (
          <BillingInvoicesList filter={filter} />
        )}
      </Suspense>
    </div>
  );
}
