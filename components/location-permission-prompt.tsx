"use client";

import { useState } from "react";
import { MapPin, X, Globe, Clock, Wallet } from "lucide-react";

interface LocationPermissionPromptProps {
  /** Called when user allows location access */
  onAllow: () => Promise<void>;
  /** Called when user skips/denies location access */
  onSkip: () => void;
  /** Optional: Show inline in a form instead of as a modal/banner */
  inline?: boolean;
  /** Optional: Custom class name */
  className?: string;
}

export default function LocationPermissionPrompt({
  onAllow,
  onSkip,
  inline = false,
  className = "",
}: LocationPermissionPromptProps) {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      await onAllow();
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <div
        className={`rounded-2xl p-5 ${className}`}
        style={{
          background: "linear-gradient(135deg, rgba(0,122,255,0.08) 0%, rgba(88,86,214,0.06) 100%)",
          border: "1px solid rgba(0,122,255,0.15)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,122,255,0.15)" }}
          >
            <MapPin className="w-6 h-6" style={{ color: "#007AFF" }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-[17px] font-semibold mb-1"
              style={{ color: "var(--label-primary)" }}
            >
              Set up your preferences automatically
            </h3>
            <p
              className="text-[14px] leading-relaxed mb-4"
              style={{ color: "var(--label-secondary)" }}
            >
              Allow location access to automatically detect your timezone, language, and currency.
              You can always change these later in settings.
            </p>

            {/* Benefits list */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
                <span className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                  Correct timezone for scheduling
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
                <span className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                  Interface in your preferred language
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
                <span className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                  Prices in your local currency
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="flex-1 h-11 rounded-xl font-semibold text-[15px] text-white transition-opacity active:opacity-80 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #007AFF, #5856D6)",
                  boxShadow: "0 4px 14px rgba(0,122,255,0.30)",
                }}
              >
                {loading ? "Detecting..." : "Allow Location"}
              </button>
              <button
                onClick={onSkip}
                disabled={loading}
                className="h-11 px-5 rounded-xl font-medium text-[15px] transition-opacity active:opacity-80"
                style={{
                  background: "rgba(120,120,128,0.12)",
                  color: "var(--label-primary)",
                }}
              >
                Skip
              </button>
            </div>

            <p
              className="text-[11px] mt-3 leading-relaxed"
              style={{ color: "var(--label-tertiary)" }}
            >
              Your location is used only to set regional preferences and is never stored or shared.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Banner/modal style
  return (
    <div
      className={`fixed z-50 ${className}`}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(calc(100vw - 32px), 420px)",
        pointerEvents: "none",
        animation: "fade-up 0.35s ease forwards",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          background: "var(--bg-card)",
          borderRadius: "20px",
          padding: "16px 18px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10)",
          border: "0.5px solid var(--separator)",
        }}
      >
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,122,255,0.12)" }}
          >
            <MapPin className="w-6 h-6" style={{ color: "#007AFF" }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[16px] font-semibold leading-tight"
              style={{ color: "var(--label-primary)" }}
            >
              Personalize your experience
            </p>
            <p
              className="text-[13px] mt-1 leading-snug"
              style={{ color: "var(--label-secondary)" }}
            >
              Allow location to set your timezone, language, and currency automatically
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={onSkip}
            disabled={loading}
            aria-label="Dismiss"
            className="flex-shrink-0 p-1 rounded-lg transition-opacity active:opacity-70"
            style={{ color: "var(--label-tertiary)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex-1 h-10 rounded-xl font-semibold text-[15px] text-white transition-opacity active:opacity-80 disabled:opacity-60"
            style={{
              background: "#007AFF",
              boxShadow: "0 4px 12px rgba(0,122,255,0.35)",
            }}
          >
            {loading ? "Detecting..." : "Allow"}
          </button>
          <button
            onClick={onSkip}
            disabled={loading}
            className="h-10 px-4 rounded-xl font-medium text-[15px] transition-opacity active:opacity-80"
            style={{
              background: "rgba(120,120,128,0.12)",
              color: "var(--label-primary)",
            }}
          >
            Not now
          </button>
        </div>

        <p
          className="text-[11px] mt-3 text-center"
          style={{ color: "var(--label-tertiary)" }}
        >
          Your location is never stored or shared
        </p>
      </div>
    </div>
  );
}
