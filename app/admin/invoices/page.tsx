import { getInvoices } from "@/lib/db";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { pill: string }> = {
  Draft:       { pill: "bg-gray-100 text-gray-600" },
  Sent:        { pill: "bg-blue-100 text-blue-700" },
  Paid:        { pill: "bg-green-100 text-green-700" },
  Outstanding: { pill: "bg-orange-100 text-orange-700" },
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const totals = {
    outstanding: invoices.filter(i => ["Outstanding","Sent"].includes(i.status)).reduce((s,i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === "Paid").reduce((s,i) => s + i.total, 0),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
          <p className="text-xs text-orange-600 font-medium">Outstanding</p>
          <p className="text-xl font-bold text-orange-700 mt-0.5">₪{totals.outstanding.toFixed(0)}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium">Collected</p>
          <p className="text-xl font-bold text-green-700 mt-0.5">₪{totals.paid.toFixed(0)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {invoices.map((inv) => {
          const style = statusStyles[inv.status] || statusStyles.Draft;
          return (
            <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md active:scale-[0.99] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.pill}`}>{inv.status}</span>
                      <span className="text-xs text-gray-400 font-mono">#{inv.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{inv.clientName}</p>
                    <p className="text-sm text-gray-400 truncate">{inv.jobTitle}</p>
                    <p className="text-xs text-gray-300 mt-1">{format(new Date(inv.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-base">₪{inv.total.toFixed(0)}</p>
                      {inv.vatEnabled && <p className="text-xs text-gray-400">incl. VAT</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {invoices.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No invoices yet</p><p className="text-sm mt-1">Complete a job to create one</p>
          </div>
        )}
      </div>
    </div>
  );
}
