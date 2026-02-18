import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Wrench, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import PayButton from "./_components/PayButton";

export const dynamic = "force-dynamic";

export default async function CustomerPayPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  if (invoiceId === "demo") return <DemoPage />;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { job: true, items: true },
  });
  if (!invoice) notFound();

  const isPaid = invoice.status === "Paid";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top brand bar */}
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-orange-400" />
        <span className="font-bold text-lg">ROSCO</span>
      </div>

      <div className="flex-1 px-4 pt-6 pb-32 max-w-lg mx-auto w-full space-y-4">
        {/* Paid banner */}
        {isPaid && (
          <div className="bg-green-500 text-white rounded-2xl p-5 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
            <p className="text-xl font-bold">Payment Received!</p>
            <p className="text-green-100 text-sm mt-1">Thank you for your business</p>
            {invoice.paidAt && (
              <p className="text-green-200 text-xs mt-1">
                Paid {format(new Date(invoice.paidAt), "MMMM d, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Invoice header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-1">
                Invoice #{invoice.id.slice(-8).toUpperCase()}
              </p>
              <p className="text-lg font-bold text-gray-900">{invoice.job.clientName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
            }`}>
              {invoice.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-300 flex-shrink-0" />
              {format(new Date(invoice.job.date), "MMMM d, yyyy")}
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
              {invoice.job.location}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Services</p>
          <div className="space-y-3">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.quantity} × ₪{item.unitPrice.toFixed(2)}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                  ₪{item.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span><span>₪{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.vatEnabled && (
              <div className="flex justify-between text-sm text-gray-400">
                <span>VAT ({(invoice.vatRate * 100).toFixed(0)}%)</span>
                <span>₪{invoice.vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-orange-500">₪{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom payment button */}
      {!isPaid && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
          <div className="max-w-lg mx-auto space-y-2">
            <PayButton invoice={invoice} />
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span>💳 Card</span>
              <span> Apple Pay</span>
              <span>G Google Pay</span>
            </div>
            <p className="text-center text-xs text-gray-300">🔒 Secured by Stripe</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-orange-400" />
        <span className="font-bold text-lg">ROSCO</span>
      </div>

      <div className="flex-1 px-4 pt-6 pb-32 max-w-lg mx-auto w-full space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-mono mb-1">Invoice #DEMO001</p>
          <p className="text-lg font-bold text-gray-900">Demo Client</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-300" />
              February 18, 2026
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-300" />
              Rothschild Blvd 45, Tel Aviv
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Services</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Kitchen Sink Repair</span>
              <span className="font-semibold">₪350.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">General Handyman</p>
                <p className="text-xs text-gray-400">2 × ₪150.00</p>
              </div>
              <span className="font-semibold">₪300.00</span>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span><span>₪650.00</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>VAT (17%)</span><span>₪110.50</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-orange-500">₪760.50</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center text-sm text-blue-600">
          This is a demo — add your Stripe key to enable real payments
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-2xl active:bg-orange-600 transition-colors">
            Pay ₪760.50
          </button>
          <p className="text-center text-xs text-gray-300 mt-2">🔒 Secured by Stripe</p>
        </div>
      </div>
    </div>
  );
}
