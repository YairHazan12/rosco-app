"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Wrench, Shield, Hammer } from "lucide-react";
import { toast } from "sonner";

export default function DemoPage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Demo credentials
  const DEMO_ADMIN_EMAIL = "demo-admin@rosco.app";
  const DEMO_ADMIN_PASSWORD = "demo123456";
  const DEMO_HANDYMAN_EMAIL = "demo-handyman@rosco.app";
  const DEMO_HANDYMAN_PASSWORD = "demo123456";

  const handleDemoLogin = async (role: "admin" | "handyman") => {
    setLoading(true);
    try {
      const email = role === "admin" ? DEMO_ADMIN_EMAIL : DEMO_HANDYMAN_EMAIL;
      const password = role === "admin" ? DEMO_ADMIN_PASSWORD : DEMO_HANDYMAN_PASSWORD;

      // Check if demo was already seeded (localStorage cache)
      const demoSeeded = typeof window !== "undefined" && localStorage.getItem("rosco-demo-seeded") === "true";

      if (demoSeeded) {
        // Demo already set up, just sign in directly
        try {
          await signIn(email, password);
          toast.success(`Signed in as ${role === "admin" ? "Admin" : "Handyman"}`);
          router.replace(role === "admin" ? "/admin" : "/handyman");
          return;
        } catch (signInError: any) {
          // Sign in failed - maybe demo was cleared. Fall through to setup.
          console.warn("Cached demo sign-in failed, will run setup:", signInError.message);
          localStorage.removeItem("rosco-demo-seeded");
        }
      }

      // Setup demo (first time or after cache miss)
      const response = await fetch("/api/setup-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to setup demo account");
      }

      // Mark demo as seeded
      if (typeof window !== "undefined") {
        localStorage.setItem("rosco-demo-seeded", "true");
      }

      // Now sign in
      await signIn(email, password);

      toast.success(`Signed in as ${role === "admin" ? "Admin" : "Handyman"}`);
      router.replace(role === "admin" ? "/admin" : "/handyman");
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast.error(error.message || "Demo login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-6 py-12"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Logo */}
      <div className="relative mb-8">
        <div
          className="w-[88px] h-[88px] rounded-[22px] flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl"
          style={{
            boxShadow:
              "0 12px 32px rgba(15, 156, 140, 0.25), 0 4px 12px rgba(15, 156, 140, 0.15)",
          }}
        >
          <Wrench className="w-11 h-11 text-white" strokeWidth={2.5} />
        </div>
        <div
          className="absolute inset-0 rounded-[22px] pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Title */}
      <h1
        className="text-[36px] font-bold tracking-[-1.2px] leading-none mb-2"
        style={{ color: "#0F172A" }}
      >
        Try the Demo
      </h1>
      <p
        className="text-center text-[15px] leading-relaxed max-w-[340px] mb-10"
        style={{ color: "#475569" }}
      >
        Choose a role to explore ROSCO with sample data
      </p>

      {/* Role Selection Cards */}
      <div className="w-full max-w-[420px] space-y-4">
        {/* Admin Card */}
        <button
          onClick={() => handleDemoLogin("admin")}
          disabled={loading}
          className="w-full rounded-[18px] p-6 bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#E6F7F5" }}
            >
              <Shield className="w-7 h-7 text-teal-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[18px] font-semibold mb-1" style={{ color: "#0F172A" }}>
                Admin
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
                Manage jobs, team members, invoices, and company settings
              </p>
            </div>
          </div>
        </button>

        {/* Handyman Card */}
        <button
          onClick={() => handleDemoLogin("handyman")}
          disabled={loading}
          className="w-full rounded-[18px] p-6 bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#E6F7F5" }}
            >
              <Hammer className="w-7 h-7 text-teal-600" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[18px] font-semibold mb-1" style={{ color: "#0F172A" }}>
                Handyman
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
                View assigned jobs, update status, and manage your schedule
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-block w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
            Signing in...
          </p>
        </div>
      )}

      {/* Back Link */}
      <button
        onClick={() => router.push("/")}
        className="mt-8 text-[14px] font-medium transition-opacity hover:opacity-70"
        style={{ color: "#0F9C8C" }}
      >
        ← Back to Home
      </button>
    </main>
  );
}
