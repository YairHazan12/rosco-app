"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Wrench, Shield, CreditCard, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DemoModeBanner } from "@/components/demo-mode-banner";

export default function Home() {
  const router = useRouter();
  const { user, firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && firebaseUser) {
      if (!user?.onboardingComplete) {
        router.push("/onboarding");
      } else if (user.status === "pending") {
        router.push("/pending");
      } else if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "handyman") {
        router.push("/handyman");
      }
    }
  }, [user, firebaseUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <DemoModeBanner />
      <main
        className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-teal-50"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
      {/* Brand hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="relative mb-6">
          <div
            className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl"
            style={{
              boxShadow:
                "0 12px 32px rgba(15, 156, 140, 0.25), 0 4px 12px rgba(15, 156, 140, 0.15)",
            }}
          >
            <Wrench className="w-11 h-11 text-white" strokeWidth={2.5} />
          </div>
          {/* Shine overlay */}
          <div
            className="absolute inset-0 rounded-[22px] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
            }}
          />
        </div>

        <h1
          className="text-[44px] font-bold tracking-[-1.5px] leading-none mb-2"
          style={{ color: "#0F172A" }}
        >
          ROSCO
        </h1>
        <p
          className="text-[16px] font-medium tracking-wide"
          style={{ color: "#64748B" }}
        >
          Handyman Management
        </p>
      </div>

      {/* Navigation cards */}
      <div className="px-4 pb-10 space-y-3 max-w-[430px] mx-auto w-full">
        {/* Handyman */}
        <Link href="/handyman" className="block touch-scale">
          <div
            className="rounded-[20px] p-5 flex items-center gap-4 bg-white border shadow-sm hover:shadow-md transition-all duration-200"
            style={{
              borderColor: "#E2E8F0",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "#E6F7F5",
              }}
            >
              <Wrench className="w-6 h-6 text-teal-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[17px] tracking-tight" style={{ color: "#0F172A" }}>
                Handyman App
              </p>
              <p
                className="text-[14px] mt-[2px]"
                style={{ color: "#64748B" }}
              >
                Schedule, navigation, status
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#F1F5F9" }}
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "#94A3B8" }}
              />
            </div>
          </div>
        </Link>

        {/* Admin */}
        <Link href="/admin" className="block touch-scale">
          <div
            className="rounded-[20px] p-5 flex items-center gap-4 bg-white border shadow-sm hover:shadow-md transition-all duration-200"
            style={{
              borderColor: "#E2E8F0",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "#E6F4FA",
              }}
            >
              <Shield className="w-6 h-6" style={{ color: "#0088CC" }} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[17px] tracking-tight" style={{ color: "#0F172A" }}>
                Admin Panel
              </p>
              <p
                className="text-[14px] mt-[2px]"
                style={{ color: "#64748B" }}
              >
                Jobs, invoices, dashboard
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#F1F5F9" }}
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "#94A3B8" }}
              />
            </div>
          </div>
        </Link>

        {/* Customer Payment */}
        <Link href="/pay/demo" className="block touch-scale">
          <div
            className="rounded-[20px] p-5 flex items-center gap-4 bg-white border shadow-sm hover:shadow-md transition-all duration-200"
            style={{
              borderColor: "#E2E8F0",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "#D1FAE5",
              }}
            >
              <CreditCard className="w-6 h-6" style={{ color: "#10B981" }} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[17px] tracking-tight" style={{ color: "#0F172A" }}>
                Customer Payment
              </p>
              <p
                className="text-[14px] mt-[2px]"
                style={{ color: "#64748B" }}
              >
                View invoice & pay
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#F1F5F9" }}
            >
              <ChevronRight
                className="w-4 h-4"
                style={{ color: "#94A3B8" }}
              />
            </div>
          </div>
        </Link>

        {/* Learn more */}
        <Link
          href="/marketing"
          className="block text-center text-[13px] font-medium py-1 transition-colors duration-200 hover:opacity-80"
          style={{ color: "#0F9C8C" }}
        >
          Learn more about ROSCO →
        </Link>

        {/* Version tag */}
        <p
          className="text-center text-[11px] pt-2 tracking-widest uppercase"
          style={{ color: "#CBD5E1" }}
        >
          MVP v1.0
        </p>
      </div>
    </main>
    </>
  );
}
