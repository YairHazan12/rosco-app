/**
 * Displays the issuing company's details on a quote or invoice.
 * SARS requires: company name, address, VAT registration number.
 */
import type { Quote, BillingInvoice } from "@/lib/billing-types";

type Doc = Quote | BillingInvoice;

interface DocumentCompanyBlockProps {
  doc: Doc;
}

export default function DocumentCompanyBlock({ doc }: DocumentCompanyBlockProps) {
  const hasAnyCompanyInfo =
    doc.companyName ||
    doc.companyVatNumber ||
    doc.companyRegistrationNumber ||
    doc.companyAddress ||
    doc.companyPhone ||
    doc.companyEmail;

  const hasBankingDetails =
    doc.type === "invoice" &&
    (doc.bankName || doc.bankAccountNumber);

  if (!hasAnyCompanyInfo && !hasBankingDetails) return null;

  return (
    <div className="mx-5 mb-3">
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Company Info */}
        {hasAnyCompanyInfo && (
          <div
            className="px-4 py-3.5"
            style={{ borderBottom: hasBankingDetails ? "1px solid rgba(0,0,0,0.06)" : undefined }}
          >
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Issued By
            </p>
            {doc.companyName && (
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#0F1A14", marginBottom: "2px" }}>{doc.companyName}</p>
            )}
            {doc.companyAddress && (
              <p style={{ fontSize: "13px", color: "#7A8F82" }}>{doc.companyAddress}</p>
            )}
            {doc.companyPhone && (
              <p style={{ fontSize: "13px", color: "#7A8F82" }}>{doc.companyPhone}</p>
            )}
            {doc.companyEmail && (
              <p style={{ fontSize: "13px", color: "#7A8F82" }}>{doc.companyEmail}</p>
            )}
            {doc.companyVatNumber && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center rounded-[6px] px-2 py-0.5"
                  style={{ fontSize: "11px", fontWeight: 600, background: "rgba(60,200,100,0.10)", color: "#2BA84A" }}
                >
                  VAT Reg
                </span>
                <span
                  style={{ fontSize: "13px", color: "#1C2B22", fontFamily: "'JetBrains Mono','Fira Code',monospace", fontWeight: 600 }}
                >
                  {doc.companyVatNumber}
                </span>
              </div>
            )}
            {doc.companyRegistrationNumber && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center rounded-[6px] px-2 py-0.5"
                  style={{ fontSize: "11px", fontWeight: 600, background: "rgba(122,143,130,0.10)", color: "#7A8F82" }}
                >
                  Reg No
                </span>
                <span style={{ fontSize: "13px", color: "#7A8F82" }}>{doc.companyRegistrationNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Banking Details (invoices only) */}
        {hasBankingDetails && doc.type === "invoice" && (
          <div className="px-4 py-3.5" style={{ background: "#F5F8F6" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              EFT Banking Details
            </p>
            <div className="space-y-1.5">
              {doc.bankName && (
                <div className="flex justify-between">
                  <span style={{ fontSize: "13px", color: "#7A8F82" }}>Bank</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1C2B22" }}>{doc.bankName}</span>
                </div>
              )}
              {doc.bankAccountHolder && (
                <div className="flex justify-between">
                  <span style={{ fontSize: "13px", color: "#7A8F82" }}>Account Holder</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1C2B22" }}>{doc.bankAccountHolder}</span>
                </div>
              )}
              {doc.bankAccountNumber && (
                <div className="flex justify-between">
                  <span style={{ fontSize: "13px", color: "#7A8F82" }}>Account Number</span>
                  <span
                    style={{ fontSize: "13px", fontWeight: 700, color: "#0F1A14", fontFamily: "'JetBrains Mono','Fira Code',monospace", letterSpacing: "0.04em" }}
                  >
                    {doc.bankAccountNumber}
                  </span>
                </div>
              )}
              {doc.branchCode && (
                <div className="flex justify-between">
                  <span style={{ fontSize: "13px", color: "#7A8F82" }}>Branch Code</span>
                  <span
                    style={{ fontSize: "13px", fontWeight: 600, color: "#1C2B22", fontFamily: "'JetBrains Mono','Fira Code',monospace" }}
                  >
                    {doc.branchCode}
                  </span>
                </div>
              )}
              {doc.bankAccountType && (
                <div className="flex justify-between">
                  <span style={{ fontSize: "13px", color: "#7A8F82" }}>Account Type</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1C2B22" }}>{doc.bankAccountType}</span>
                </div>
              )}
              <p style={{ fontSize: "11px", color: "#7A8F82", marginTop: "6px" }}>
                Use {doc.documentNumber} as your payment reference.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
