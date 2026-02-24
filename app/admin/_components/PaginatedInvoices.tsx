"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Invoice = {
  id: string;
  clientName: string;
  jobTitle: string;
  total: number;
  status: string;
};

type PaginatedInvoicesProps = {
  invoices: Invoice[];
};

export default function PaginatedInvoices({ invoices }: PaginatedInvoicesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  const outstandingTotal = invoices.reduce((s, i) => s + i.total, 0);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <div className="ios-group">
        {currentInvoices.map((inv, i) => (
          <Link key={inv.id} href={`/admin/invoices/${inv.id}`} className="block">
            <div
              className="flex items-center px-4 py-3.5 min-h-[56px] transition-colors active:bg-[var(--bg-grouped)]"
              style={{
                borderBottom:
                  i < currentInvoices.length - 1 ? "0.5px solid var(--separator)" : "none",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate" style={{ color: "var(--label-primary)" }}>
                  {inv.clientName}
                </p>
                <p className="text-[13px] truncate mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                  {inv.jobTitle}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-[15px] stat-number" style={{ color: "var(--ios-red)" }}>
                    R{inv.total.toFixed(0)}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--label-quaternary)" }}>
                    {inv.status}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "var(--label-quaternary)" }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-semibold text-[14px] transition-opacity active:opacity-75 disabled:opacity-30"
            style={{
              background: currentPage === 1 ? "var(--separator)" : "rgba(255,107,53,0.10)",
              color: currentPage === 1 ? "var(--label-quaternary)" : "var(--brand)",
            }}
          >
            ← Prev
          </button>

          <p className="text-[13px] font-medium" style={{ color: "var(--label-secondary)" }}>
            Page {currentPage} of {totalPages}
          </p>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg font-semibold text-[14px] transition-opacity active:opacity-75 disabled:opacity-30"
            style={{
              background: currentPage === totalPages ? "var(--separator)" : "rgba(255,107,53,0.10)",
              color: currentPage === totalPages ? "var(--label-quaternary)" : "var(--brand)",
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Total Count and Amount */}
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-[12px]" style={{ color: "var(--label-tertiary)" }}>
          {invoices.length} invoice{invoices.length > 1 ? "s" : ""}
        </p>
        <p className="font-bold text-[15px] stat-number" style={{ color: "var(--ios-red)" }}>
          R{outstandingTotal.toFixed(0)}
        </p>
      </div>
    </>
  );
}
