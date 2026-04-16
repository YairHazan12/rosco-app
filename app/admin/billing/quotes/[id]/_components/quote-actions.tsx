"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Eye, MoreHorizontal, CheckCircle, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import type { Quote } from "@/lib/billing-types";
import { formatZAR } from "@/lib/billing-types";

interface QuoteActionsProps {
  quote: Quote;
}

export default function QuoteActions({ quote }: QuoteActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [converting, setConverting] = useState(false);
  const [sendingPDF, setSendingPDF] = useState<'whatsapp' | 'email' | null>(null);

  async function updateStatus(status: Quote["status"]) {
    try {
      const res = await fetch(`/api/billing/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "quote", status }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
      toast.success(`Quote marked as ${status}`);
    } catch {
      toast.error("Could not update status");
    }
    setShowMenu(false);
  }

  async function convertToInvoice() {
    setConverting(true);
    try {
      const res = await fetch("/api/billing/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      toast.success("Converted to invoice");
      router.push(`/admin/billing/invoices/${id}`);
    } catch {
      toast.error("Could not convert to invoice");
    } finally {
      setConverting(false);
    }
    setShowMenu(false);
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Hi ${quote.clientName},\n\nPlease find your quote ${quote.documentNumber} for ${quote.title}.\n\nTotal: ${formatZAR(quote.total)}\n\nValid until: ${quote.validUntil}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShowMenu(false);
  }

  function shareEmail() {
    const subject = encodeURIComponent(`Quote ${quote.documentNumber} – ${quote.title}`);
    const body = encodeURIComponent(
      `Hi ${quote.clientName},\n\nPlease find your quote attached.\n\nDocument: ${quote.documentNumber}\nTotal: ${formatZAR(quote.total)}\nValid until: ${quote.validUntil}\n\nThank you.`
    );
    window.location.href = `mailto:${quote.clientEmail ?? ""}?subject=${subject}&body=${body}`;
    setShowMenu(false);
  }

  async function sendPDFViaWhatsApp() {
    setSendingPDF('whatsapp');
    try {
      // Generate PDF and upload to blob storage
      const pdfRes = await fetch('/api/billing/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: 'quote', id: quote.id }),
      });
      if (!pdfRes.ok) throw new Error('Failed to generate PDF');
      const { url } = await pdfRes.json();
      
      // Share via WhatsApp
      const text = encodeURIComponent(
        `Hi ${quote.clientName},\n\nYour quote ${quote.documentNumber} for ${quote.title} is ready.\n\nTotal: ${formatZAR(quote.total)}\nValid until: ${quote.validUntil}\n\nView/Download PDF: ${url}`
      );
      window.open(`https://wa.me/${quote.clientPhone?.replace(/\D/g, "") ?? ""}?text=${text}`, "_blank");
      toast.success('PDF link shared via WhatsApp');
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setSendingPDF(null);
      setShowMenu(false);
    }
  }

  async function sendPDFViaEmail() {
    setSendingPDF('email');
    try {
      const res = await fetch('/api/billing/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: 'quote', id: quote.id }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      const { sentTo } = await res.json();
      toast.success(`Quote sent to ${sentTo}`);
    } catch {
      toast.error('Could not send email');
    } finally {
      setSendingPDF(null);
      setShowMenu(false);
    }
  }

  return (
    <div className="px-5 mb-4">
      <div className="flex gap-2">
        {/* Send / Mark Sent */}
        {(quote.status === "draft" || quote.status === "viewed") && (
          <button
            onClick={() => updateStatus("sent")}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-[12px] px-4 font-semibold transition-all active:scale-[0.97]"
            style={{
              height: "44px",
              fontSize: "14px",
              color: "#FFFFFF",
              background: "#4A80FF",
              boxShadow: "0px 4px 14px rgba(74,128,255,0.28)",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <Send className="w-4 h-4" strokeWidth={1.75} />
            Mark Sent
          </button>
        )}

        {/* Accept */}
        {(quote.status === "sent" || quote.status === "viewed") && (
          <button
            onClick={() => updateStatus("accepted")}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-[12px] px-4 font-semibold transition-all active:scale-[0.97]"
            style={{
              height: "44px",
              fontSize: "14px",
              color: "#FFFFFF",
              background: "#3CC864",
              boxShadow: "0px 4px 14px rgba(60,200,100,0.28)",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <CheckCircle className="w-4 h-4" strokeWidth={1.75} />
            Accept
          </button>
        )}

        {/* Convert to Invoice */}
        {quote.status === "accepted" && (
          <button
            onClick={convertToInvoice}
            disabled={converting}
            className="flex items-center gap-1.5 rounded-[12px] px-4 font-semibold transition-all active:scale-[0.97]"
            style={{
              height: "44px",
              fontSize: "14px",
              color: "#FFFFFF",
              background: "#F07028",
              boxShadow: "0px 4px 16px rgba(240,112,40,0.28)",
              opacity: converting ? 0.6 : 1,
            }}
          >
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            {converting ? "Converting…" : "Convert to Invoice"}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center justify-center rounded-[12px] transition-all active:scale-[0.97]"
            style={{
              width: "44px",
              height: "44px",
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <MoreHorizontal className="w-5 h-5" style={{ color: "#0F1A14" }} strokeWidth={1.75} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-12 z-20 rounded-[16px] overflow-hidden min-w-[200px]"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0px 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                <button
                  onClick={shareWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6] active:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <span style={{ fontSize: "18px" }}>💬</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>Share Text (WhatsApp)</span>
                </button>
                <button
                  onClick={shareEmail}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6] active:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <span style={{ fontSize: "18px" }}>✉️</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>Share Text (Email)</span>
                </button>
                <button
                  onClick={sendPDFViaWhatsApp}
                  disabled={sendingPDF === 'whatsapp'}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6] active:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", opacity: sendingPDF === 'whatsapp' ? 0.6 : 1 }}
                >
                  <span style={{ fontSize: "18px" }}>📄</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>
                    {sendingPDF === 'whatsapp' ? 'Generating PDF...' : 'Send PDF via WhatsApp'}
                  </span>
                </button>
                <button
                  onClick={sendPDFViaEmail}
                  disabled={sendingPDF === 'email'}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6] active:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", opacity: sendingPDF === 'email' ? 0.6 : 1 }}
                >
                  <span style={{ fontSize: "18px" }}>📧</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>
                    {sendingPDF === 'email' ? 'Sending...' : 'Send PDF via Email'}
                  </span>
                </button>
                {quote.status !== "expired" && quote.status !== "accepted" && (
                  <button
                    onClick={() => updateStatus("expired")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6] active:bg-[#F5F8F6]"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <X className="w-4 h-4 ml-0.5" style={{ color: "#F07028" }} strokeWidth={1.75} />
                    <span style={{ fontSize: "14px", color: "#F07028" }}>Mark as Expired</span>
                  </button>
                )}
                <button
                  onClick={() => { window.print(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6] active:bg-[#F5F8F6]"
                >
                  <Eye className="w-4 h-4 ml-0.5" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
                  <span style={{ fontSize: "14px", color: "#7A8F82" }}>Print / Save PDF</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
