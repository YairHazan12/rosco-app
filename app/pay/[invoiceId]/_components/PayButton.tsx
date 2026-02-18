"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  total: number;
  stripePaymentLink?: string | null;
}

export default function PayButton({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);

    if (
      invoice.stripePaymentLink &&
      invoice.stripePaymentLink.startsWith("https://checkout.stripe.com")
    ) {
      window.location.href = invoice.stripePaymentLink;
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/payment-link`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (data.paymentLink?.startsWith("https://checkout.stripe.com")) {
        window.location.href = data.paymentLink;
      } else {
        toast.info("Demo mode — add STRIPE_SECRET_KEY to enable payments");
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
      className="w-full bg-orange-500 active:bg-orange-600 disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        `Pay ₪${invoice.total.toFixed(2)}`
      )}
    </button>
  );
}
