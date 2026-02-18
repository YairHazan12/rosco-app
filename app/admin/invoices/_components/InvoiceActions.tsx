"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Send, CheckCircle, Copy, Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  status: string;
  stripePaymentLink?: string | null;
  total: number;
}

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payLink, setPayLink] = useState(invoice.stripePaymentLink);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Status updated to ${status}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentLink = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/payment-link`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPayLink(data.paymentLink);
      toast.success("Payment link generated!");
      router.refresh();
    } catch {
      toast.error("Failed to generate payment link (check Stripe config)");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/pay/${invoice.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Copied to clipboard!");
  };

  return (
    <div>
      <p className="ios-section-header mb-2">Actions</p>
      <div className="space-y-2">
        {/* Primary actions */}
        {(invoice.status === "Sent" || invoice.status === "Outstanding") && (
          <button
            onClick={() => updateStatus("Paid")}
            disabled={loading}
            className="ios-btn-success"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-[20px] h-[20px]" />
                Mark as Paid
              </>
            )}
          </button>
        )}

        {/* Secondary actions */}
        <div className="ios-group">
          {invoice.status === "Draft" && (
            <button
              onClick={() => updateStatus("Sent")}
              disabled={loading}
              className="ios-group-row w-full"
              style={{ color: "var(--ios-blue)" }}
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                style={{ background: "rgba(0,122,255,0.1)" }}
              >
                <Send className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
              </div>
              <span className="font-medium text-[16px]">Mark as Sent</span>
            </button>
          )}

          {invoice.status === "Sent" && (
            <button
              onClick={() => updateStatus("Outstanding")}
              disabled={loading}
              className="ios-group-row w-full"
              style={{ color: "var(--ios-orange)" }}
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
                style={{ background: "rgba(255,149,0,0.1)" }}
              >
                <ExternalLink className="w-[18px] h-[18px]" style={{ color: "var(--ios-orange)" }} />
              </div>
              <span className="font-medium text-[16px]">Mark as Outstanding</span>
            </button>
          )}

          <button
            onClick={generatePaymentLink}
            disabled={loading}
            className="ios-group-row w-full"
            style={{ color: "var(--ios-blue)" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
              style={{ background: "rgba(0,122,255,0.1)" }}
            >
              <ExternalLink className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
            </div>
            <span className="font-medium text-[16px]">
              {payLink ? "Regenerate Payment Link" : "Generate Payment Link"}
            </span>
          </button>

          <button
            onClick={copyLink}
            className="ios-group-row w-full"
            style={{ color: "var(--ios-blue)" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 mr-3"
              style={{ background: "rgba(0,122,255,0.1)" }}
            >
              <Copy className="w-[18px] h-[18px]" style={{ color: "var(--ios-blue)" }} />
            </div>
            <span className="font-medium text-[16px]">Copy Customer Link</span>
          </button>
        </div>

        {payLink && (
          <div
            className="ios-card p-4"
            style={{ background: "rgba(0,122,255,0.05)" }}
          >
            <p className="text-[12px] mb-1" style={{ color: "var(--label-tertiary)" }}>
              Stripe Payment Link:
            </p>
            <a
              href={payLink}
              target="_blank"
              className="text-[13px] break-all"
              style={{ color: "var(--ios-blue)" }}
            >
              {payLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
