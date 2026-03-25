import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getQuote } from "@/lib/billing-db";
import { formatZAR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/billing-types";
import QuoteActions from "./_components/quote-actions";
import ActivityTimeline from "../../_components/activity-timeline";
import DocumentCompanyBlock from "../../_components/document-company-block";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;
  const companyId = await getCompanyIdFromCookie();
  const quote = await getQuote(id, companyId);

  if (!quote) notFound();

  const colors = STATUS_COLORS[quote.status];
  const hasVat = quote.lineItems.some((i) => i.vatApplicable);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <Link
          href="/admin/billing"
          className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity active:opacity-60"
          style={{ background: "rgba(0,0,0,0.05)" }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#0F1A14" }} strokeWidth={2} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="ios-large-title truncate" style={{ fontSize: "22px" }}>{quote.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: "13px", color: "#7A8F82" }}>{quote.documentNumber}</span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5"
              style={{ fontSize: "11px", fontWeight: 600, background: colors.bg, color: colors.text }}
            >
              {STATUS_LABELS[quote.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Document type label — SARS compliance */}
      <div className="px-5 mb-1">
        <span
          className="inline-flex items-center rounded-[8px] px-3 py-1"
          style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(60,200,100,0.10)", color: "#2BA84A" }}
        >
          Quote
        </span>
      </div>

      {/* Action buttons */}
      <QuoteActions quote={quote} />

      {/* Company details (SARS) */}
      <DocumentCompanyBlock doc={quote} />

      {/* Client & dates card */}
      <div className="mx-5 mb-3">
        <div
          className="rounded-[16px] overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Client */}
          <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Client</p>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#0F1A14" }}>{quote.clientName}</p>
            {quote.clientEmail && <p style={{ fontSize: "13px", color: "#7A8F82" }}>{quote.clientEmail}</p>}
            {quote.clientPhone && <p style={{ fontSize: "13px", color: "#7A8F82" }}>{quote.clientPhone}</p>}
            {quote.clientAddress && <p style={{ fontSize: "13px", color: "#7A8F82" }}>{quote.clientAddress}</p>}
            {quote.clientVatNumber && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center rounded-[6px] px-2 py-0.5" style={{ fontSize: "11px", fontWeight: 600, background: "rgba(122,143,130,0.10)", color: "#7A8F82" }}>VAT</span>
                <span style={{ fontSize: "13px", color: "#1C2B22", fontFamily: "'JetBrains Mono','Fira Code',monospace", fontWeight: 600 }}>{quote.clientVatNumber}</span>
              </div>
            )}
          </div>
          {/* Dates */}
          <div className="grid grid-cols-2 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3">
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Issue Date</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{formatDate(quote.issueDate)}</p>
            </div>
            <div className="px-4 py-3">
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Valid Until</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{formatDate(quote.validUntil)}</p>
            </div>
          </div>
          {/* PO Number */}
          {quote.poNumber && (
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>PO Number</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{quote.poNumber}</p>
            </div>
          )}
          {/* Payment Terms */}
          {quote.paymentTerms && (
            <div className="px-4 py-3">
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Payment Terms</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{quote.paymentTerms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="mx-5 mb-3">
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
          Line Items
        </p>
        <div
          className="rounded-[16px] overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          {quote.lineItems.length === 0 ? (
            <p className="px-4 py-4 text-center" style={{ fontSize: "14px", color: "#7A8F82" }}>No line items</p>
          ) : (
            quote.lineItems.map((item, i) => (
              <div
                key={item.id}
                className="px-4 py-3.5"
                style={{ borderBottom: i < quote.lineItems.length - 1 ? "1px solid rgba(0,0,0,0.06)" : undefined }}
              >
                <div className="flex justify-between items-start mb-1">
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>{item.name}</p>
                  <p className="stat-number" style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>{formatZAR(item.lineTotal)}</p>
                </div>
                <p style={{ fontSize: "13px", color: "#7A8F82" }}>
                  {item.quantity} {item.unit} × {formatZAR(item.unitPrice)}
                  {item.vatApplicable && <span style={{ color: "#3CC864" }}> (incl. VAT)</span>}
                </p>
                {item.description && (
                  <p style={{ fontSize: "12px", color: "#7A8F82", marginTop: "2px" }}>{item.description}</p>
                )}
              </div>
            ))
          )}

          {/* Totals */}
          <div className="px-4 py-3.5" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "#F5F8F6" }}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: "13px", color: "#7A8F82" }}>Subtotal (excl. VAT)</span>
              <span className="stat-number" style={{ fontSize: "13px", color: "#7A8F82" }}>{formatZAR(quote.subtotal)}</span>
            </div>
            {hasVat && (
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: "13px", color: "#7A8F82" }}>VAT (15%)</span>
                <span className="stat-number" style={{ fontSize: "13px", color: "#7A8F82" }}>{formatZAR(quote.vatTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#0F1A14" }}>TOTAL</span>
              <span className="stat-number" style={{ fontSize: "20px", fontWeight: 700, color: "#0F1A14" }}>{formatZAR(quote.total)}</span>
            </div>
            {quote.depositRequired && quote.depositAmount != null && (
              <div className="flex justify-between mt-2 rounded-[8px] px-3 py-2" style={{ background: "rgba(240,112,40,0.08)" }}>
                <span style={{ fontSize: "13px", color: "#F07028", fontWeight: 500 }}>
                  Deposit Required ({quote.depositPercentage}%)
                </span>
                <span className="stat-number" style={{ fontSize: "13px", color: "#F07028", fontWeight: 600 }}>{formatZAR(quote.depositAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="mx-5 mb-3">
          <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
            Notes
          </p>
          <div
            className="rounded-[16px] px-4 py-3.5"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <p style={{ fontSize: "14px", color: "#1C2B22", lineHeight: "1.5" }}>{quote.notes}</p>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <ActivityTimeline events={quote.activityLog} />
    </div>
  );
}
