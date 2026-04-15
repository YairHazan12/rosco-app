import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getNextDocumentNumber } from "@/lib/billing-db";
import { getCustomers, getServicePresets } from "@/lib/db";
import { db as adminDb } from "@/lib/firebase-admin";
import type { Company } from "@/lib/auth-types";
import NewDocumentForm from "../../_components/new-document-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const companyId = await getCompanyIdFromCookie();
  const [documentNumber, customers, presets, companyDoc] = await Promise.all([
    getNextDocumentNumber(companyId, "quote"),
    getCustomers(companyId),
    getServicePresets(companyId),
    adminDb.collection("companies").doc(companyId).get(),
  ]);

  const company = companyDoc.exists
    ? ({ id: companyDoc.id, ...companyDoc.data() } as Company)
    : null;

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <Link href="/admin/billing" className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity active:opacity-60" style={{ background: "rgba(0,0,0,0.05)" }}>
          <ChevronLeft className="w-5 h-5" style={{ color: "#0F1A14" }} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="ios-large-title" style={{ fontSize: "22px" }}>New Quote</h1>
          <p style={{ fontSize: "13px", color: "#7A8F82", marginTop: "1px" }}>{documentNumber}</p>
        </div>
      </div>

      <NewDocumentForm
        docType="quote"
        documentNumber={documentNumber}
        customers={customers}
        presets={presets}
        company={company}
      />
    </div>
  );
}
