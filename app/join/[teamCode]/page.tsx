"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { findCompanyByCode, createJoinRequest } from "@/lib/auth-helpers";
import type { Company } from "@/lib/auth-types";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Download,
  Smartphone,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

type JoinState =
  | "loading"
  | "not-authenticated"
  | "invalid-code"
  | "already-in-team"
  | "needs-onboarding"
  | "joining"
  | "request-sent"
  | "error";

export default function JoinTeamPage() {
  const params = useParams();
  const router = useRouter();
  const { user, firebaseUser, loading: authLoading } = useAuth();

  const teamCode = (params.teamCode as string) || "";

  const [state, setState] = useState<JoinState>("loading");
  const [company, setCompany] = useState<Company | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPWA, setShowPWA] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Detect platform & listen for install prompt
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform("ios");
    } else if (/Android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Show PWA instructions if not in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (!isStandalone && !localStorage.getItem("rosco-pwa-prompted")) {
      setShowPWA(true);
      localStorage.setItem("rosco-pwa-prompted", "true");
    }

    // Listen for the native install prompt (Chrome/Edge/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("ROSCO installed! Check your home screen.");
        setShowInstallButton(false);
        setShowPWA(false);
      }
    } catch {
      toast.error("Install failed. Try the manual steps below.");
    } finally {
      setDeferredPrompt(null);
    }
  };

  // Main flow
  const processJoin = useCallback(async () => {
    if (authLoading) return;

    // Not authenticated → save invite and redirect to login
    if (!firebaseUser) {
      localStorage.setItem("pendingTeamInvite", teamCode);
      setState("not-authenticated");
      return;
    }

    // Authenticated but no user doc (needs onboarding)
    if (!user) {
      localStorage.setItem("pendingTeamInvite", teamCode);
      setState("needs-onboarding");
      return;
    }

    // Already in a team
    if (user.companyId && user.status === "active") {
      setState("already-in-team");
      return;
    }

    // Validate team code
    setState("loading");
    try {
      const foundCompany = await findCompanyByCode(teamCode);
      if (!foundCompany) {
        setState("invalid-code");
        return;
      }
      setCompany(foundCompany);

      // Auto-send join request
      setState("joining");
      await createJoinRequest(
        user.uid,
        user.displayName || firebaseUser.email || "Unknown",
        user.email || firebaseUser.email,
        foundCompany.id,
        foundCompany.name
      );

      setState("request-sent");
      toast.success("Join request sent!");

      // Clear any stored invite
      localStorage.removeItem("pendingTeamInvite");
    } catch (error: any) {
      console.error("Join error:", error);
      if (error.message?.includes("already")) {
        setState("request-sent");
        // They already sent a request
        const foundCompany = await findCompanyByCode(teamCode);
        if (foundCompany) setCompany(foundCompany);
      } else {
        setErrorMsg(error.message || "Something went wrong");
        setState("error");
      }
    }
  }, [authLoading, firebaseUser, user, teamCode]);

  useEffect(() => {
    processJoin();
  }, [processJoin]);

  const goToLogin = () => {
    router.push(`/login?returnUrl=/join/${teamCode}`);
  };

  const goToOnboarding = () => {
    router.push("/onboarding");
  };

  const goToHome = () => {
    router.push("/");
  };

  // ── PWA Instructions ─────────────────────────────
  const PWAInstructions = () => {
    if (!showPWA) return null;

    return (
      <div
        className="ios-card mt-6"
        style={{
          borderColor: "var(--brand)",
          borderWidth: "1.5px",
          background: "linear-gradient(145deg, var(--brand-light), #ffffff)",
        }}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--brand)" }}
            >
              <Download className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="ios-headline">Install ROSCO App</h3>
              <p
                className="text-[13px]"
                style={{ color: "var(--label-secondary)" }}
              >
                Add to your home screen for the best experience
              </p>
            </div>
          </div>

          {/* One-tap install button (Android/Chrome/Edge) */}
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-[16px] transition-all active:scale-[0.97]"
              style={{
                background: "var(--brand)",
                color: "white",
                boxShadow: "0 4px 12px rgba(15, 156, 140, 0.3)",
              }}
            >
              <Download className="w-5 h-5" strokeWidth={2.5} />
              Install ROSCO Now
            </button>
          )}

          {/* Manual instructions — always shown on iOS, shown as fallback on others */}
          {(platform === "ios" || !showInstallButton) && (
            <>
              {platform === "ios" && (
                <div
                  className="rounded-xl p-3 mb-3 text-center"
                  style={{
                    background: "var(--amber-light)",
                    border: "1px solid var(--amber)",
                  }}
                >
                  <p className="text-[13px] font-semibold" style={{ color: "#92400E" }}>
                    📱 Safari doesn't support one-tap install — follow the steps below
                  </p>
                </div>
              )}

              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "white", border: "1px solid var(--separator)" }}
              >
                {platform === "ios" && (
                  <>
                    <Step num={1} text='Tap the Share button ⬆ at the bottom of Safari' icon="↑" />
                    <Step num={2} text='Scroll down and tap "Add to Home Screen"' icon="+" />
                    <Step num={3} text='Tap "Add" in the top right corner' icon="✓" />
                  </>
                )}

                {platform === "android" && (
                  <>
                    <Step num={1} text='Tap the menu (⋮) in your browser' icon="⋮" />
                    <Step num={2} text='Tap "Install app" or "Add to Home screen"' icon="+" />
                    <Step num={3} text='Tap "Install" to confirm' icon="✓" />
                  </>
                )}

                {platform === "desktop" && (
                  <>
                    <Step num={1} text="Look for the install icon in your browser's address bar" icon="⊕" />
                    <Step num={2} text='Click "Install" when prompted' icon="+" />
                    <Step num={3} text="ROSCO will open as a standalone app" icon="✓" />
                  </>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => setShowPWA(false)}
            className="w-full mt-3 text-[13px] font-medium py-2"
            style={{ color: "var(--label-tertiary)" }}
          >
            Got it
          </button>
        </div>
      </div>
    );
  };

  // ── Loading ──────────────────────────────────────
  if (state === "loading" || (authLoading && state !== "not-authenticated")) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <Loader2
            className="w-10 h-10 mx-auto mb-4 animate-spin"
            style={{ color: "var(--brand)" }}
          />
          <p className="ios-headline">Finding your team…</p>
        </div>
      </PageWrapper>
    );
  }

  // ── Not Authenticated ────────────────────────────
  if (state === "not-authenticated") {
    return (
      <PageWrapper>
        <StatusCard
          icon={<Users className="w-8 h-8 text-white" />}
          iconBg="var(--brand)"
          title="You're Invited!"
          subtitle={`Join a team on ROSCO (Code: ${teamCode})`}
        >
          <p
            className="text-[15px] mb-6 text-center"
            style={{ color: "var(--label-secondary)" }}
          >
            Sign in or create an account to join this team.
          </p>

          <button
            onClick={goToLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-[16px] transition-all active:scale-[0.97]"
            style={{
              background: "var(--brand)",
              color: "white",
              boxShadow: "0 4px 12px rgba(15, 156, 140, 0.3)",
            }}
          >
            Sign In / Sign Up
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </StatusCard>

        <PWAInstructions />
      </PageWrapper>
    );
  }

  // ── Needs Onboarding ─────────────────────────────
  if (state === "needs-onboarding") {
    return (
      <PageWrapper>
        <StatusCard
          icon={<Users className="w-8 h-8 text-white" />}
          iconBg="var(--brand)"
          title="Almost There!"
          subtitle="Complete your profile to join the team"
        >
          <p
            className="text-[15px] mb-6 text-center"
            style={{ color: "var(--label-secondary)" }}
          >
            You need to finish setting up your account first. Your team invite
            will be waiting when you're done.
          </p>

          <button
            onClick={goToOnboarding}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-[16px] transition-all active:scale-[0.97]"
            style={{
              background: "var(--brand)",
              color: "white",
              boxShadow: "0 4px 12px rgba(15, 156, 140, 0.3)",
            }}
          >
            Complete Profile
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </StatusCard>
      </PageWrapper>
    );
  }

  // ── Invalid Code ─────────────────────────────────
  if (state === "invalid-code") {
    return (
      <PageWrapper>
        <StatusCard
          icon={<AlertCircle className="w-8 h-8 text-white" />}
          iconBg="var(--red)"
          title="Invalid Invite"
          subtitle="This team code doesn't match any company"
        >
          <p
            className="text-[15px] mb-6 text-center"
            style={{ color: "var(--label-secondary)" }}
          >
            The link may be expired or incorrect. Ask your admin to send a new
            invite link.
          </p>

          <button
            onClick={goToHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
            style={{
              background: "white",
              color: "var(--brand)",
              border: "1.5px solid var(--brand)",
            }}
          >
            Go to Home
          </button>
        </StatusCard>
      </PageWrapper>
    );
  }

  // ── Already in Team ──────────────────────────────
  if (state === "already-in-team") {
    return (
      <PageWrapper>
        <StatusCard
          icon={<Users className="w-8 h-8 text-white" />}
          iconBg="var(--amber)"
          title="Already in a Team"
          subtitle="You're already part of a team on ROSCO"
        >
          <p
            className="text-[15px] mb-6 text-center"
            style={{ color: "var(--label-secondary)" }}
          >
            You can only be part of one team at a time. To join a different team,
            contact your current admin first.
          </p>

          <button
            onClick={goToHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
            style={{
              background: "var(--brand)",
              color: "white",
              boxShadow: "0 4px 12px rgba(15, 156, 140, 0.3)",
            }}
          >
            Go to Dashboard
          </button>
        </StatusCard>
      </PageWrapper>
    );
  }

  // ── Joining (spinner) ────────────────────────────
  if (state === "joining") {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <Loader2
            className="w-10 h-10 mx-auto mb-4 animate-spin"
            style={{ color: "var(--brand)" }}
          />
          <p className="ios-headline">Sending join request…</p>
        </div>
      </PageWrapper>
    );
  }

  // ── Request Sent ─────────────────────────────────
  if (state === "request-sent") {
    return (
      <PageWrapper>
        <StatusCard
          icon={<CheckCircle2 className="w-8 h-8 text-white" />}
          iconBg="var(--green)"
          title="Request Sent!"
          subtitle={company ? `Joining ${company.name}` : "Your request is pending"}
        >
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: "var(--green-light)",
              border: "1px solid var(--green)",
            }}
          >
            <p
              className="text-[14px] text-center font-medium"
              style={{ color: "var(--green)" }}
            >
              Your admin will be notified. Once approved, you'll have full access
              to ROSCO.
            </p>
          </div>

          <button
            onClick={goToHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
            style={{
              background: "var(--brand)",
              color: "white",
              boxShadow: "0 4px 12px rgba(15, 156, 140, 0.3)",
            }}
          >
            Go to Home
          </button>
        </StatusCard>

        <PWAInstructions />
      </PageWrapper>
    );
  }

  // ── Error ────────────────────────────────────────
  return (
    <PageWrapper>
      <StatusCard
        icon={<AlertCircle className="w-8 h-8 text-white" />}
        iconBg="var(--red)"
        title="Something Went Wrong"
        subtitle={errorMsg || "An unexpected error occurred"}
      >
        <div className="flex gap-3">
          <button
            onClick={processJoin}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
            style={{
              background: "var(--brand)",
              color: "white",
            }}
          >
            Try Again
          </button>
          <button
            onClick={goToHome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
            style={{
              background: "white",
              color: "var(--label-secondary)",
              border: "1.5px solid var(--separator)",
            }}
          >
            Go Home
          </button>
        </div>
      </StatusCard>
    </PageWrapper>
  );
}

// ── Reusable Components ─────────────────────────────

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: "var(--bg-grouped)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1
            className="text-[28px] font-extrabold tracking-tight"
            style={{ color: "var(--brand)" }}
          >
            ROSCO
          </h1>
          <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
            Handyman Business Management
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

function StatusCard({
  icon,
  iconBg,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ios-card">
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background: iconBg,
              boxShadow: `0 4px 12px ${iconBg}40`,
            }}
          >
            {icon}
          </div>
          <h2 className="ios-large-title text-center">{title}</h2>
          <p
            className="text-[15px] mt-1 text-center"
            style={{ color: "var(--label-secondary)" }}
          >
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

function Step({
  num,
  text,
  icon,
}: {
  num: number;
  text: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-bold"
        style={{
          background: "var(--brand-light)",
          color: "var(--brand)",
        }}
      >
        {num}
      </div>
      <p className="text-[14px]" style={{ color: "var(--label-primary)" }}>
        {text}
      </p>
    </div>
  );
}
