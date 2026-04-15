import Link from "next/link";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  type: "quotes" | "invoices";
}

export default function EmptyState({ type }: EmptyStateProps) {
  const label = type === "quotes" ? "quote" : "invoice";
  const href = `/admin/billing/${type}/new`;

  return (
    <div
      className="mx-5 rounded-[16px] flex flex-col items-center justify-center text-center"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
        minHeight: "220px",
        padding: "40px 24px",
      }}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{ width: "64px", height: "64px" }}
      >
        <FileText className="w-16 h-16" style={{ color: "#D0D9D4" }} strokeWidth={1.25} />
      </div>
      <p style={{ fontSize: "17px", fontWeight: 600, color: "#0F1A14", marginBottom: "8px" }}>
        No {type} yet
      </p>
      <p style={{ fontSize: "14px", color: "#7A8F82", marginBottom: "20px", maxWidth: "240px" }}>
        Create your first {label} to get started
      </p>
      <Link href={href}>
        <button
          className="flex items-center gap-2 px-6 rounded-[14px] font-semibold transition-all active:scale-[0.97] active:opacity-90"
          style={{
            height: "44px",
            fontSize: "14px",
            color: "#FFFFFF",
            background: "#F07028",
            boxShadow: "0px 4px 16px rgba(240,112,40,0.28)",
          }}
        >
          + New {label.charAt(0).toUpperCase() + label.slice(1)}
        </button>
      </Link>
    </div>
  );
}
