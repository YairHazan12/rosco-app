import { getInvoices, filterOutstandingInvoices } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import Link from "next/link";
import PaginatedInvoices from "./PaginatedInvoices";

export default async function OutstandingInvoices() {
  const companyId = await getCompanyIdFromCookie();
  const allInvoices = await getInvoices(companyId);
  const outstanding = filterOutstandingInvoices(allInvoices);

  if (outstanding.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          Awaiting Payment
        </p>
        <Link
          href="/admin/invoices"
          className="text-[15px] font-semibold"
          style={{ color: "var(--brand)" }}
        >
          All →
        </Link>
      </div>
      <PaginatedInvoices invoices={outstanding} />
    </section>
  );
}
