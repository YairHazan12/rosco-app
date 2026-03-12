"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  total: number;
  paystackAuthorizationUrl?: string | null;
}

export default function PayButton({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);

    // If invoice already has a Paystack authorization URL, use it
    if (
      invoice.paystackAuthorizationUrl &&
      invoice.paystackAuthorizationUrl.startsWith("https://checkout.paystack.com")
    ) {
      window.location.href = invoice.paystackAuthorizationUrl;
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/payment-link`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (data.paymentLink?.startsWith("https://checkout.paystack.com")) {
        window.location.href = data.paymentLink;
      } else {
        toast.info("Demo mode — add PAYSTACK_SECRET_KEY to enable payments");
        setLoading(false);
      }
    } catch {
      toast.error("Payment unavailable. Please contact us.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="ios-btn-brand"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        `Pay R${invoice.total.toFixed(2)}`
      )}
    </button>
  );
}
