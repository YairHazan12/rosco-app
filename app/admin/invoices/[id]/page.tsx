import { getInvoice } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import InvoiceActions from "../_components/InvoiceActions";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { cls: string }> = {
  Draft:       { cls: "badge-pending" },
  Sent:        { cls: "badge-in-progress" },
  Paid:        { cls: "badge-completed" },
  Outstanding: { cls: "badge-pending" },
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const cfg = statusConfig[invoice.status] ?? statusConfig.Draft;

  return (
    <div className="space-y-4 pb-8">
      {/* Back nav */}
      <div>
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-1 -ml-1 min-h-[44px] px-1"
          style={{ color: "var(--brand)" }}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-[17px]">Invoices</span>
        </Link>

        <div className="flex items-center justify-between mt-1">
          <div>
            <p
              className="text-[12px] font-mono"
              style={{ color: "var(--label-tertiary)" }}
            >
              #{invoice.id.slice(-8).toUpperCase()}
            </p>
            <h1
              className="text-[22px] font-bold"
              style={{ color: "var(--label-primary)", letterSpacing: "-0.3px" }}
            >
              {invoice.clientName}
            </h1>
          </div>
          <span className={cfg.cls}>{invoice.status}</span>
        </div>
      </div>

      {/* Job details */}
      <div>
        <p className="ios-section-header mb-2">Job Details</p>
        <div className="ios-group">
          <div className="ios-group-row">
            <div className="flex-1">
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Job</p>
              <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                {invoice.jobTitle}
              </p>
            </div>
          </div>
          <div className="ios-group-row">
            <div className="flex-1">
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Date</p>
              <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                {format(new Date(invoice.jobDate), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="ios-group-row">
            <div className="flex-1">
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Location</p>
              <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                {invoice.jobLocation}
              </p>
            </div>
          </div>
          {invoice.clientEmail && (
            <div className="ios-group-row">
              <div className="flex-1">
                <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Email</p>
                <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                  {invoice.clientEmail}
                </p>
              </div>
            </div>
          )}
          {invoice.clientPhone && (
            <div className="ios-group-row">
              <div className="flex-1">
                <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Phone</p>
                <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                  {invoice.clientPhone}
                </p>
              </div>
            </div>
          )}
          {invoice.handymanName && (
            <div className="ios-group-row">
              <div className="flex-1">
                <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Handyman</p>
                <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                  {invoice.handymanName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div>
        <p className="ios-section-header mb-2">Services</p>
        <div className="ios-card p-4">
          <div className="space-y-3.5">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium" style={{ color: "var(--label-primary)" }}>
                    {item.description}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                      {item.quantity} × ₪{item.unitPrice.toFixed(2)}
                    </p>
                  )}
                </div>
                <p
                  className="text-[15px] font-semibold flex-shrink-0"
                  style={{ color: "var(--label-primary)" }}
                >
                  ₪{item.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-4 pt-4 space-y-2"
            style={{ borderTop: "0.5px solid var(--separator)" }}
          >
            <div
              className="flex justify-between text-[14px]"
              style={{ color: "var(--label-tertiary)" }}
            >
              <span>Subtotal</span>
              <span>₪{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.vatEnabled && (
              <div
                className="flex justify-between text-[14px]"
                style={{ color: "var(--label-tertiary)" }}
              >
                <span>VAT ({(invoice.vatRate * 100).toFixed(0)}%)</span>
                <span>₪{invoice.vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between font-bold pt-2"
              style={{ borderTop: "0.5px solid var(--separator)" }}
            >
              <span className="text-[17px]" style={{ color: "var(--label-primary)" }}>
                Total
              </span>
              <span className="text-[22px]" style={{ color: "var(--brand)", letterSpacing: "-0.3px" }}>
                ₪{invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment link */}
      <div>
        <p className="ios-section-header mb-2">Payment Link</p>
        <div className="ios-group">
          <div className="ios-group-row">
            <a
              href={`/pay/${invoice.id}`}
              target="_blank"
              className="text-[14px] break-all"
              style={{ color: "var(--ios-blue)" }}
            >
              /pay/{invoice.id}
            </a>
          </div>
        </div>
      </div>

      <InvoiceActions invoice={invoice} />

      {invoice.paidAt && (
        <p
          className="text-[14px] font-medium text-center"
          style={{ color: "var(--ios-green)" }}
        >
          ✅ Paid {format(new Date(invoice.paidAt), "MMMM d, yyyy")}
        </p>
      )}
    </div>
  );
}
