import { getInvoices } from "@/lib/db";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { cls: string }> = {
  Draft:       { cls: "badge-pending" },
  Sent:        { cls: "badge-in-progress" },
  Paid:        { cls: "badge-completed" },
  Outstanding: { cls: "badge-pending" },
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const totals = {
    outstanding: invoices
      .filter(i => ["Outstanding", "Sent"].includes(i.status))
      .reduce((s, i) => s + i.total, 0),
    paid: invoices
      .filter(i => i.status === "Paid")
      .reduce((s, i) => s + i.total, 0),
  };

  return (
    <div className="space-y-5">
      <h1 className="ios-large-title pt-1">Invoices</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="ios-card p-4"
          style={{ borderLeft: "3px solid var(--ios-red)" }}
        >
          <p className="text-[12px] font-medium mb-1" style={{ color: "var(--label-tertiary)" }}>
            Outstanding
          </p>
          <p className="text-[24px] font-bold tracking-tight" style={{ color: "var(--ios-red)" }}>
            ₪{totals.outstanding.toFixed(0)}
          </p>
        </div>
        <div
          className="ios-card p-4"
          style={{ borderLeft: "3px solid var(--ios-green)" }}
        >
          <p className="text-[12px] font-medium mb-1" style={{ color: "var(--label-tertiary)" }}>
            Collected
          </p>
          <p className="text-[24px] font-bold tracking-tight" style={{ color: "var(--ios-green)" }}>
            ₪{totals.paid.toFixed(0)}
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <span className="text-4xl">🧾</span>
          <p className="font-semibold text-[17px] mt-3" style={{ color: "var(--label-primary)" }}>
            No invoices yet
          </p>
          <p className="text-[14px] mt-1" style={{ color: "var(--label-tertiary)" }}>
            Complete a job to create one
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv) => {
            const cfg = statusConfig[inv.status] ?? statusConfig.Draft;
            return (
              <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block touch-scale">
                <div className="ios-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={cfg.cls}>{inv.status}</span>
                        <span
                          className="text-[12px] font-mono"
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
                        {format(new Date(inv.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-[17px]" style={{ color: "var(--label-primary)" }}>
                          ₪{inv.total.toFixed(0)}
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
      )}
    </div>
  );
}
