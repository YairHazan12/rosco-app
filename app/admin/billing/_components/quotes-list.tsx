import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getQuotes, calcBillingStats, filterQuotesByStatus } from "@/lib/billing-db";
import type { QuoteStatus } from "@/lib/billing-types";
import StatsStrip from "./stats-strip";
import FilterRow from "./filter-row";
import DocumentCard from "./document-card";
import EmptyState from "./empty-state";

const QUOTE_FILTERS = ["all", "draft", "sent", "viewed", "accepted", "expired"];

interface QuotesListProps {
  filter?: string;
}

export default async function QuotesList({ filter }: QuotesListProps) {
  const companyId = await getCompanyIdFromCookie();
  const allQuotes = await getQuotes(companyId);
  const stats = calcBillingStats(allQuotes);

  const activeFilter = (QUOTE_FILTERS.includes(filter ?? "all") ? filter ?? "all" : "all") as QuoteStatus | "all";
  const quotes = filterQuotesByStatus(allQuotes, activeFilter);

  return (
    <div className="space-y-3">
      <StatsStrip
        total={stats.total}
        outstanding={stats.outstanding}
        collected={stats.collected}
      />

      <FilterRow
        filters={QUOTE_FILTERS}
        activeFilter={activeFilter}
        paramName="filter"
      />

      {quotes.length === 0 ? (
        <EmptyState type="quotes" />
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <DocumentCard key={q.id} doc={q} />
          ))}
        </div>
      )}
    </div>
  );
}
