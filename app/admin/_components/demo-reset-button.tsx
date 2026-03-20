"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DemoResetButtonProps {
  secret?: string;
}

export default function DemoResetButton({ secret }: DemoResetButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setShowConfirm(false);
    try {
      const response = await fetch("/api/reset-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Reset failed");
      }

      const { stats } = data;
      toast.success(
        `Demo reset! ${stats.jobsCreated} jobs created, ${stats.invoicesCreated} invoices generated.`
      );

      // Reload the page to reflect new data
      setTimeout(() => window.location.reload(), 1200);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset demo data");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium"
        style={{
          background: "var(--amber-light, #FEF3C7)",
          border: "1px solid var(--amber, #F59E0B)",
          color: "#92400E",
        }}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>Clear all jobs &amp; reseed?</span>
        <button
          onClick={handleReset}
          className="ml-1 px-2 py-0.5 rounded-lg text-white font-semibold text-[12px]"
          style={{ background: "#EF4444" }}
        >
          Yes
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-2 py-0.5 rounded-lg font-semibold text-[12px]"
          style={{ background: "white", border: "1px solid #D1D5DB", color: "#374151" }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={loading}
      className="flex items-center gap-1.5 font-semibold text-[13px] px-3 h-[36px] rounded-[10px] transition-opacity active:opacity-75 disabled:opacity-50"
      style={{
        background: "var(--amber-light, #FEF3C7)",
        border: "1px solid var(--amber, #F59E0B)",
        color: "#92400E",
      }}
      title="Reset demo data — clears jobs and seeds fresh upcoming jobs"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} />
      {loading ? "Resetting…" : "Reset Demo"}
    </button>
  );
}
