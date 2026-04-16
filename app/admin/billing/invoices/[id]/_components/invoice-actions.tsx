"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Link2, MoreHorizontal, Copy, X } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import type { BillingInvoice } from "@/lib/billing-types";
import { formatZAR } from "@/lib/billing-types";

interface InvoiceActionsProps {
  invoice: BillingInvoice;
}

export default function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(invoice.paymentLinkUrl ?? null);
  const [showQR, setShowQR] = useState(false);
  const [sendingPDF, setSendingPDF] = useState<'whatsapp' | 'email' | null>(null);

  async function updateStatus(status: BillingInvoice["status"]) {
    try {
      const res = await fetch(`/api/billing/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: "invoice", status }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
      toast.success(`Invoice marked as ${status}`);
    } catch {
      toast.error("Could not update status");
    }
    setShowMenu(false);
  }

  async function generatePaymentLink() {
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/billing/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.amountOutstanding,
          description: `${invoice.documentNumber} – ${invoice.title}`,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setPaymentLink(url);
      setShowQR(true);
      startTransition(() => router.refresh());
      toast.success("Payment link generated");
    } catch {
      toast.error("Could not generate payment link");
    } finally {
      setGeneratingLink(false);
    }
  }

  function copyLink() {
    if (!paymentLink) return;
    navigator.clipboard.writeText(paymentLink).then(() => toast.success("Link copied"));
    setShowMenu(false);
  }

  function shareWhatsApp() {
    const link = paymentLink ?? "";
    const text = encodeURIComponent(
      `Hi ${invoice.clientName},\n\nYour invoice ${invoice.documentNumber} for ${formatZAR(invoice.amountOutstanding)} is ready.\n\nPay securely here: ${link}`
    );
    window.open(`https://wa.me/${invoice.clientPhone?.replace(/\D/g, "") ?? ""}?text=${text}`, "_blank");
    setShowMenu(false);
  }

  function shareEmail() {
    const subject = encodeURIComponent(`Invoice ${invoice.documentNumber} – Payment`);
    const body = encodeURIComponent(
      `Hi ${invoice.clientName},\n\nPlease find your invoice attached.\n\nDocument: ${invoice.documentNumber}\nAmount due: ${formatZAR(invoice.amountOutstanding)}\nDue date: ${invoice.dueDate}\n\n${paymentLink ? `Pay online: ${paymentLink}\n\n` : ""}Thank you.`
    );
    window.location.href = `mailto:${invoice.clientEmail ?? ""}?subject=${subject}&body=${body}`;
    setShowMenu(false);
  }

  async function sendPDFViaWhatsApp() {
    setSendingPDF('whatsapp');
    try {
      // Generate PDF and upload to blob storage
      const pdfRes = await fetch('/api/billing/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: 'invoice', id: invoice.id }),
      });
      if (!pdfRes.ok) throw new Error('Failed to generate PDF');
      const { url } = await pdfRes.json();
      
      // Share via WhatsApp
      const text = encodeURIComponent(
        `Hi ${invoice.clientName},\n\nYour invoice ${invoice.documentNumber} for ${formatZAR(invoice.amountOutstanding)} is ready.\n\nView/Download PDF: ${url}${paymentLink ? `\n\nPay securely here: ${paymentLink}` : ''}`
      );
      window.open(`https://wa.me/${invoice.clientPhone?.replace(/\D/g, "") ?? ""}?text=${text}`, "_blank");
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
        body: JSON.stringify({ docType: 'invoice', id: invoice.id }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      const { sentTo } = await res.json();
      toast.success(`Invoice sent to ${sentTo}`);
    } catch {
      toast.error('Could not send email');
    } finally {
      setSendingPDF(null);
      setShowMenu(false);
    }
  }

  return (
    <div className="px-5 mb-4 space-y-3">
      {/* Primary actions row */}
      <div className="flex gap-2">
        {/* Send */}
        {(invoice.status === "draft" || invoice.status === "viewed") && (
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

        {/* Mark Paid */}
        {invoice.status !== "paid" && (
          <button
            onClick={() => updateStatus("paid")}
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
            Mark Paid
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
                {paymentLink && (
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <Copy className="w-4 h-4 ml-0.5" style={{ color: "#1C2B22" }} strokeWidth={1.75} />
                    <span style={{ fontSize: "14px", color: "#1C2B22" }}>Copy Payment Link</span>
                  </button>
                )}
                <button
                  onClick={shareWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <span style={{ fontSize: "18px" }}>💬</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>Share Payment Link (WhatsApp)</span>
                </button>
                <button
                  onClick={shareEmail}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <span style={{ fontSize: "18px" }}>✉️</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>Share Payment Link (Email)</span>
                </button>
                <button
                  onClick={sendPDFViaWhatsApp}
                  disabled={sendingPDF === 'whatsapp'}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
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
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", opacity: sendingPDF === 'email' ? 0.6 : 1 }}
                >
                  <span style={{ fontSize: "18px" }}>📧</span>
                  <span style={{ fontSize: "14px", color: "#1C2B22" }}>
                    {sendingPDF === 'email' ? 'Sending...' : 'Send PDF via Email'}
                  </span>
                </button>
                {invoice.status !== "overdue" && invoice.status !== "paid" && (
                  <button
                    onClick={() => updateStatus("overdue")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <X className="w-4 h-4 ml-0.5" style={{ color: "#F07028" }} strokeWidth={1.75} />
                    <span style={{ fontSize: "14px", color: "#F07028" }}>Mark as Overdue</span>
                  </button>
                )}
                <button
                  onClick={() => { window.print(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F5F8F6]"
                >
                  <span style={{ fontSize: "18px" }}>🖨️</span>
                  <span style={{ fontSize: "14px", color: "#7A8F82" }}>Print / Save PDF</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Link Section */}
      {invoice.status !== "paid" && (
        <div>
          {!paymentLink ? (
            <button
              onClick={generatePaymentLink}
              disabled={generatingLink}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] font-semibold transition-all active:scale-[0.97]"
              style={{
                height: "52px",
                fontSize: "15px",
                color: "#FFFFFF",
                background: "#F07028",
                boxShadow: "0px 4px 16px rgba(240,112,40,0.28)",
                opacity: generatingLink ? 0.7 : 1,
              }}
            >
              <Link2 className="w-4 h-4" strokeWidth={1.75} />
              {generatingLink ? "Generating…" : "Generate Payment Link"}
            </button>
          ) : (
            <div
              className="rounded-[16px] overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* Link preview */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Link2 className="w-4 h-4 flex-shrink-0" style={{ color: "#3CC864" }} strokeWidth={1.75} />
                <p className="flex-1 truncate" style={{ fontSize: "13px", color: "#7A8F82" }}>{paymentLink}</p>
                <button
                  onClick={copyLink}
                  className="flex-shrink-0 rounded-[8px] px-3 py-1.5 transition-opacity active:opacity-60"
                  style={{ fontSize: "12px", fontWeight: 600, color: "#3CC864", background: "rgba(60,200,100,0.10)" }}
                >
                  Copy
                </button>
              </div>

              {/* QR toggle */}
              <button
                onClick={() => setShowQR((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 transition-opacity active:opacity-60"
              >
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#1C2B22" }}>
                  {showQR ? "Hide QR Code" : "Show QR Code"}
                </span>
                <span style={{ fontSize: "12px", color: "#7A8F82" }}>{showQR ? "▲" : "▼"}</span>
              </button>

              {/* QR Code */}
              {showQR && (
                <div className="flex flex-col items-center px-4 pb-5 gap-4">
                  <div className="p-4 bg-white rounded-[12px]" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                    <QRCode value={paymentLink} size={180} />
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={shareWhatsApp}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-[12px] font-semibold transition-all active:scale-[0.97]"
                      style={{ height: "44px", fontSize: "13px", color: "#FFFFFF", background: "#25D366", boxShadow: "0px 4px 12px rgba(37,211,102,0.28)" }}
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={shareEmail}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-[12px] font-semibold transition-all active:scale-[0.97]"
                      style={{ height: "44px", fontSize: "13px", color: "#FFFFFF", background: "#4A80FF", boxShadow: "0px 4px 12px rgba(74,128,255,0.28)" }}
                    >
                      ✉️ Email
                    </button>
                    <button
                      onClick={copyLink}
                      className="flex items-center justify-center rounded-[12px] transition-all active:scale-[0.97]"
                      style={{ width: "44px", height: "44px", background: "#F5F8F6", border: "1px solid rgba(0,0,0,0.08)" }}
                    >
                      <Copy className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
