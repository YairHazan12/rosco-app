import Link from "next/link";
import { Wrench, Shield, CreditCard, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #1A1A1C 0%, #2C2C2E 45%, #1A1A1C 100%)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Brand hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="relative mb-6">
          <div
            className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #FF7A47, #FF5500)",
              boxShadow:
                "0 12px 40px rgba(255,107,53,0.45), 0 4px 12px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Wrench className="w-11 h-11 text-white" strokeWidth={2} />
          </div>
          {/* Shine overlay */}
          <div
            className="absolute inset-0 rounded-[22px] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
            }}
          />
        </div>

        <h1
          className="text-[44px] font-bold text-white tracking-[-1.5px] leading-none mb-2"
        >
          ROSCO
        </h1>
        <p
          className="text-[16px] font-medium tracking-wide"
          style={{ color: "rgba(235,235,245,0.45)" }}
        >
          Handyman Management
        </p>
      </div>

      {/* Navigation cards */}
      <div className="px-4 pb-10 space-y-3 max-w-[430px] mx-auto w-full">
        {/* Handyman */}
        <Link href="/handyman" className="block touch-scale">
          <div
            className="rounded-[20px] p-5 flex items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,107,53,0.20)",
                border: "0.5px solid rgba(255,107,53,0.25)",
              }}
            >
              <Wrench className="w-6 h-6" style={{ color: "#FF6B35" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[17px] tracking-tight">
                Handyman App
              </p>
              <p
                className="text-[14px] mt-[2px]"
                style={{ color: "rgba(235,235,245,0.45)" }}
              >
                Schedule, navigation, status
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
            </div>
          </div>
        </Link>

        {/* Admin */}
        <Link href="/admin" className="block touch-scale">
          <div
            className="rounded-[20px] p-5 flex items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(0,122,255,0.20)",
                border: "0.5px solid rgba(0,122,255,0.25)",
              }}
            >
              <Shield className="w-6 h-6" style={{ color: "#007AFF" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[17px] tracking-tight">
                Admin Panel
              </p>
              <p
                className="text-[14px] mt-[2px]"
                style={{ color: "rgba(235,235,245,0.45)" }}
              >
                Jobs, invoices, dashboard
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
            </div>
          </div>
        </Link>

        {/* Customer Payment */}
        <Link href="/pay/demo" className="block touch-scale">
          <div
            className="rounded-[20px] p-5 flex items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(52,199,89,0.20)",
                border: "0.5px solid rgba(52,199,89,0.25)",
              }}
            >
              <CreditCard className="w-6 h-6" style={{ color: "#34C759" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[17px] tracking-tight">
                Customer Payment
              </p>
              <p
                className="text-[14px] mt-[2px]"
                style={{ color: "rgba(235,235,245,0.45)" }}
              >
                View invoice & pay
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
            </div>
          </div>
        </Link>

        {/* Learn more */}
        <Link
          href="/marketing"
          className="block text-center text-[13px] font-medium py-1 transition-colors duration-200 hover:opacity-80"
          style={{ color: "rgba(255,107,53,0.65)" }}
        >
          Learn more about ROSCO →
        </Link>

        {/* Version tag */}
        <p
          className="text-center text-[11px] pt-2 tracking-widest uppercase"
          style={{ color: "rgba(235,235,245,0.18)" }}
        >
          MVP v1.0
        </p>
      </div>
    </main>
  );
}
