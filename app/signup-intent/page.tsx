import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ROSCO – Join the Waitlist",
  description:
    "Tell us a bit about your handyman business and we'll reach out when ROSCO is ready for you.",
};

export default function SignupIntentPage() {
  return (
    <>
      <style>{`
        /* Dot grid background (dark dots for light bg) */
        .dot-grid {
          background-image: radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Teal glow orb */
        @keyframes orb-drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-25px, 20px) scale(0.95); }
        }
        .orb-drift { animation: orb-drift 18s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F8FAFC", color: "#0F172A" }}>
        {/* ═══════════════════════════════════════
            NAV
        ════════════════════════════════════════ */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
          style={{
            background: "rgba(248,250,252,0.90)",
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            backdropFilter: "blur(24px)",
          }}
        >
          <Link href="/marketing" className="flex items-center gap-3 group">
            <Image
              src="/Design_1.svg"
              alt="ROSCO Logo"
              width={120}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </Link>

          <Link
            href="/marketing"
            className="flex items-center gap-1.5 text-[14px] font-medium transition-colors duration-200 hover:text-teal-600"
            style={{ color: "rgba(15,23,42,0.55)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </nav>

        {/* ═══════════════════════════════════════
            MAIN FORM SECTION
        ════════════════════════════════════════ */}
        <main className="relative overflow-hidden px-4 py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center">
          {/* Background orbs */}
          <div
            className="orb-drift absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none opacity-40"
            style={{
              background:
                "radial-gradient(ellipse, rgba(15,156,140,0.18) 0%, transparent 65%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(7,89,133,0.08) 0%, transparent 65%)",
              filter: "blur(80px)",
            }}
          />

          {/* Dot grid overlay */}
          <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />

          <div className="relative w-full max-w-lg">
            <div
              className="rounded-[28px] p-8 md:p-10 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(15,23,42,0.10)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 24px rgba(15,156,140,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="absolute -top-24 -right-24 w-56 h-56 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(15,156,140,0.15) 0%, transparent 65%)",
                  filter: "blur(40px)",
                }}
              />

              <div className="relative">
                <p
                  className="inline-flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-[0.18em] mb-4"
                  style={{
                    background: "rgba(15,156,140,0.10)",
                    border: "1px solid rgba(15,156,140,0.25)",
                    color: "#0F9C8C",
                  }}
                >
                  Early Access
                </p>

                <h1 className="text-[clamp(1.8rem,3vw,2.3rem)] font-extrabold tracking-tight mb-2" style={{ color: "#0F172A" }}>
                  Be the first to try ROSCO
                </h1>
                <p
                  className="text-[14px] mb-6 leading-relaxed"
                  style={{ color: "rgba(15,23,42,0.60)" }}
                >
                  We're rolling ROSCO out with a small group of handyman businesses.
                  Leave your details and we'll reach out as we open new spots.
                </p>

                <form
                  className="space-y-4"
                  action="https://formspree.io/f/mdaldqoa"
                  method="POST"
                >
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-[13px] font-medium"
                      style={{ color: "rgba(15,23,42,0.75)" }}
                    >
                      Your name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Alex, owner of Fix-It Pros"
                      className="border-slate-200 text-[14px] placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      style={{
                        background: "rgba(255,255,255,0.70)",
                        color: "#0F172A",
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-[13px] font-medium"
                      style={{ color: "rgba(15,23,42,0.75)" }}
                    >
                      Work email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="border-slate-200 text-[14px] placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      style={{
                        background: "rgba(255,255,255,0.70)",
                        color: "#0F172A",
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="company"
                      className="text-[13px] font-medium"
                      style={{ color: "rgba(15,23,42,0.75)" }}
                    >
                      Business name
                    </label>
                    <Input
                      id="company"
                      name="company"
                      required
                      placeholder="Your handyman business name"
                      className="border-slate-200 text-[14px] placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      style={{
                        background: "rgba(255,255,255,0.70)",
                        color: "#0F172A",
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="size"
                      className="text-[13px] font-medium"
                      style={{ color: "rgba(15,23,42,0.75)" }}
                    >
                      Team size
                    </label>
                    <Input
                      id="size"
                      name="team_size"
                      placeholder="e.g. 3 handymen, 1 dispatcher"
                      className="border-slate-200 text-[14px] placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      style={{
                        background: "rgba(255,255,255,0.70)",
                        color: "#0F172A",
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="notes"
                      className="text-[13px] font-medium"
                      style={{ color: "rgba(15,23,42,0.75)" }}
                    >
                      What are you hoping ROSCO will help with?
                    </label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      placeholder="Short description of your current workflow and what's painful today."
                      className="border-slate-200 text-[14px] placeholder:text-slate-400 resize-none focus:border-teal-500 focus:ring-teal-500"
                      style={{
                        background: "rgba(255,255,255,0.70)",
                        color: "#0F172A",
                      }}
                    />
                  </div>

                  <input type="hidden" name="source" value="marketing-page" />

                  <Button
                    type="submit"
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-[12px] text-[15px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #12B5A6, #0A857A)",
                      boxShadow:
                        "0 8px 24px rgba(15,156,140,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    Submit interest
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p
                    className="mt-3 text-[11px] text-center leading-relaxed"
                    style={{ color: "rgba(15,23,42,0.45)" }}
                  >
                    We'll only use this info to contact you about ROSCO. No spam, no
                    sharing your details.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
