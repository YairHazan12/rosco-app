"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  Wrench,
  Shield,
  CreditCard,
  ChevronRight,
  CheckCircle,
  BarChart3,
  MapPin,
  Bell,
  FileText,
  Zap,
  ArrowRight,
  Phone,
  Clock,
  Users,
  TrendingUp,
  Star,
  Play,
  CheckCheck,
  Hammer,
  Settings,
  Building2,
} from "lucide-react";

// ─── Animation hook ────────────────────────────────────────────────────────────
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-in");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Animate wrapper ───────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Brand Badge ──────────────────────────────────────────────────────────────
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
      style={{
        background: "rgba(15,156,140,0.10)",
        border: "1px solid rgba(15,156,140,0.25)",
        color: "#0F9C8C",
      }}
    >
      {children}
    </span>
  );
}

// ─── Light Card ───────────────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-[24px] p-6 transition-all duration-300 ${className}`}
      style={{
        background: "rgba(255,255,255,0.90)",
        border: "1px solid rgba(15,23,42,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Feature Icon ─────────────────────────────────────────────────────────────
function FeatureIcon({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 mb-4"
      style={{ background: bg, border: `1px solid ${color}33` }}
    >
      <span style={{ color }}>{children}</span>
    </div>
  );
}

// ─── Hero Phone Mockup (Light Theme) ──────────────────────────────────────────
function PhoneMockup() {
  return (
    <div
      className="relative w-[260px] rounded-[36px] overflow-hidden shadow-2xl"
      style={{
        border: "2px solid rgba(15,23,42,0.12)",
        background: "#FFFFFF",
      }}
    >
      {/* Notch */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-20 h-5 rounded-full" style={{ background: "#F1F5F9" }} />
      </div>
      {/* Status */}
      <div
        className="px-5 py-2 flex items-center justify-between text-[10px]"
        style={{ color: "rgba(15,23,42,0.45)" }}
      >
        <span>9:41</span>
        <span>●●●</span>
      </div>
      {/* App content */}
      <div className="px-4 pb-6 space-y-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: "rgba(15,23,42,0.50)" }}
        >
          Today's Jobs
        </p>
        {[
          { job: "Pipe Fix", addr: "12 Oak Ave", status: "In Progress", color: "#F59E0B" },
          { job: "AC Install", addr: "5 Maple St", status: "Done ✓", color: "#10B981" },
          { job: "Fence Fix", addr: "88 Elm Rd", status: "Upcoming", color: "#0F9C8C" },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-[14px] p-3"
            style={{
              background: "rgba(15,23,42,0.03)",
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold" style={{ color: "#0F172A" }}>{item.job}</p>
                <p
                  className="text-[10px] mt-0.5 flex items-center gap-1"
                  style={{ color: "rgba(15,23,42,0.50)" }}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  {item.addr}
                </p>
              </div>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: `${item.color}20`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
        {/* Nav button */}
        <div
          className="rounded-[12px] p-3 flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #12B5A6, #0F9C8C)",
            boxShadow: "0 4px 16px rgba(15,156,140,0.35)",
          }}
        >
          <MapPin className="w-4 h-4 text-white" />
          <span className="text-white text-[12px] font-semibold">Navigate to Job</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Mockup (Light Theme) ───────────────────────────────────────────
function DashboardMockup() {
  return (
    <div
      className="rounded-[24px] overflow-hidden w-full"
      style={{
        border: "1px solid rgba(15,23,42,0.12)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(15,23,42,0.04)",
        background: "#FFFFFF",
      }}
    >
      {/* Browser bar */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "#F1F5F9",
          borderBottom: "1px solid rgba(15,23,42,0.10)",
        }}
      >
        <div className="flex gap-1.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div
          className="flex-1 mx-4 rounded-md px-3 py-1 text-[11px]"
          style={{
            background: "rgba(15,23,42,0.06)",
            color: "rgba(15,23,42,0.50)",
          }}
        >
          rosco-app-chi.vercel.app/admin
        </div>
      </div>

      <div className="p-5" style={{ background: "#FFFFFF" }}>
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Active Jobs", value: "14", icon: <Wrench className="w-3.5 h-3.5" />, color: "#0F9C8C" },
            { label: "Team", value: "6", icon: <Users className="w-3.5 h-3.5" />, color: "#007AFF" },
            { label: "Revenue", value: "$8.4k", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "#10B981" },
            { label: "Pending", value: "3", icon: <Clock className="w-3.5 h-3.5" />, color: "#F59E0B" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[12px] p-2.5"
              style={{
                background: "rgba(15,23,42,0.03)",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px]" style={{ color: "rgba(15,23,42,0.50)" }}>
                  {s.label}
                </span>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <p className="text-[18px] font-bold leading-none" style={{ color: "#0F172A" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Jobs list */}
        <div
          className="rounded-[12px] overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.02)",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(15,23,42,0.06)" }}
          >
            <span className="text-[12px] font-semibold" style={{ color: "#0F172A" }}>Recent Jobs</span>
            <span className="text-[10px] font-semibold" style={{ color: "#0F9C8C" }}>
              View All →
            </span>
          </div>
          {[
            { job: "Pipe Fix – 12 Oak Ave", status: "In Progress", time: "2h ago", color: "#F59E0B" },
            { job: "AC Install – 5 Maple St", status: "Completed", time: "5h ago", color: "#10B981" },
            { job: "Fence Repair – 88 Elm Rd", status: "Scheduled", time: "Tomorrow", color: "#007AFF" },
          ].map((item, i) => (
            <div
              key={i}
              className="px-4 py-2.5 flex items-center justify-between"
              style={{
                borderBottom: i < 2 ? "1px solid rgba(15,23,42,0.05)" : undefined,
              }}
            >
              <div>
                <p className="text-[12px] font-medium" style={{ color: "#0F172A" }}>{item.job}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(15,23,42,0.45)" }}>
                  {item.time}
                </p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${item.color}20`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MarketingPage() {
  return (
    <>
      <style>{`
        /* Reveal animation */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                      transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal.animate-in {
          opacity: 1;
          transform: none;
        }

        /* Hover card lift */
        .card-hover {
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.25s ease,
                      border-color 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(15,156,140,0.10);
          border-color: rgba(15,156,140,0.28) !important;
        }

        /* Gradient text animation */
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-animate {
          background-size: 200% 200%;
          animation: shimmer 5s ease infinite;
        }

        /* Float animation for hero phone */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }
        .float-anim {
          animation: float 5s ease-in-out infinite;
        }

        /* Pulse ring for CTA */
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(15,156,140,0.35); }
          70% { box-shadow: 0 0 0 14px rgba(15,156,140,0); }
          100% { box-shadow: 0 0 0 0 rgba(15,156,140,0); }
        }
        .pulse-ring {
          animation: pulse-ring 2.5s ease-out infinite;
        }

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

        /* Step number pulse */
        @keyframes step-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(15,156,140,0.35); }
          50% { box-shadow: 0 4px 32px rgba(15,156,140,0.60); }
        }
        .step-glow { animation: step-glow 3s ease-in-out infinite; }

        /* Nav glass on scroll */
        .nav-glass {
          transition: background 0.3s ease, border-color 0.3s ease;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "#F8FAFC", color: "#0F172A" }}>

        {/* ═══════════════════════════════════════
            NAV
        ════════════════════════════════════════ */}
        <nav
          className="nav-glass sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
          style={{
            background: "rgba(248,250,252,0.90)",
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/Design_1.svg"
              alt="ROSCO Logo"
              width={120}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </div>

          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors duration-200 hover:text-teal-600"
                style={{ color: "rgba(15,23,42,0.55)" }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:block text-[14px] font-medium transition-colors duration-200 hover:text-teal-600"
              style={{ color: "rgba(15,23,42,0.55)" }}
            >
              Sign In
            </Link>
            <Link
              href="/signup-intent"
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[14px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #12B5A6, #0F9C8C)",
                boxShadow: "0 4px 16px rgba(15,156,140,0.30)",
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* ═══════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section className="relative overflow-hidden px-6 md:px-12 pt-20 pb-0">
          {/* Background orbs */}
          <div
            className="orb-drift absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none opacity-40"
            style={{
              background:
                "radial-gradient(ellipse, rgba(15,156,140,0.18) 0%, transparent 65%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(7,89,133,0.08) 0%, transparent 65%)",
              filter: "blur(80px)",
            }}
          />

          {/* Dot grid overlay */}
          <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center pt-8 pb-0">
              {/* Left: Copy */}
              <div>
                <Reveal>
                  <div className="flex items-center gap-3 mb-6">
                    <Badge>
                      <Zap className="w-3 h-3" />
                      All-in-One Handyman Platform
                    </Badge>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <h1
                    className="text-[clamp(2.8rem,6vw,4.5rem)] font-extrabold leading-[1.06] tracking-[-2.5px] mb-6"
                    style={{ color: "#0F172A" }}
                  >
                    Run Your Handyman
                    <br />
                    <span
                      className="gradient-text-animate"
                      style={{
                        background:
                          "linear-gradient(90deg, #0F9C8C 0%, #12B5A6 35%, #0A857A 70%, #0F9C8C 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                      }}
                    >
                      Business Like a Pro
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={180}>
                  <p
                    className="text-[clamp(1rem,2vw,1.2rem)] leading-relaxed max-w-xl mb-10"
                    style={{ color: "rgba(15,23,42,0.60)" }}
                  >
                    ROSCO connects your admin dashboard, field handymen, and customer
                    payments in one seamless platform. Less paperwork. More jobs done.
                    Full control.
                  </p>
                </Reveal>

                <Reveal delay={240}>
                  <div className="flex flex-col sm:flex-row gap-3 mb-12">
                    <Link
                      href="/signup-intent"
                      className="pulse-ring inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[14px] text-[16px] font-bold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #12B5A6, #0A857A)",
                        boxShadow:
                          "0 8px 30px rgba(15,156,140,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                      }}
                    >
                      Start for Free
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href="/demo"
                      className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[14px] text-[16px] font-semibold transition-all duration-200 hover:bg-slate-100 active:scale-95"
                      style={{
                        color: "rgba(15,23,42,0.70)",
                        background: "rgba(15,23,42,0.05)",
                        border: "1px solid rgba(15,23,42,0.12)",
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Live Demo
                    </Link>
                  </div>
                </Reveal>

                <Reveal delay={300}>
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-2">
                      {["#0F9C8C", "#007AFF", "#10B981", "#F59E0B"].map((c, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                          style={{
                            background: c,
                            borderColor: "#F8FAFC",
                            zIndex: 4 - i,
                          }}
                        >
                          {["A", "B", "C", "D"][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex gap-0.5 mb-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-[12px]" style={{ color: "rgba(15,23,42,0.45)" }}>
                        Trusted by handyman businesses
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right: Mockup visuals */}
              <div className="relative flex items-end justify-center lg:justify-end gap-6">
                {/* Dashboard mockup */}
                <Reveal delay={200} className="w-full max-w-[420px]">
                  <DashboardMockup />
                </Reveal>

                {/* Phone mockup floating */}
                <div
                  className="float-anim absolute -left-4 bottom-6 hidden lg:block"
                  style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.18))" }}
                >
                  <PhoneMockup />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #F8FAFC, transparent)",
            }}
          />
        </section>

        {/* ═══════════════════════════════════════
            STATS STRIP
        ════════════════════════════════════════ */}
        <section
          className="py-14 px-6 md:px-12 mt-12"
          style={{
            borderTop: "1px solid rgba(15,23,42,0.08)",
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            background: "#FFFFFF",
          }}
        >
          <Reveal>
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "3×", label: "Faster job dispatch", icon: <Zap className="w-5 h-5" /> },
                { value: "98%", label: "Payment success rate", icon: <CheckCheck className="w-5 h-5" /> },
                { value: "24/7", label: "Real-time tracking", icon: <Bell className="w-5 h-5" /> },
                { value: "0 paper", label: "Fully digital workflow", icon: <FileText className="w-5 h-5" /> },
              ].map((stat, i) => (
                <Reveal key={stat.label} delay={i * 80}>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3"
                      style={{
                        background: "rgba(15,156,140,0.10)",
                        color: "#0F9C8C",
                      }}
                    >
                      {stat.icon}
                    </div>
                    <p
                      className="text-[2.2rem] font-extrabold tracking-tight leading-none mb-1"
                      style={{
                        background: "linear-gradient(135deg, #12B5A6, #0F9C8C)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-[13px] mt-1"
                      style={{ color: "rgba(15,23,42,0.50)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ═══════════════════════════════════════
            FEATURES – 3 PILLARS
        ════════════════════════════════════════ */}
        <section id="features" className="px-6 md:px-12 py-28" style={{ background: "#F8FAFC" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-16">
              <Badge>Three Powerful Pillars</Badge>
              <h2
                className="mt-5 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold tracking-tight leading-tight"
                style={{ color: "#0F172A" }}
              >
                Everything your business needs,
                <br />
                <span style={{ color: "rgba(15,23,42,0.40)" }}>all in one place</span>
              </h2>
              <p
                className="mt-4 text-[15px] max-w-xl mx-auto leading-relaxed"
                style={{ color: "rgba(15,23,42,0.55)" }}
              >
                From the admin office to the job site — ROSCO handles every part
                of the handyman business lifecycle.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Admin */}
              <Reveal delay={0}>
                <GlassCard className="card-hover relative overflow-hidden h-full">
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(0,122,255,0.06) 0%, transparent 70%)",
                    }}
                  />
                  <FeatureIcon color="#007AFF" bg="rgba(0,122,255,0.10)">
                    <Building2 className="w-6 h-6" />
                  </FeatureIcon>
                  <h3 className="font-bold text-[18px] mb-2" style={{ color: "#0F172A" }}>Admin Dashboard</h3>
                  <p className="text-[14px] leading-relaxed mb-5" style={{ color: "rgba(15,23,42,0.55)" }}>
                    Full command center. Create jobs, assign handymen, track progress, and
                    generate invoices — all from one screen.
                  </p>
                  <ul className="space-y-2">
                    {["Job creation & scheduling", "Team assignment & tracking", "Invoice generation", "Revenue analytics"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px]">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#007AFF" }} />
                        <span style={{ color: "rgba(15,23,42,0.70)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                    <Link href="/signup-intent" className="flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-75 transition-opacity" style={{ color: "#007AFF" }}>
                      Learn more <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </GlassCard>
              </Reveal>

              {/* Handyman – featured */}
              <Reveal delay={100}>
                <GlassCard
                  className="card-hover relative overflow-hidden h-full md:-mt-4 md:mb-4"
                  style={{
                    background: "rgba(15,156,140,0.04)",
                    border: "1px solid rgba(15,156,140,0.22)",
                    boxShadow: "0 4px 32px rgba(15,156,140,0.10)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-1 rounded-t-[24px]"
                    style={{ background: "linear-gradient(90deg, #0F9C8C, #12B5A6)" }}
                  />
                  <div
                    className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(15,156,140,0.08) 0%, transparent 70%)",
                    }}
                  />
                  <div className="absolute top-5 right-5">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                      style={{
                        background: "rgba(15,156,140,0.12)",
                        border: "1px solid rgba(15,156,140,0.28)",
                        color: "#0F9C8C",
                      }}
                    >
                      Core App
                    </span>
                  </div>
                  <FeatureIcon color="#0F9C8C" bg="rgba(15,156,140,0.12)">
                    <Hammer className="w-6 h-6" />
                  </FeatureIcon>
                  <h3 className="font-bold text-[18px] mb-2" style={{ color: "#0F172A" }}>Handyman App</h3>
                  <p className="text-[14px] leading-relaxed mb-5" style={{ color: "rgba(15,23,42,0.55)" }}>
                    Your crew's pocket companion. View jobs, navigate to each site, update
                    statuses on the go, and close tickets instantly.
                  </p>
                  <ul className="space-y-2">
                    {["Daily schedule at a glance", "One-tap status updates", "Built-in navigation links", "Push notifications", "Offline-friendly design"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px]">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#0F9C8C" }} />
                        <span style={{ color: "rgba(15,23,42,0.70)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(15,156,140,0.15)" }}>
                    <Link href="/signup-intent" className="flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-75 transition-opacity" style={{ color: "#0F9C8C" }}>
                      Join early access <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </GlassCard>
              </Reveal>

              {/* Payments */}
              <Reveal delay={200}>
                <GlassCard className="card-hover relative overflow-hidden h-full">
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
                    }}
                  />
                  <FeatureIcon color="#10B981" bg="rgba(16,185,129,0.10)">
                    <CreditCard className="w-6 h-6" />
                  </FeatureIcon>
                  <h3 className="font-bold text-[18px] mb-2" style={{ color: "#0F172A" }}>Customer Payments</h3>
                  <p className="text-[14px] leading-relaxed mb-5" style={{ color: "rgba(15,23,42,0.55)" }}>
                    Send a link, get paid. Customers see a beautiful invoice and pay instantly —
                    no app downloads, no friction.
                  </p>
                  <ul className="space-y-2">
                    {["Branded payment pages", "Paystack-powered checkout", "Instant confirmation", "Digital receipts"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13px]">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#10B981" }} />
                        <span style={{ color: "rgba(15,23,42,0.70)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}>
                    <Link href="/signup-intent" className="flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-75 transition-opacity" style={{ color: "#10B981" }}>
                      Register interest <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </GlassCard>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="px-6 md:px-12 py-28 relative overflow-hidden"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="absolute inset-0 dot-grid pointer-events-none opacity-50"
          />
          <div className="relative max-w-5xl mx-auto">
            <Reveal className="text-center mb-16">
              <Badge>Simple Workflow</Badge>
              <h2 className="mt-5 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
                From booking to payment
                <br />
                <span style={{ color: "rgba(15,23,42,0.40)" }}>in 4 simple steps</span>
              </h2>
            </Reveal>

            <div className="relative">
              {/* Connector line */}
              <div
                className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
                style={{ background: "rgba(15,156,140,0.20)" }}
              />

              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { step: "01", icon: <FileText className="w-5 h-5" />, title: "Create a Job", desc: "Admin logs the request, adds details, and selects the best available handyman." },
                  { step: "02", icon: <Bell className="w-5 h-5" />, title: "Notify Handyman", desc: "The assigned tech gets an instant push notification with all job details." },
                  { step: "03", icon: <MapPin className="w-5 h-5" />, title: "Do the Work", desc: "Navigate to the site, complete the job, and update status with one tap." },
                  { step: "04", icon: <CreditCard className="w-5 h-5" />, title: "Collect Payment", desc: "Send the customer a payment link. Done. Money in the bank immediately." },
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 90}>
                    <div className="text-center flex flex-col items-center">
                      <div
                        className="step-glow relative w-16 h-16 rounded-full flex items-center justify-center mb-5 z-10"
                        style={{
                          background: "linear-gradient(135deg, #12B5A6, #0A857A)",
                        }}
                      >
                        <span className="text-white">{item.icon}</span>
                        <div
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: "#F8FAFC", color: "#0F9C8C", border: "1.5px solid #0F9C8C" }}
                        >
                          {item.step}
                        </div>
                      </div>
                      <h4 className="font-bold text-[15px] mb-2" style={{ color: "#0F172A" }}>{item.title}</h4>
                      <p className="text-[13px] leading-relaxed" style={{ color: "rgba(15,23,42,0.55)" }}>
                        {item.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURE GRID
        ════════════════════════════════════════ */}
        <section className="px-6 md:px-12 py-28" style={{ background: "#F8FAFC" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
                Built for the field,{" "}
                <span style={{ color: "rgba(15,23,42,0.40)" }}>refined for the office</span>
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: <BarChart3 className="w-5 h-5" />, color: "#007AFF", title: "Live Analytics", desc: "Track revenue, job completion rates, and team performance in real time." },
                { icon: <Zap className="w-5 h-5" />, color: "#F59E0B", title: "Instant Dispatch", desc: "Assign and notify a handyman in seconds — no phone calls needed." },
                { icon: <Phone className="w-5 h-5" />, color: "#0F9C8C", title: "Mobile-First", desc: "Works perfectly on any phone. No app store downloads required." },
                { icon: <Star className="w-5 h-5" />, color: "#D97706", title: "Customer Experience", desc: "Beautifully designed payment pages that make your brand shine." },
                { icon: <Clock className="w-5 h-5" />, color: "#10B981", title: "Easy Scheduling", desc: "Calendar view of all jobs. Drag-and-drop rescheduling built in." },
                { icon: <Shield className="w-5 h-5" />, color: "#7C3AED", title: "Secure & Reliable", desc: "Firebase-backed with Paystack payments. Enterprise-grade security." },
                { icon: <Users className="w-5 h-5" />, color: "#0F9C8C", title: "Team Management", desc: "Invite handymen with a unique code. Monitor utilization and performance." },
                { icon: <Settings className="w-5 h-5" />, color: "#64748B", title: "Fully Customisable", desc: "Set your brand colors, service types, and pricing structure." },
                { icon: <FileText className="w-5 h-5" />, color: "#EA580C", title: "Smart Invoicing", desc: "Auto-generate professional invoices from completed job data." },
              ].map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 70}>
                  <div
                    className="flex gap-4 p-5 rounded-[18px] transition-all duration-200 hover:bg-white cursor-default group"
                    style={{
                      border: "1px solid rgba(15,23,42,0.08)",
                      background: "rgba(255,255,255,0.60)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                      style={{ background: `${f.color}14`, color: f.color }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14px] mb-1" style={{ color: "#0F172A" }}>{f.title}</h4>
                      <p className="text-[13px] leading-relaxed" style={{ color: "rgba(15,23,42,0.55)" }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════ */}
        <section
          className="px-6 md:px-12 py-24 relative overflow-hidden"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="absolute inset-0 dot-grid pointer-events-none opacity-40"
          />
          <div className="relative max-w-6xl mx-auto">
            <Reveal className="text-center mb-14">
              <Badge>
                <Star className="w-3 h-3" />
                What Businesses Say
              </Badge>
              <h2 className="mt-5 text-[clamp(1.6rem,4vw,2.5rem)] font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
                Real teams, real results
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  quote: "We went from WhatsApp chaos to a proper system in one day. Our handymen actually know where to be and when.",
                  name: "Adebayo M.",
                  role: "Operations Manager",
                  rating: 5,
                  color: "#0F9C8C",
                },
                {
                  quote: "The payment link feature changed everything. Customers pay the same day. No chasing, no bank transfers, no headaches.",
                  name: "Chinwe O.",
                  role: "Small Business Owner",
                  rating: 5,
                  color: "#007AFF",
                  featured: true,
                },
                {
                  quote: "My handymen can see their jobs on their phones without calling me every hour. That alone is worth it.",
                  name: "Emeka T.",
                  role: "Handyman Business Owner",
                  rating: 5,
                  color: "#10B981",
                },
              ].map((t, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div
                    className={`card-hover rounded-[24px] p-6 flex flex-col h-full ${t.featured ? "md:-mt-4 md:mb-4" : ""}`}
                    style={{
                      background: t.featured ? "rgba(15,156,140,0.04)" : "rgba(255,255,255,0.90)",
                      border: t.featured ? "1px solid rgba(15,156,140,0.22)" : "1px solid rgba(15,23,42,0.08)",
                      boxShadow: t.featured ? "0 8px 40px rgba(15,156,140,0.10)" : "0 2px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex gap-0.5 mb-4">
                      {[1,2,3,4,5].map(j => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p
                      className="text-[14px] leading-relaxed flex-1 mb-6 italic"
                      style={{ color: "rgba(15,23,42,0.65)" }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                        style={{ background: t.color }}
                      >
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: "#0F172A" }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: "rgba(15,23,42,0.45)" }}>
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PRICING
        ════════════════════════════════════════ */}
        <section id="pricing" className="px-6 md:px-12 py-28" style={{ background: "#F8FAFC" }}>
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-14">
              <Badge>Simple Pricing</Badge>
              <h2 className="mt-5 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
                Start free.{" "}
                <span style={{ color: "rgba(15,23,42,0.40)" }}>Scale as you grow.</span>
              </h2>
              <p className="mt-3 text-[15px]" style={{ color: "rgba(15,23,42,0.55)" }}>
                No hidden fees. No per-transaction cuts. Flat monthly pricing for your whole team.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  name: "Starter",
                  price: "Free",
                  sub: "forever",
                  highlight: false,
                  features: ["Up to 3 handymen", "10 jobs / month", "Basic invoicing", "Customer payment page"],
                },
                {
                  name: "Pro",
                  price: "$49",
                  sub: "/ month",
                  highlight: true,
                  features: ["Unlimited handymen", "Unlimited jobs", "Advanced analytics", "Priority support", "Custom branding"],
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  sub: "talk to us",
                  highlight: false,
                  features: ["Multi-location support", "API access", "Dedicated onboarding", "SLA guarantee"],
                },
              ].map((plan, i) => (
                <Reveal key={plan.name} delay={i * 80}>
                  <div
                    className={`card-hover rounded-[24px] p-6 flex flex-col h-full ${plan.highlight ? "md:-mt-4 md:mb-4" : ""}`}
                    style={{
                      background: plan.highlight ? "rgba(15,156,140,0.05)" : "rgba(255,255,255,0.90)",
                      border: plan.highlight ? "1px solid rgba(15,156,140,0.28)" : "1px solid rgba(15,23,42,0.08)",
                      boxShadow: plan.highlight ? "0 8px 40px rgba(15,156,140,0.12)" : "0 2px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    {plan.highlight && (
                      <div
                        className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest self-start mb-3"
                        style={{
                          background: "linear-gradient(135deg, #12B5A6, #0F9C8C)",
                          color: "white",
                        }}
                      >
                        Most Popular
                      </div>
                    )}
                    <p
                      className="text-[13px] font-semibold uppercase tracking-widest mb-3"
                      style={{ color: plan.highlight ? "#0F9C8C" : "rgba(15,23,42,0.50)" }}
                    >
                      {plan.name}
                    </p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-[2.4rem] font-extrabold tracking-tight leading-none" style={{ color: "#0F172A" }}>
                        {plan.price}
                      </span>
                      <span className="text-[13px] mb-1.5" style={{ color: "rgba(15,23,42,0.45)" }}>
                        {plan.sub}
                      </span>
                    </div>
                    <div className="my-5 h-px" style={{ background: "rgba(15,23,42,0.08)" }} />
                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[13px]">
                          <CheckCircle
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: plan.highlight ? "#0F9C8C" : "#10B981" }}
                          />
                          <span style={{ color: "rgba(15,23,42,0.70)" }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup-intent"
                      className="mt-6 flex items-center justify-center gap-1.5 py-3 rounded-[12px] text-[14px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={
                        plan.highlight
                          ? {
                              background: "linear-gradient(135deg, #12B5A6, #0A857A)",
                              color: "white",
                              boxShadow: "0 4px 16px rgba(15,156,140,0.30)",
                            }
                          : {
                              background: "rgba(15,23,42,0.06)",
                              color: "rgba(15,23,42,0.70)",
                              border: "1px solid rgba(15,23,42,0.10)",
                            }
                      }
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BOTTOM CTA
        ════════════════════════════════════════ */}
        <section className="px-6 md:px-12 py-20" style={{ background: "#FFFFFF" }}>
          <Reveal>
            <div
              className="max-w-3xl mx-auto text-center rounded-[32px] py-16 px-8 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,156,140,0.08) 0%, rgba(7,89,133,0.04) 100%)",
                border: "1px solid rgba(15,156,140,0.20)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 0%, rgba(15,156,140,0.10) 0%, transparent 65%)",
                }}
              />
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: "linear-gradient(145deg, #12B5A6, #0A857A)",
                    boxShadow: "0 8px 28px rgba(15,156,140,0.35)",
                  }}
                >
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-[clamp(1.6rem,4vw,2.6rem)] font-extrabold tracking-tight mb-3" style={{ color: "#0F172A" }}>
                  Ready to transform your business?
                </h2>
                <p
                  className="text-[15px] mb-8 max-w-lg mx-auto leading-relaxed"
                  style={{ color: "rgba(15,23,42,0.55)" }}
                >
                  Join handyman businesses already running smoother operations with ROSCO.
                  Get set up in minutes, not days.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/signup-intent"
                    className="pulse-ring inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[14px] text-[16px] font-bold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #12B5A6, #0A857A)",
                      boxShadow: "0 8px 30px rgba(15,156,140,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    Start Free Today
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[14px] text-[16px] font-semibold transition-all duration-200 hover:bg-slate-50"
                    style={{
                      color: "rgba(15,23,42,0.70)",
                      background: "rgba(15,23,42,0.05)",
                      border: "1px solid rgba(15,23,42,0.12)",
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Try the Demo
                  </Link>
                </div>
                <p className="mt-6 text-[12px]" style={{ color: "rgba(15,23,42,0.40)" }}>
                  No credit card required · Free tier available
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ════════════════════════════════════════ */}
        <footer
          className="px-6 md:px-12 py-10"
          style={{ borderTop: "1px solid rgba(15,23,42,0.08)", background: "#F8FAFC" }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/Design_1.svg"
                alt="ROSCO"
                width={100}
                height={34}
                style={{ objectFit: "contain" }}
              />
              <span className="text-[12px]" style={{ color: "rgba(15,23,42,0.38)" }}>
                Handyman Management
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[13px]">
              {[
                { label: "App Home", href: "/" },
                { label: "Admin", href: "/admin" },
                { label: "Handyman", href: "/handyman" },
                { label: "Live Demo", href: "/demo" },
                { label: "Sign Up", href: "/signup-intent" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="transition-colors duration-200 hover:text-teal-600"
                  style={{ color: "rgba(15,23,42,0.45)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <p className="text-[11px] tracking-widest uppercase" style={{ color: "rgba(15,23,42,0.25)" }}>
              MVP v1.0
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
