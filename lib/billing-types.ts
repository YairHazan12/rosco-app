// ─── Status Enums ────────────────────────────────────────────────────────────

export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "expired";
export type BillingInvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue";

// ─── Line Items ───────────────────────────────────────────────────────────────

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatApplicable: boolean;
  vatRate: number;           // e.g. 0.15 for 15%
  lineTotal: number;         // qty × unitPrice × (1 + vatRate if applicable)
  sortOrder: number;
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export type ActivityEventType =
  | "created"
  | "sent"
  | "viewed"
  | "accepted"
  | "link_generated"
  | "paid"
  | "edited"
  | "overdue"
  | "converted";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;          // ISO 8601
  description: string;
  metadata?: Record<string, unknown>;
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export interface Quote {
  id: string;
  companyId: string;
  documentNumber: string;    // "RQ-0001"
  type: "quote";
  title: string;
  status: QuoteStatus;
  // Company info (denormalized for document rendering — SARS requirement)
  companyName?: string;
  companyVatNumber?: string;      // SARS VAT registration number
  companyRegistrationNumber?: string; // CIPC registration number
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  // Banking details for EFT (shown on document)
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  branchCode?: string;
  bankAccountType?: string;
  // Client info (denormalized for display — SARS requirement)
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientVatNumber?: string;       // Client VAT reg number (if VAT registered)
  // Job link (optional)
  jobId?: string;
  jobTitle?: string;
  // Dates
  issueDate: string;          // ISO 8601 date string
  validUntil: string;         // ISO 8601 date string
  // Optional fields
  poNumber?: string;
  paymentTerms?: string;      // e.g. "30 days", "On receipt"
  notes?: string;
  // Line items & totals
  lineItems: LineItem[];
  subtotal: number;           // sum of (qty × unitPrice) before VAT
  vatTotal: number;           // sum of all VAT amounts
  total: number;              // subtotal + vatTotal
  // Deposit
  depositRequired: boolean;
  depositAmount?: number;     // absolute amount
  depositPercentage?: number; // e.g. 50 for 50%
  // Payment
  paymentLinkUrl?: string;
  paymentLinkId?: string;
  // PDF
  pdfUrl?: string;
  // Activity
  activityLog: ActivityEvent[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ─── Billing Invoice ──────────────────────────────────────────────────────────

export interface BillingInvoice {
  id: string;
  companyId: string;
  documentNumber: string;    // "RI-0001"
  type: "invoice";
  title: string;
  status: BillingInvoiceStatus;
  // Company info (denormalized for document rendering — SARS requirement)
  companyName?: string;
  companyVatNumber?: string;      // SARS VAT registration number
  companyRegistrationNumber?: string; // CIPC registration number
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  // Banking details for EFT (SARS-compliant invoices should include this)
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  branchCode?: string;
  bankAccountType?: string;
  // Client info (denormalized for display — SARS requirement)
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientVatNumber?: string;       // Client VAT reg number (if VAT registered)
  // Job link (optional)
  jobId?: string;
  jobTitle?: string;
  // Dates
  issueDate: string;
  dueDate: string;
  // Optional fields
  poNumber?: string;
  paymentTerms?: string;      // e.g. "30 days", "On receipt"
  notes?: string;
  // Line items & totals
  lineItems: LineItem[];
  subtotal: number;
  vatTotal: number;
  total: number;
  amountPaid: number;
  amountOutstanding: number;
  // Deposit
  depositRequired: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  // Payment
  paymentLinkUrl?: string;
  paymentLinkId?: string;
  stitchPaymentRequestId?: string;
  // Quote conversion
  sourceQuoteId?: string;
  // PDF
  pdfUrl?: string;
  // Activity
  activityLog: ActivityEvent[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ─── Document Counters ────────────────────────────────────────────────────────

export interface BillingCounters {
  lastQuoteNumber: number;
  lastInvoiceNumber: number;
  updatedAt: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export type BillingDocument = Quote | BillingInvoice;

export const STATUS_LABELS: Record<QuoteStatus | BillingInvoiceStatus, string> = {
  draft:    "Draft",
  sent:     "Sent",
  viewed:   "Viewed",
  accepted: "Accepted",
  expired:  "Expired",
  paid:     "Paid",
  overdue:  "Overdue",
};

export const STATUS_COLORS: Record<QuoteStatus | BillingInvoiceStatus, {
  bar: string;
  bg: string;
  text: string;
}> = {
  draft:    { bar: "#7A8F82", bg: "rgba(122,143,130,0.10)", text: "#7A8F82" },
  sent:     { bar: "#4A80FF", bg: "rgba(74,128,255,0.10)",  text: "#4A80FF" },
  viewed:   { bar: "#9B59D9", bg: "rgba(155,89,217,0.10)",  text: "#9B59D9" },
  accepted: { bar: "#3CC864", bg: "rgba(60,200,100,0.10)",  text: "#2BA84A" },
  expired:  { bar: "#7A8F82", bg: "rgba(122,143,130,0.10)", text: "#7A8F82" },
  paid:     { bar: "#3CC864", bg: "rgba(60,200,100,0.10)",  text: "#2BA84A" },
  overdue:  { bar: "#F07028", bg: "rgba(240,112,40,0.10)",  text: "#F07028" },
};

/** Format ZAR: "R 1 200.00" */
export function formatZAR(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount).replace("ZAR", "R");
}

/** Format date as "25 Mar 2026" */
export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Calculate line total */
export function calcLineTotal(item: Omit<LineItem, "lineTotal" | "id" | "sortOrder">): number {
  const base = item.quantity * item.unitPrice;
  return item.vatApplicable ? base * (1 + item.vatRate) : base;
}

/** Recalculate document totals from line items */
export function calcTotals(lineItems: LineItem[]): {
  subtotal: number;
  vatTotal: number;
  total: number;
} {
  let subtotal = 0;
  let vatTotal = 0;
  for (const item of lineItems) {
    const base = item.quantity * item.unitPrice;
    subtotal += base;
    if (item.vatApplicable) vatTotal += base * item.vatRate;
  }
  return { subtotal, vatTotal, total: subtotal + vatTotal };
}
