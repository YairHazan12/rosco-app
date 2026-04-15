import Link from "next/link";
import { Eye, Send, MoreHorizontal, ChevronRight } from "lucide-react";
import {
  type Quote,
  type BillingInvoice,
  STATUS_COLORS,
  STATUS_LABELS,
  formatZAR,
  formatDate,
} from "@/lib/billing-types";

interface DocumentCardProps {
  doc: Quote | BillingInvoice;
}

export default function DocumentCard({ doc }: DocumentCardProps) {
  const statusStyle = STATUS_COLORS[doc.status] ?? STATUS_COLORS.draft;
  const href =
    doc.type === "quote"
      ? `/admin/billing/quotes/${doc.id}`
      : `/admin/billing/invoices/${doc.id}`;

  return (
    <div
      className="mx-5 rounded-[16px] overflow-hidden touch-scale"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex">
        {/* Left accent bar */}
        <div
          className="flex-shrink-0"
          style={{ width: "3px", background: statusStyle.bar, borderRadius: "3px 0 0 3px" }}
        />

        <div className="flex-1 p-4 min-w-0">
          {/* Row 1: document number + status badge */}
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#7A8F82",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              {doc.documentNumber}
            </span>
            <span
              className="rounded-[100px] px-2.5 py-0.5"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                background: statusStyle.bg,
                color: statusStyle.text,
              }}
            >
              {STATUS_LABELS[doc.status]}
            </span>
          </div>

          {/* Row 2: client name (visual anchor) */}
          <Link href={href}>
            <p
              className="font-bold truncate mb-1"
              style={{ fontSize: "16px", color: "#0F1A14" }}
            >
              {doc.clientName}
            </p>
          </Link>

          {/* Row 3: job/document title */}
          {doc.title && (
            <p className="truncate mb-2" style={{ fontSize: "13px", color: "#7A8F82" }}>
              {doc.title}
            </p>
          )}

          {/* Row 4: date + amount */}
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: "12px", color: "#7A8F82" }}>
              {formatDate(doc.issueDate)}
            </span>
            <span
              className="stat-number"
              style={{ fontSize: "16px", fontWeight: 700, color: "#0F1A14" }}
            >
              {formatZAR(doc.total)}
            </span>
          </div>

          {/* Row 5: action strip */}
          <div
            className="flex items-center gap-2 pt-3"
            style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
          >
            <Link href={`${href}?action=send`}>
              <button
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-opacity active:opacity-70"
                style={{ background: "#F5F8F6" }}
                aria-label="Send"
              >
                <Send className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
              </button>
            </Link>

            <Link href={`${href}?preview=true`}>
              <button
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-opacity active:opacity-70"
                style={{ background: "#F5F8F6" }}
                aria-label="Preview"
              >
                <Eye className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
              </button>
            </Link>

            <Link href={href}>
              <button
                className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-opacity active:opacity-70"
                style={{ background: "#F5F8F6" }}
                aria-label="More"
              >
                <MoreHorizontal className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
              </button>
            </Link>

            <div className="flex-1" />

            <Link href={href} className="flex items-center gap-1">
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#7A8F82" }}>View</span>
              <ChevronRight className="w-4 h-4" style={{ color: "#D0D9D4" }} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
