import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getBillingInvoices, calcBillingStats, filterInvoicesByStatus } from "@/lib/billing-db";
import type { BillingInvoiceStatus } from "@/lib/billing-types";
import StatsStrip from "./stats-strip";
import FilterRow from "./filter-row";
import DocumentCard from "./document-card";
import EmptyState from "./empty-state";

const INVOICE_FILTERS = ["all", "draft", "sent", "viewed", "paid", "overdue"];

interface BillingInvoicesListProps {
  filter?: string;
}

export default async function BillingInvoicesList({ filter }: BillingInvoicesListProps) {
  const companyId = await getCompanyIdFromCookie();
  const allInvoices = await getBillingInvoices(companyId);
  const stats = calcBillingStats(allInvoices);

  const activeFilter = (INVOICE_FILTERS.includes(filter ?? "all") ? filter ?? "all" : "all") as BillingInvoiceStatus | "all";
  const invoices = filterInvoicesByStatus(allInvoices, activeFilter);

  return (
    <div className="space-y-3">
      <StatsStrip
        total={stats.total}
        outstanding={stats.outstanding}
        collected={stats.collected}
      />

      <FilterRow
        filters={INVOICE_FILTERS}
        activeFilter={activeFilter}
        paramName="filter"
      />

      {invoices.length === 0 ? (
        <EmptyState type="invoices" />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <DocumentCard key={inv.id} doc={inv} />
          ))}
        </div>
      )}
    </div>
  );
}
