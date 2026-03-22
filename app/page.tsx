"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Wrench, Calendar, FileText, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DemoModeBanner } from "@/components/demo-mode-banner";

export default function Home() {
  const router = useRouter();
  const { user, firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && firebaseUser) {
      if (!user) {
        // Firestore doc not loaded yet — wait
        return;
      }
      const isDemoUser = firebaseUser?.email?.startsWith("demo-");
      if (!user.onboardingComplete && !isDemoUser) {
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
            <Image src="/Design_1.svg" alt="ROSCO" width={220} height={75} style={{ objectFit: "contain" }} />
          </div>

          <h1
            className="text-[44px] font-bold tracking-[-1.5px] leading-none mb-2"
            style={{ color: "#0F172A" }}
          >
            ROSCO
          </h1>
          <p
            className="text-[16px] font-medium tracking-wide mb-8"
            style={{ color: "#64748B" }}
          >
            Handyman Management
          </p>

          {/* Value proposition */}
          <p
            className="text-center text-[15px] leading-relaxed max-w-[340px] mb-10"
            style={{ color: "#475569" }}
          >
            Streamline your handyman business with job scheduling, invoicing, and team coordination — all in one place.
          </p>

          {/* CTAs */}
          <div className="w-full max-w-[380px] space-y-3">
            {/* Try Demo */}
            <Link href="/demo" className="block touch-scale">
              <div
                className="rounded-[18px] p-5 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #5DD88A 0%, #4ECB71 100%)",
                }}
              >
                <Wrench className="w-6 h-6 text-white" strokeWidth={2.5} />
                <span className="text-white font-semibold text-[17px] tracking-tight">
                  Try the Demo
                </span>
              </div>
            </Link>

            {/* Sign Up / Sign In */}
            <Link href="/login" className="block touch-scale">
              <div
                className="rounded-[18px] p-5 flex items-center justify-center border-2 hover:bg-white/50 transition-all duration-200"
                style={{
                  borderColor: "#5DD88A",
                  background: "rgba(255, 255, 255, 0.6)",
                }}
              >
                <span
                  className="font-semibold text-[17px] tracking-tight"
                  style={{ color: "#4ECB71" }}
                >
                  Sign Up / Sign In
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="px-6 pb-10 max-w-[430px] mx-auto w-full">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ background: "#EDFAF2" }}
              >
                <Calendar className="w-6 h-6 text-teal-600" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: "#475569" }}>
                Job Scheduling
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ background: "#EDFAF2" }}
              >
                <FileText className="w-6 h-6 text-teal-600" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: "#475569" }}>
                Smart Invoicing
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ background: "#EDFAF2" }}
              >
                <Users className="w-6 h-6 text-teal-600" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-medium" style={{ color: "#475569" }}>
                Team Coordination
              </p>
            </div>
          </div>

          {/* Learn more */}
          <Link
            href="/marketing"
            className="block text-center text-[13px] font-medium py-1 transition-colors duration-200 hover:opacity-80"
            style={{ color: "#4ECB71" }}
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
