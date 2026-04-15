import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getBillingInvoices, calcBillingStats, filterInvoicesByStatus } from "@/lib/billing-db";
import type { BillingInvoiceStatus } from "@/lib/billing-types";
import type { Invoice as LegacyInvoice } from "@/lib/types";
import { getInvoices } from "@/lib/db";
import StatsStrip from "./stats-strip";
import FilterRow from "./filter-row";
import DocumentCard from "./document-card";
import EmptyState from "./empty-state";

const INVOICE_FILTERS = ["all", "draft", "sent", "viewed", "paid", "overdue"];

interface BillingInvoicesListProps {
  filter?: string;
}

function mapLegacyStatus(status: LegacyInvoice["status"]): BillingInvoiceStatus {
  switch (status) {
    case "Paid":
      return "paid";
    case "Outstanding":
      return "overdue";
    case "Sent":
      return "sent";
    case "Draft":
    default:
      return "draft";
  }
}

function legacyToBillingLike(inv: LegacyInvoice) {
  const status = mapLegacyStatus(inv.status);
  const issueDate = inv.createdAt || inv.updatedAt || inv.jobDate;
  // Old invoices didn't have document numbers; generate a stable, readable one.
  const documentNumber = `INV-${inv.id.slice(-6).toUpperCase()}`;

  return {
    id: inv.id,
    companyId: inv.companyId,
    documentNumber,
    type: "invoice" as const,
    title: inv.jobTitle || "Invoice",
    status,
    clientId: undefined,
    clientName: inv.clientName,
    clientEmail: inv.clientEmail,
    clientPhone: inv.clientPhone,
    clientAddress: undefined,
    clientVatNumber: undefined,
    jobId: inv.jobId,
    jobTitle: inv.jobTitle,
    issueDate,
    // No dueDate in legacy invoices; default to 30 days from issue.
    dueDate: issueDate,
    poNumber: undefined,
    paymentTerms: undefined,
    notes: undefined,
    lineItems: inv.items.map((it, idx) => ({
      id: it.id,
      name: it.description,
      description: undefined,
      quantity: it.quantity,
      unit: "unit",
      unitPrice: it.unitPrice,
      vatApplicable: inv.vatEnabled,
      vatRate: inv.vatRate,
      lineTotal: it.total,
      sortOrder: idx,
    })),
    subtotal: inv.subtotal,
    vatTotal: inv.vatAmount,
    total: inv.total,
    amountPaid: status === "paid" ? inv.total : 0,
    amountOutstanding: status === "paid" ? 0 : inv.total,
    depositRequired: false,
    depositAmount: undefined,
    depositPercentage: undefined,
    paymentLinkUrl: inv.paystackAuthorizationUrl,
    paymentLinkId: undefined,
    stitchPaymentRequestId: undefined,
    sourceQuoteId: undefined,
    pdfUrl: undefined,
    activityLog: [],
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  };
}

export default async function BillingInvoicesList({ filter }: BillingInvoicesListProps) {
  const companyId = await getCompanyIdFromCookie();
  const [billingInvoices, legacyInvoices] = await Promise.all([
    getBillingInvoices(companyId),
    getInvoices(companyId),
  ]);

  const legacyAsBilling = legacyInvoices.map(legacyToBillingLike);
  const allInvoices = [...billingInvoices, ...legacyAsBilling].sort((a, b) => b.issueDate.localeCompare(a.issueDate));
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
