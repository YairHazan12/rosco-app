"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ExternalLink, Send, CheckCircle, Copy } from "lucide-react";

interface Invoice {
  id: string;
  status: string;
  stripePaymentLink: string | null;
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
    toast.success("Payment link copied!");
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Actions</h3>

        <div className="flex flex-wrap gap-2">
          {invoice.status === "Draft" && (
            <Button
              onClick={() => updateStatus("Sent")}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <Send className="w-4 h-4" /> Mark as Sent
            </Button>
          )}

          {invoice.status === "Sent" && (
            <Button
              onClick={() => updateStatus("Outstanding")}
              disabled={loading}
              variant="outline"
              className="gap-2 border-orange-300 text-orange-600"
            >
              Mark as Outstanding
            </Button>
          )}

          {(invoice.status === "Sent" || invoice.status === "Outstanding") && (
            <Button
              onClick={() => updateStatus("Paid")}
              disabled={loading}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Paid
            </Button>
          )}

          <Button
            onClick={generatePaymentLink}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {payLink ? "Regenerate Payment Link" : "Generate Payment Link"}
          </Button>

          <Button
            onClick={copyLink}
            variant="outline"
            className="gap-2"
          >
            <Copy className="w-4 h-4" /> Copy Customer Link
          </Button>
        </div>

        {payLink && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Stripe Payment Link:</p>
            <a
              href={payLink}
              target="_blank"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {payLink}
            </a>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Customer payment page:{" "}
          <a
            href={`/pay/${invoice.id}`}
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            /pay/{invoice.id}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
