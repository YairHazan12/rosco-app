import Link from "next/link";
import { Wrench, Shield, CreditCard, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #1C1C1E 0%, #2C2C2E 50%, #1C1C1E 100%)",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Brand hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
          style={{
            background: "var(--brand)",
            boxShadow: "0 8px 30px rgba(255,107,53,0.4)",
          }}
        >
          <Wrench className="w-10 h-10 text-white" />
        </div>
        <h1
          className="text-[42px] font-bold text-white mb-1.5"
          style={{ letterSpacing: "-1px" }}
        >
          ROSCO
        </h1>
        <p
          className="text-[16px]"
          style={{ color: "rgba(235,235,245,0.5)" }}
        >
          Handyman Management
        </p>
      </div>

      {/* Navigation cards */}
      <div className="px-4 pb-12 space-y-3 max-w-[430px] mx-auto w-full">
        <Link href="/handyman" className="block touch-scale">
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,107,53,0.2)" }}
            >
              <Wrench className="w-6 h-6" style={{ color: "var(--brand)" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[17px]">Handyman App</p>
              <p
                className="text-[14px] mt-0.5"
                style={{ color: "rgba(235,235,245,0.5)" }}
              >
                Schedule, navigation, status
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </Link>

        <Link href="/admin" className="block touch-scale">
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,122,255,0.2)" }}
            >
              <Shield className="w-6 h-6" style={{ color: "var(--ios-blue)" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[17px]">Admin Panel</p>
              <p
                className="text-[14px] mt-0.5"
                style={{ color: "rgba(235,235,245,0.5)" }}
              >
                Jobs, invoices, dashboard
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </Link>

        <Link href="/pay/demo" className="block touch-scale">
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(52,199,89,0.2)" }}
            >
              <CreditCard className="w-6 h-6" style={{ color: "var(--ios-green)" }} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-[17px]">Customer Payment</p>
              <p
                className="text-[14px] mt-0.5"
                style={{ color: "rgba(235,235,245,0.5)" }}
              >
                View invoice & pay
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </Link>

        <p
          className="text-center text-[12px] pt-1"
          style={{ color: "rgba(235,235,245,0.25)" }}
        >
          MVP v1.0
        </p>
      </div>
    </main>
  );
}
