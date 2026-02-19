import Link from "next/link";
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
  Star,
  ArrowRight,
  Phone,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

// ─── Tiny reusable badge ──────────────────────────────────────────────────────
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
      style={{
        background: "rgba(255,107,53,0.15)",
        border: "1px solid rgba(255,107,53,0.30)",
        color: "#FF6B35",
      }}
    >
      {children}
    </span>
  );
}

// ─── Glass card ───────────────────────────────────────────────────────────────
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
      className={`rounded-[24px] p-6 ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Feature icon wrapper ─────────────────────────────────────────────────────
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

export default function MarketingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#111113", color: "#EBEBF5" }}
    >
      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{
          background: "rgba(17,17,19,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #FF7A47, #FF5500)",
              boxShadow: "0 4px 14px rgba(255,107,53,0.40)",
            }}
          >
            <Wrench className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            ROSCO
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium">
          {["Features", "How it Works", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="transition-colors duration-200 hover:text-white"
              style={{ color: "rgba(235,235,245,0.50)" }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/signup-intent"
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[14px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #FF6B35, #FF5500)",
            boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
          }}
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative overflow-hidden px-6 md:px-12 pt-24 pb-32"
      >
        {/* Background glow blobs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,85,0,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <Badge>
              <Zap className="w-3 h-3" />
              All-in-One Handyman Platform
            </Badge>
          </div>

          {/* Main headline */}
          <h1
            className="text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[1.08] tracking-[-2px] mb-6"
            style={{
              background:
                "linear-gradient(135deg, #FFFFFF 0%, rgba(235,235,245,0.75) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Run Your Handyman
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #FF6B35, #FF8C5A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Business Like a Pro
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-[clamp(1rem,2.5vw,1.25rem)] leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: "rgba(235,235,245,0.55)" }}
          >
            ROSCO brings together your admin dashboard, field handymen, and
            customer payments in one seamless platform. Less paperwork, more
            jobs done.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/signup-intent"
              className="flex items-center gap-2 px-8 py-4 rounded-[14px] text-[16px] font-bold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #FF6B35, #FF4500)",
                boxShadow:
                  "0 8px 30px rgba(255,107,53,0.40), 0 1px 0 rgba(255,255,255,0.10) inset",
              }}
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-[14px] text-[16px] font-semibold transition-all duration-200 hover:bg-white/10"
              style={{
                color: "rgba(235,235,245,0.75)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              See How It Works
            </Link>
          </div>

          {/* Social proof dots */}
          <p
            className="mt-8 text-[13px]"
            style={{ color: "rgba(235,235,245,0.35)" }}
          >
            Trusted by handyman businesses across the country
          </p>
        </div>

        {/* ── Mock UI preview ── */}
        <div className="relative max-w-5xl mx-auto mt-16">
          {/* Glow under card */}
          <div
            className="absolute inset-x-16 bottom-0 h-24 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(255,107,53,0.25) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div
            className="relative rounded-[28px] overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 40px 80px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Fake browser toolbar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{
                background: "#1C1C1E",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex gap-1.5">
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <div
                    key={c}
                    className="w-3 h-3 rounded-full"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div
                className="flex-1 mx-4 rounded-md px-3 py-1 text-[11px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(235,235,245,0.30)",
                }}
              >
                rosco-app-chi.vercel.app/admin
              </div>
            </div>

            {/* Dashboard mockup */}
            <div
              className="p-6 md:p-8"
              style={{ background: "#161618" }}
            >
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Active Jobs", value: "14", icon: <Wrench className="w-4 h-4" />, color: "#FF6B35" },
                  { label: "Handymen", value: "6", icon: <Users className="w-4 h-4" />, color: "#007AFF" },
                  { label: "Revenue", value: "$8.4k", icon: <TrendingUp className="w-4 h-4" />, color: "#34C759" },
                  { label: "Pending", value: "3", icon: <Clock className="w-4 h-4" />, color: "#FF9500" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[14px] p-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: "rgba(235,235,245,0.40)" }}
                      >
                        {stat.label}
                      </span>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                    </div>
                    <p
                      className="text-[22px] font-bold text-white"
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent jobs list */}
              <div
                className="rounded-[14px] overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-[13px] font-semibold text-white">
                    Recent Jobs
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "#FF6B35" }}
                  >
                    View All →
                  </span>
                </div>
                {[
                  { job: "Pipe Fix – 12 Oak Ave", status: "In Progress", time: "2h ago", color: "#FF9500" },
                  { job: "AC Install – 5 Maple St", status: "Completed", time: "5h ago", color: "#34C759" },
                  { job: "Fence Repair – 88 Elm Rd", status: "Scheduled", time: "Tomorrow", color: "#007AFF" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 flex items-center justify-between"
                    style={{
                      borderBottom:
                        i < 2 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                    }}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-white">
                        {item.job}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "rgba(235,235,245,0.35)" }}
                      >
                        {item.time}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
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
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section
        className="py-12 px-6 md:px-12"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "3x", label: "Faster job dispatch" },
            { value: "98%", label: "Payment success rate" },
            { value: "24/7", label: "Real-time tracking" },
            { value: "0 paper", label: "Fully digital flow" },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                className="text-[2rem] font-extrabold tracking-tight"
                style={{ color: "#FF6B35" }}
              >
                {stat.value}
              </p>
              <p
                className="text-[13px] mt-1"
                style={{ color: "rgba(235,235,245,0.45)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" className="px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <Badge>Three Powerful Pillars</Badge>
            <h2
              className="mt-4 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold tracking-tight leading-tight text-white"
            >
              Everything your business needs,
              <br />
              <span style={{ color: "rgba(235,235,245,0.50)" }}>
                all in one place
              </span>
            </h2>
          </div>

          {/* 3-column grid */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* ── Pillar 1: Admin ── */}
            <GlassCard className="relative overflow-hidden group hover:border-white/15 transition-all duration-300 hover:-translate-y-1">
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,122,255,0.10) 0%, transparent 70%)",
                }}
              />
              <FeatureIcon color="#007AFF" bg="rgba(0,122,255,0.12)">
                <Shield className="w-6 h-6" />
              </FeatureIcon>
              <h3 className="text-white font-bold text-[18px] mb-2">
                Admin Dashboard
              </h3>
              <p
                className="text-[14px] leading-relaxed mb-5"
                style={{ color: "rgba(235,235,245,0.50)" }}
              >
                Full command center. Create jobs, assign handymen, track
                progress, generate invoices — all from a single screen.
              </p>
              <ul className="space-y-2">
                {[
                  "Job creation & scheduling",
                  "Team assignment & tracking",
                  "Invoice generation",
                  "Revenue analytics",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]">
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#007AFF" }}
                    />
                    <span style={{ color: "rgba(235,235,245,0.70)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <div
                className="mt-6 pt-5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Link
                  href="/signup-intent"
                  className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-200 hover:opacity-80"
                  style={{ color: "#007AFF" }}
                >
                  Talk to us
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>

            {/* ── Pillar 2: Handyman (featured / taller) ── */}
            <GlassCard
              className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 md:-mt-4 md:mb-4"
              style={{
                background: "rgba(255,107,53,0.06)",
                border: "1px solid rgba(255,107,53,0.20)",
              }}
            >
              <div
                className="absolute top-0 left-0 w-full h-1 rounded-t-[24px]"
                style={{ background: "linear-gradient(90deg, #FF6B35, #FF8C5A)" }}
              />
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)",
                }}
              />
              {/* "Most Popular" pill */}
              <div className="absolute top-5 right-5">
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                  style={{
                    background: "rgba(255,107,53,0.20)",
                    border: "1px solid rgba(255,107,53,0.35)",
                    color: "#FF6B35",
                  }}
                >
                  Core App
                </span>
              </div>
              <FeatureIcon color="#FF6B35" bg="rgba(255,107,53,0.15)">
                <Wrench className="w-6 h-6" />
              </FeatureIcon>
              <h3 className="text-white font-bold text-[18px] mb-2">
                Handyman App
              </h3>
              <p
                className="text-[14px] leading-relaxed mb-5"
                style={{ color: "rgba(235,235,245,0.50)" }}
              >
                Your crew's pocket companion. See today's jobs, navigate to
                each site, update statuses on the go, and close tickets
                instantly.
              </p>
              <ul className="space-y-2">
                {[
                  "Daily job schedule at a glance",
                  "One-tap status updates",
                  "Built-in navigation links",
                  "Push notifications",
                  "Offline-friendly design",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]">
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#FF6B35" }}
                    />
                    <span style={{ color: "rgba(235,235,245,0.70)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <div
                className="mt-6 pt-5"
                style={{ borderTop: "1px solid rgba(255,107,53,0.15)" }}
              >
                <Link
                  href="/signup-intent"
                  className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-200 hover:opacity-80"
                  style={{ color: "#FF6B35" }}
                >
                  Join the early access list
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>

            {/* ── Pillar 3: Payments ── */}
            <GlassCard className="relative overflow-hidden group hover:border-white/15 transition-all duration-300 hover:-translate-y-1">
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(52,199,89,0.10) 0%, transparent 70%)",
                }}
              />
              <FeatureIcon color="#34C759" bg="rgba(52,199,89,0.12)">
                <CreditCard className="w-6 h-6" />
              </FeatureIcon>
              <h3 className="text-white font-bold text-[18px] mb-2">
                Customer Payments
              </h3>
              <p
                className="text-[14px] leading-relaxed mb-5"
                style={{ color: "rgba(235,235,245,0.50)" }}
              >
                Send a link, get paid. Customers see a beautiful invoice and
                pay instantly — no app downloads, no friction.
              </p>
              <ul className="space-y-2">
                {[
                  "Branded payment pages",
                  "Stripe-powered checkout",
                  "Instant payment confirmation",
                  "Digital receipts",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]">
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#34C759" }}
                    />
                    <span style={{ color: "rgba(235,235,245,0.70)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <div
                className="mt-6 pt-5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Link
                  href="/signup-intent"
                  className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-200 hover:opacity-80"
                  style={{ color: "#34C759" }}
                >
                  Register your interest
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="px-6 md:px-12 py-24"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge>Simple Workflow</Badge>
            <h2
              className="mt-4 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold tracking-tight text-white"
            >
              From booking to payment
              <br />
              <span style={{ color: "rgba(235,235,245,0.45)" }}>
                in 4 simple steps
              </span>
            </h2>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px"
              style={{ background: "rgba(255,107,53,0.15)" }}
            />

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  icon: <FileText className="w-5 h-5" />,
                  title: "Create a Job",
                  desc: "Admin logs the request, adds details, and picks the best handyman.",
                },
                {
                  step: "02",
                  icon: <Bell className="w-5 h-5" />,
                  title: "Notify Handyman",
                  desc: "The assigned tech gets an instant notification on their device.",
                },
                {
                  step: "03",
                  icon: <MapPin className="w-5 h-5" />,
                  title: "Do the Job",
                  desc: "Navigate, complete the work, and update status with one tap.",
                },
                {
                  step: "04",
                  icon: <CreditCard className="w-5 h-5" />,
                  title: "Collect Payment",
                  desc: "Send the customer a payment link. Done. Money in the bank.",
                },
              ].map((item, i) => (
                <div key={i} className="text-center flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className="relative w-12 h-12 rounded-full flex items-center justify-center mb-4 z-10"
                    style={{
                      background: "linear-gradient(135deg, #FF6B35, #FF5500)",
                      boxShadow: "0 4px 20px rgba(255,107,53,0.35)",
                    }}
                  >
                    <span className="text-white">{item.icon}</span>
                    <div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: "#111113", color: "#FF6B35", border: "1px solid #FF6B35" }}
                    >
                      {item.step}
                    </div>
                  </div>
                  <h4 className="text-white font-bold text-[15px] mb-2">
                    {item.title}
                  </h4>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(235,235,245,0.45)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MINI FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.4rem)] font-extrabold tracking-tight text-white">
              Built for the field,{" "}
              <span style={{ color: "rgba(235,235,245,0.40)" }}>
                refined for the office
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <BarChart3 className="w-5 h-5" />,
                color: "#007AFF",
                title: "Live Analytics",
                desc: "Track revenue, job completion rates, and team performance in real time.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                color: "#FF9500",
                title: "Instant Dispatch",
                desc: "Assign and notify a handyman in seconds — no phone calls needed.",
              },
              {
                icon: <Phone className="w-5 h-5" />,
                color: "#FF6B35",
                title: "Mobile-First",
                desc: "Works perfectly on any phone. No app store downloads required.",
              },
              {
                icon: <Star className="w-5 h-5" />,
                color: "#FFD60A",
                title: "Customer Experience",
                desc: "Beautifully designed payment pages that make your brand shine.",
              },
              {
                icon: <Clock className="w-5 h-5" />,
                color: "#34C759",
                title: "Scheduling Made Easy",
                desc: "Calendar view of all jobs with drag-and-drop rescheduling.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                color: "#BF5AF2",
                title: "Secure & Reliable",
                desc: "Firebase-backed with Stripe payments. Enterprise-grade security.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-4 p-5 rounded-[18px] transition-all duration-200 hover:bg-white/[0.03]"
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-[14px] mb-1">
                    {f.title}
                  </h4>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(235,235,245,0.45)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING TEASER / CTA
      ══════════════════════════════════════════ */}
      <section
        id="pricing"
        className="px-6 md:px-12 py-24"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge>Simple Pricing</Badge>
            <h2
              className="mt-4 text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold tracking-tight text-white"
            >
              Start free.
              <span style={{ color: "rgba(235,235,245,0.45)" }}>
                {" "}Scale as you grow.
              </span>
            </h2>
            <p
              className="mt-3 text-[15px]"
              style={{ color: "rgba(235,235,245,0.45)" }}
            >
              No hidden fees. No per-transaction cuts. Just a flat monthly rate
              for your whole team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Starter",
                price: "Free",
                sub: "forever",
                highlight: false,
                features: [
                  "Up to 3 handymen",
                  "10 jobs / month",
                  "Basic invoicing",
                  "Customer payment page",
                ],
              },
              {
                name: "Pro",
                price: "$49",
                sub: "/ month",
                highlight: true,
                features: [
                  "Unlimited handymen",
                  "Unlimited jobs",
                  "Advanced analytics",
                  "Priority support",
                  "Custom branding",
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                sub: "talk to us",
                highlight: false,
                features: [
                  "Multi-location support",
                  "API access",
                  "Dedicated onboarding",
                  "SLA guarantee",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[24px] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight ? "md:-mt-4 md:mb-4" : ""
                }`}
                style={{
                  background: plan.highlight
                    ? "rgba(255,107,53,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: plan.highlight
                    ? "1px solid rgba(255,107,53,0.30)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: plan.highlight
                    ? "0 8px 40px rgba(255,107,53,0.15)"
                    : undefined,
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                    style={{
                      background: "linear-gradient(90deg, #FF6B35, #FF5500)",
                      color: "white",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <p
                  className="text-[13px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: plan.highlight ? "#FF6B35" : "rgba(235,235,245,0.45)" }}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[2.2rem] font-extrabold text-white tracking-tight leading-none">
                    {plan.price}
                  </span>
                  <span
                    className="text-[13px] mb-1"
                    style={{ color: "rgba(235,235,245,0.40)" }}
                  >
                    {plan.sub}
                  </span>
                </div>
                <div
                  className="my-5 h-px"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px]">
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: plan.highlight ? "#FF6B35" : "#34C759" }}
                      />
                      <span style={{ color: "rgba(235,235,245,0.65)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup-intent"
                  className="mt-6 flex items-center justify-center gap-1.5 py-3 rounded-[12px] text-[14px] font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={
                    plan.highlight
                      ? {
                          background: "linear-gradient(135deg, #FF6B35, #FF4500)",
                          color: "white",
                          boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
                        }
                      : {
                          background: "rgba(255,255,255,0.07)",
                          color: "rgba(235,235,245,0.70)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                      }
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM CTA BAND
      ══════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20">
        <div
          className="max-w-3xl mx-auto text-center rounded-[32px] py-16 px-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,85,0,0.05) 100%)",
            border: "1px solid rgba(255,107,53,0.20)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,107,53,0.15) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <div
              className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-6"
              style={{
                background: "linear-gradient(145deg, #FF7A47, #FF5500)",
                boxShadow: "0 8px 28px rgba(255,107,53,0.40)",
              }}
            >
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-extrabold tracking-tight text-white mb-3">
              Ready to transform your business?
            </h2>
            <p
              className="text-[15px] mb-8 max-w-lg mx-auto leading-relaxed"
              style={{ color: "rgba(235,235,245,0.50)" }}
            >
              Join handyman businesses already running smoother operations with
              ROSCO. Get set up in minutes.
            </p>
            <Link
              href="/signup-intent"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-[14px] text-[16px] font-bold text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #FF6B35, #FF4500)",
                boxShadow:
                  "0 8px 30px rgba(255,107,53,0.45), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        className="px-6 md:px-12 py-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #FF7A47, #FF5500)",
              }}
            >
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-white font-bold tracking-tight">ROSCO</span>
            <span
              className="text-[12px]"
              style={{ color: "rgba(235,235,245,0.30)" }}
            >
              Handyman Management
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-[13px]">
            {[
              { label: "App Home", href: "/" },
              { label: "Admin", href: "/admin" },
              { label: "Handyman", href: "/handyman" },
              { label: "Live Demo", href: "https://rosco-app-chi.vercel.app" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="transition-colors duration-200 hover:text-white"
                style={{ color: "rgba(235,235,245,0.40)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Version */}
          <p
            className="text-[11px] tracking-widest uppercase"
            style={{ color: "rgba(235,235,245,0.18)" }}
          >
            MVP v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
