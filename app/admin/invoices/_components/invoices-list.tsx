import { getInvoices, filterOutstandingInvoices, filterPaidInvoices } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import Link from "next/link";
import { ChevronRight, ChevronLeft, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 15;

function safeInvoiceDate(createdAt: unknown): Date | null {
  if (!createdAt) return null;

  try {
    if (createdAt instanceof Date) {
      return isNaN(createdAt.getTime()) ? null : createdAt;
    }

    // Firestore Timestamp-like object
    if (typeof createdAt === "object" && createdAt !== null && "toDate" in createdAt) {
      const d = (createdAt as { toDate: () => Date }).toDate();
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(createdAt as any);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

const statusConfig: Record<string, { cls: string }> = {
  Draft: { cls: "badge-pending" },
  Sent: { cls: "badge-in-progress" },
  Paid: { cls: "badge-completed" },
  Outstanding: { cls: "badge-pending" },
};

export default async function InvoicesList({ page }: { page: number }) {
  const companyId = await getCompanyIdFromCookie();
  const allInvoices = await getInvoices(companyId);

  const total = allInvoices.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, total);
  const pageInvoices = allInvoices.slice(startIdx, endIdx);

  // Totals
  const totals = {
    outstanding: allInvoices
      .filter((i) => ["Outstanding", "Sent"].includes(i.status))
      .reduce((s, i) => s + i.total, 0),
    paid: allInvoices
      .filter((i) => i.status === "Paid")
      .reduce((s, i) => s + i.total, 0),
  };

  if (total === 0) {
    return (
      <div className="ios-card p-12 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(0,122,255,0.08)" }}
        >
          <span className="text-3xl">🧾</span>
        </div>
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          No invoices yet
        </p>
        <p className="text-[14px] mt-1" style={{ color: "var(--label-tertiary)" }}>
          Complete a job to create one
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Summary totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center"
              style={{ background: "rgba(255,59,48,0.10)" }}
            >
              <TrendingDown className="w-4 h-4" style={{ color: "var(--ios-red)" }} />
            </div>
          </div>
          <p
            className="text-[26px] font-bold tracking-tight stat-number"
            style={{ color: "var(--ios-red)" }}
          >
            R{totals.outstanding.toFixed(0)}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>
            Outstanding
          </p>
        </div>

        <div className="ios-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center"
              style={{ background: "rgba(52,199,89,0.10)" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "var(--ios-green)" }} />
            </div>
          </div>
          <p
            className="text-[26px] font-bold tracking-tight stat-number"
            style={{ color: "var(--ios-green)" }}
          >
            R{totals.paid.toFixed(0)}
          </p>
          <p className="text-[12px] mt-1 font-medium" style={{ color: "var(--label-tertiary)" }}>
            Collected
          </p>
        </div>
      </div>

      {/* Invoice list */}
      <div className="space-y-2.5">
        {pageInvoices.map((inv) => {
          const cfg = statusConfig[inv.status] ?? statusConfig.Draft;
          const createdDate = safeInvoiceDate(inv.createdAt);
          return (
            <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block touch-scale">
              <div className="ios-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cfg.cls}>{inv.status}</span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: "var(--label-quaternary)" }}
                      >
                        #{inv.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p
                      className="font-semibold text-[16px] truncate"
                      style={{ color: "var(--label-primary)" }}
                    >
                      {inv.clientName}
                    </p>
                    <p className="text-[13px] truncate mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                      {inv.jobTitle}
                    </p>
                    <p className="text-[12px] mt-1" style={{ color: "var(--label-quaternary)" }}>
                      {createdDate ? format(createdDate, "MMM d, yyyy") : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className="font-bold text-[18px] stat-number"
                        style={{ color: "var(--label-primary)" }}
                      >
                        R{inv.total.toFixed(0)}
                      </p>
                      {inv.vatEnabled && (
                        <p className="text-[11px]" style={{ color: "var(--label-quaternary)" }}>
                          incl. VAT
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ios-card p-4">
          <p className="text-center text-[12px] mb-3" style={{ color: "var(--label-tertiary)" }}>
            Showing {startIdx + 1}–{endIdx} of {total}
          </p>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/admin/invoices?page=${safePage - 1}`}
              aria-disabled={safePage === 1}
              className={`flex items-center gap-1 px-4 h-[44px] rounded-[12px] font-semibold text-[14px] transition-opacity active:opacity-75 ${
                safePage === 1 ? "pointer-events-none opacity-30" : ""
              }`}
              style={{ background: "rgba(120,120,128,0.12)", color: "var(--brand)" }}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Prev
            </Link>
            <span className="text-[14px] font-semibold" style={{ color: "var(--label-secondary)" }}>
              Page {safePage} of {totalPages}
            </span>
            <Link
              href={`/admin/invoices?page=${safePage + 1}`}
              aria-disabled={safePage === totalPages}
              className={`flex items-center gap-1 px-4 h-[44px] rounded-[12px] font-semibold text-[14px] transition-opacity active:opacity-75 ${
                safePage === totalPages ? "pointer-events-none opacity-30" : ""
              }`}
              style={{ background: "rgba(120,120,128,0.12)", color: "var(--brand)" }}
            >
              Next
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}

      {totalPages === 1 && total > 0 && (
        <p className="text-center text-[12px]" style={{ color: "var(--label-quaternary)" }}>
          Showing {startIdx + 1}–{endIdx} of {total}
        </p>
      )}
    </>
  );
}
