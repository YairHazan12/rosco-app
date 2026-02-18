import { getInvoice, updateInvoice } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { invoiceId } = await params;
  const { session_id } = await searchParams;

  const invoice = await getInvoice(invoiceId);
  if (!invoice) notFound();

  if (invoice.status !== "Paid") {
    await updateInvoice(invoiceId, {
      status: "Paid",
      paidAt: new Date().toISOString(),
      ...(session_id && { stripeSessionId: session_id }),
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm text-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
      >
        {/* Animated checkmark */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center animate-circle-scale"
            style={{ background: "var(--ios-green)" }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M10 20.5L16.5 27L30 14"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 0,
                  animation: "checkmark-draw 0.5s ease 0.3s both",
                }}
              />
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-semibold text-[17px]"
            style={{ color: "var(--label-primary)" }}
          >
            ROSCO
          </span>
        </div>

        {/* Card */}
        <div className="ios-card p-6 animate-fade-up">
          <h1
            className="text-[26px] font-bold mb-1.5"
            style={{ color: "var(--label-primary)", letterSpacing: "-0.5px" }}
          >
            Payment Successful!
          </h1>
          <p className="text-[16px]" style={{ color: "var(--label-secondary)" }}>
            Thank you, <strong>{invoice.clientName}</strong>
          </p>
          <p className="text-[14px] mt-1.5" style={{ color: "var(--label-tertiary)" }}>
            Your payment has been received.
          </p>

          {/* Invoice details */}
          <div
            className="rounded-xl p-4 mt-5"
            style={{ background: "var(--bg-primary)" }}
          >
            <p className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
              Invoice
            </p>
            <p
              className="font-mono text-[13px] font-medium mt-0.5"
              style={{ color: "var(--label-secondary)" }}
            >
              #{invoice.id.slice(-8).toUpperCase()}
            </p>
            <p
              className="text-[28px] font-bold mt-2 tracking-tight"
              style={{ color: "var(--ios-green)", letterSpacing: "-0.5px" }}
            >
              ₪{invoice.total.toFixed(2)}
            </p>
          </div>

          <Link
            href={`/pay/${invoiceId}`}
            className="inline-block mt-5 text-[15px] font-medium"
            style={{ color: "var(--ios-blue)" }}
          >
            View Invoice →
          </Link>
        </div>
      </div>
    </div>
  );
}
