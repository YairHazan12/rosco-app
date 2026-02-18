import { getInvoice } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Wrench, MapPin, Calendar, CheckCircle2, ShieldCheck } from "lucide-react";
import PayButton from "./_components/PayButton";

export const dynamic = "force-dynamic";

export default async function CustomerPayPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  if (invoiceId === "demo") return <DemoPage />;

  const invoice = await getInvoice(invoiceId);
  if (!invoice) notFound();

  const isPaid = invoice.status === "Paid";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--bg-primary)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="ios-header sticky top-0 z-20"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
            ROSCO
          </span>
        </div>
      </header>

      {/* Scrollable content */}
      <div
        className="flex-1 max-w-[430px] mx-auto w-full px-4 space-y-3"
        style={{
          paddingTop: 20,
          paddingBottom: isPaid ? 40 : 130,
        }}
      >
        {/* Paid banner */}
        {isPaid && (
          <div
            className="rounded-2xl p-6 text-center animate-fade-up"
            style={{ background: "var(--ios-green)" }}
          >
            <CheckCircle2 className="w-10 h-10 text-white mx-auto mb-2" />
            <p className="text-white font-bold text-[20px]">Payment Received!</p>
            <p className="text-white/80 text-[14px] mt-1">Thank you for your business</p>
            {invoice.paidAt && (
              <p className="text-white/60 text-[12px] mt-1">
                Paid {format(new Date(invoice.paidAt), "MMMM d, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Invoice header card */}
        <div className="ios-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="text-[12px] font-mono mb-1"
                style={{ color: "var(--label-tertiary)" }}
              >
                Invoice #{invoice.id.slice(-8).toUpperCase()}
              </p>
              <p
                className="text-[20px] font-bold"
                style={{ color: "var(--label-primary)", letterSpacing: "-0.3px" }}
              >
                {invoice.clientName}
              </p>
            </div>
            <span
              className="text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{
                background: isPaid ? "rgba(52,199,89,0.12)" : "rgba(255,107,53,0.12)",
                color: isPaid ? "#248A3D" : "var(--brand)",
              }}
            >
              {invoice.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[14px]" style={{ color: "var(--label-secondary)" }}>
              <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--label-quaternary)" }} />
              {format(new Date(invoice.jobDate), "MMMM d, yyyy")}
            </div>
            <div className="flex items-start gap-2 text-[14px]" style={{ color: "var(--label-secondary)" }}>
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--label-quaternary)" }} />
              {invoice.jobLocation}
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="ios-card p-5">
          <p className="ios-section-header mb-4">Services</p>
          <div className="space-y-3.5">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
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

          {/* Totals */}
          <div
            className="mt-5 pt-4 space-y-2"
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
              className="flex justify-between items-center pt-2"
              style={{ borderTop: "0.5px solid var(--separator)" }}
            >
              <span
                className="text-[17px] font-bold"
                style={{ color: "var(--label-primary)" }}
              >
                Total
              </span>
              <span
                className="text-[28px] font-bold tracking-tight"
                style={{ color: "var(--brand)", letterSpacing: "-0.5px" }}
              >
                ₪{invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed pay bar */}
      {!isPaid && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 16px)",
            background: "rgba(242,242,247,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "0.5px solid var(--separator)",
          }}
        >
          <div className="max-w-[430px] mx-auto px-4 pt-3 pb-2 space-y-2.5">
            <PayButton invoice={invoice} />
            <div
              className="flex items-center justify-center gap-1.5 text-[12px]"
              style={{ color: "var(--label-tertiary)" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Secured by Stripe · Card · Apple Pay · Google Pay
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      <header className="ios-header sticky top-0 z-20">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
            ROSCO
          </span>
        </div>
      </header>

      <div className="flex-1 max-w-[430px] mx-auto w-full px-4 pt-5 pb-32 space-y-3">
        <div className="ios-card p-5">
          <p className="text-[12px] font-mono mb-1" style={{ color: "var(--label-tertiary)" }}>
            Invoice #DEMO001
          </p>
          <p className="text-[20px] font-bold" style={{ color: "var(--label-primary)" }}>
            Demo Client
          </p>
        </div>
        <div
          className="rounded-2xl p-4 text-center text-[15px]"
          style={{
            background: "rgba(0,122,255,0.08)",
            color: "var(--ios-blue)",
          }}
        >
          This is a demo — add your Stripe key to enable real payments
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          background: "rgba(242,242,247,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "0.5px solid var(--separator)",
        }}
      >
        <div className="max-w-[430px] mx-auto px-4 pt-3 pb-2">
          <button
            className="ios-btn-brand"
          >
            Pay ₪760.50
          </button>
        </div>
      </div>
    </div>
  );
}
