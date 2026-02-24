"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (or send to error tracking service)
    console.error("Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-6 py-12">
      <div className="max-w-md w-full">
        <div className="ios-card p-8 text-center">
          {/* Error Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239, 68, 68, 0.1)" }}
          >
            <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2} />
          </div>

          {/* Title */}
          <h2
            className="text-[24px] font-bold mb-2"
            style={{ color: "#0F172A" }}
          >
            Something went wrong
          </h2>

          {/* Error Message */}
          <p
            className="text-[15px] leading-relaxed mb-6"
            style={{ color: "#64748B" }}
          >
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          {/* Error Code (if available) */}
          {error.digest && (
            <p
              className="text-[12px] font-mono mb-6 px-3 py-2 rounded-lg"
              style={{ background: "#F1F5F9", color: "#64748B" }}
            >
              Error code: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-semibold text-[15px] text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #14B8A6 0%, #0F9C8C 100%)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>

            <Link href="/">
              <button
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-semibold text-[15px] border-2 transition-all hover:bg-white/50"
                style={{
                  borderColor: "#14B8A6",
                  color: "#0F9C8C",
                  background: "rgba(255, 255, 255, 0.6)",
                }}
              >
                <Home className="w-4 h-4" />
                Go home
              </button>
            </Link>
          </div>

          {/* Support hint */}
          <p
            className="text-[12px] mt-6"
            style={{ color: "#94A3B8" }}
          >
            If this problem persists, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}
