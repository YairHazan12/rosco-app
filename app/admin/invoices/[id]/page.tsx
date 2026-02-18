import { getInvoice } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import InvoiceActions from "../_components/InvoiceActions";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  Draft:       "bg-gray-100 text-gray-700",
  Sent:        "bg-blue-100 text-blue-700",
  Paid:        "bg-green-100 text-green-700",
  Outstanding: "bg-orange-100 text-orange-700",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return (
    <div className="space-y-4 pb-8">
      <div>
        <Link href="/admin/invoices" className="text-sm text-gray-400">← Invoices</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-gray-400 font-mono">#{invoice.id.slice(-8).toUpperCase()}</p>
            <h1 className="text-xl font-bold text-gray-900">{invoice.clientName}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[invoice.status]}`}>{invoice.status}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2 text-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Job</p>
        <p className="font-medium text-gray-900">{invoice.jobTitle}</p>
        <p className="text-gray-500">{format(new Date(invoice.jobDate), "MMMM d, yyyy")}</p>
        <p className="text-gray-500">{invoice.jobLocation}</p>
        {invoice.clientEmail && <p className="text-gray-500">{invoice.clientEmail}</p>}
        {invoice.clientPhone && <p className="text-gray-500">{invoice.clientPhone}</p>}
        {invoice.handymanName && <p className="text-gray-400 text-xs">Handyman: {invoice.handymanName}</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Services</p>
        <div className="space-y-3">
          {invoice.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                {item.quantity > 1 && <p className="text-xs text-gray-400">{item.quantity} × ₪{item.unitPrice.toFixed(2)}</p>}
              </div>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">₪{item.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₪{invoice.subtotal.toFixed(2)}</span></div>
          {invoice.vatEnabled && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>VAT ({(invoice.vatRate * 100).toFixed(0)}%)</span>
              <span>₪{invoice.vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-100">
            <span>Total</span><span className="text-orange-600">₪{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-1">Customer payment page</p>
        <a href={`/pay/${invoice.id}`} target="_blank" className="text-sm text-blue-600 hover:underline break-all">
          /pay/{invoice.id}
        </a>
      </div>

      <InvoiceActions invoice={invoice} />

      {invoice.paidAt && (
        <p className="text-sm text-green-600 text-center font-medium">
          ✅ Paid {format(new Date(invoice.paidAt), "MMMM d, yyyy")}
        </p>
      )}
    </div>
  );
}
