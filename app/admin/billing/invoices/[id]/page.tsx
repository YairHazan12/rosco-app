import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getBillingInvoice } from "@/lib/billing-db";
import { formatZAR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/billing-types";
import InvoiceActions from "./_components/invoice-actions";
import ActivityTimeline from "../../_components/activity-timeline";
import DocumentCompanyBlock from "../../_components/document-company-block";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const companyId = await getCompanyIdFromCookie();
  const invoice = await getBillingInvoice(id, companyId);

  if (!invoice) notFound();

  const colors = STATUS_COLORS[invoice.status];
  const hasVat = invoice.lineItems.some((i) => i.vatApplicable);
  const isOverdue = invoice.status === "overdue";
  const isPaid = invoice.status === "paid";

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
          <h1 className="ios-large-title truncate" style={{ fontSize: "22px" }}>{invoice.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: "13px", color: "#7A8F82" }}>{invoice.documentNumber}</span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5"
              style={{ fontSize: "11px", fontWeight: 600, background: colors.bg, color: colors.text }}
            >
              {STATUS_LABELS[invoice.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Document type label — SARS requires "TAX INVOICE" on all VAT invoices */}
      <div className="px-5 mb-1">
        <span
          className="inline-flex items-center rounded-[8px] px-3 py-1"
          style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(74,128,255,0.10)", color: "#4A80FF" }}
        >
          Tax Invoice
        </span>
      </div>

      {/* Action buttons */}
      <InvoiceActions invoice={invoice} />

      {/* Company details (SARS + EFT banking) */}
      <DocumentCompanyBlock doc={invoice} />

      {/* Amount outstanding highlight */}
      {!isPaid && (
        <div className="mx-5 mb-3">
          <div
            className="rounded-[16px] px-4 py-4"
            style={{
              background: isOverdue ? "rgba(240,112,40,0.08)" : "rgba(60,200,100,0.06)",
              border: `1px solid ${isOverdue ? "rgba(240,112,40,0.20)" : "rgba(60,200,100,0.20)"}`,
            }}
          >
            <p style={{ fontSize: "12px", fontWeight: 600, color: isOverdue ? "#F07028" : "#2BA84A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              {isOverdue ? "Overdue" : "Amount Outstanding"}
            </p>
            <p className="stat-number" style={{ fontSize: "28px", fontWeight: 700, color: isOverdue ? "#F07028" : "#0F1A14" }}>
              {formatZAR(invoice.amountOutstanding)}
            </p>
            <p style={{ fontSize: "13px", color: "#7A8F82", marginTop: "2px" }}>
              Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      )}

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
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#0F1A14" }}>{invoice.clientName}</p>
            {invoice.clientEmail && <p style={{ fontSize: "13px", color: "#7A8F82" }}>{invoice.clientEmail}</p>}
            {invoice.clientPhone && <p style={{ fontSize: "13px", color: "#7A8F82" }}>{invoice.clientPhone}</p>}
            {invoice.clientAddress && <p style={{ fontSize: "13px", color: "#7A8F82" }}>{invoice.clientAddress}</p>}
            {invoice.clientVatNumber && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center rounded-[6px] px-2 py-0.5" style={{ fontSize: "11px", fontWeight: 600, background: "rgba(122,143,130,0.10)", color: "#7A8F82" }}>VAT</span>
                <span style={{ fontSize: "13px", color: "#1C2B22", fontFamily: "'JetBrains Mono','Fira Code',monospace", fontWeight: 600 }}>{invoice.clientVatNumber}</span>
              </div>
            )}
          </div>
          {/* Dates */}
          <div className="grid grid-cols-2 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="px-4 py-3">
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Issue Date</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="px-4 py-3">
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Due Date</p>
              <p style={{ fontSize: "14px", color: isOverdue ? "#F07028" : "#1C2B22" }}>{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          {/* Payment breakdown */}
          {(invoice.amountPaid > 0 || isPaid) && (
            <div className="grid grid-cols-2 divide-x" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="px-4 py-3">
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Paid</p>
                <p className="stat-number" style={{ fontSize: "14px", color: "#2BA84A", fontWeight: 600 }}>{formatZAR(invoice.amountPaid)}</p>
              </div>
              <div className="px-4 py-3">
                <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Outstanding</p>
                <p className="stat-number" style={{ fontSize: "14px", color: invoice.amountOutstanding > 0 ? "#F07028" : "#2BA84A", fontWeight: 600 }}>{formatZAR(invoice.amountOutstanding)}</p>
              </div>
            </div>
          )}
          {/* PO Number */}
          {invoice.poNumber && (
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>PO Number</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{invoice.poNumber}</p>
            </div>
          )}
          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <div className="px-4 py-3">
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Payment Terms</p>
              <p style={{ fontSize: "14px", color: "#1C2B22" }}>{invoice.paymentTerms}</p>
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
          {invoice.lineItems.length === 0 ? (
            <p className="px-4 py-4 text-center" style={{ fontSize: "14px", color: "#7A8F82" }}>No line items</p>
          ) : (
            invoice.lineItems.map((item, i) => (
              <div
                key={item.id}
                className="px-4 py-3.5"
                style={{ borderBottom: i < invoice.lineItems.length - 1 ? "1px solid rgba(0,0,0,0.06)" : undefined }}
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
              <span className="stat-number" style={{ fontSize: "13px", color: "#7A8F82" }}>{formatZAR(invoice.subtotal)}</span>
            </div>
            {hasVat && (
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: "13px", color: "#7A8F82" }}>VAT (15%)</span>
                <span className="stat-number" style={{ fontSize: "13px", color: "#7A8F82" }}>{formatZAR(invoice.vatTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#0F1A14" }}>TOTAL</span>
              <span className="stat-number" style={{ fontSize: "20px", fontWeight: 700, color: "#0F1A14" }}>{formatZAR(invoice.total)}</span>
            </div>
            {invoice.depositRequired && invoice.depositAmount != null && (
              <div className="flex justify-between mt-2 rounded-[8px] px-3 py-2" style={{ background: "rgba(240,112,40,0.08)" }}>
                <span style={{ fontSize: "13px", color: "#F07028", fontWeight: 500 }}>
                  Deposit ({invoice.depositPercentage}%)
                </span>
                <span className="stat-number" style={{ fontSize: "13px", color: "#F07028", fontWeight: 600 }}>{formatZAR(invoice.depositAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
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
            <p style={{ fontSize: "14px", color: "#1C2B22", lineHeight: "1.5" }}>{invoice.notes}</p>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <ActivityTimeline events={invoice.activityLog} />
    </div>
  );
}
