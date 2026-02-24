"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CalendarDays, Briefcase, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import PWAPrompt from "@/components/pwa-prompt";
import NotificationPrompt from "@/components/notification-prompt";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/handyman",      label: "Schedule", icon: CalendarDays },
  { href: "/handyman/jobs", label: "Jobs",     icon: Briefcase   },
];

export default function HandymanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, firebaseUser, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        router.push("/login");
      } else if (!user?.onboardingComplete) {
        router.push("/onboarding");
      } else if (user.status === "pending") {
        router.push("/pending");
      } else if (user.role !== "handyman") {
        router.push("/admin");
      }
    }
  }, [user, firebaseUser, loading, router]);

  if (loading || !user || user.role !== "handyman") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Content — padded for top nav + bottom tab bar + safe areas */}
      <main
        className="max-w-[430px] mx-auto"
        style={{
          paddingTop:    "calc(env(safe-area-inset-top, 0px) + 58px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)",
          paddingLeft:   "env(safe-area-inset-left, 0px)",
          paddingRight:  "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="px-4 pt-2">{children}</div>
      </main>

      {/* Fixed iOS-style frosted top bar */}
      <header
        className="ios-header fixed top-0 left-0 right-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo + brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #0F9C8C, #0D8578)",
                boxShadow: "0 2px 6px rgba(15, 156, 140, 0.3)",
              }}
            >
              <span className="text-white font-bold text-[13px] tracking-tight">R</span>
            </div>
            <span
              className="font-semibold text-[17px] tracking-[-0.3px]"
              style={{ color: "var(--label-primary)" }}
            >
              ROSCO
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 px-2 py-1 text-[13px] font-medium"
            style={{ color: "var(--ios-red)" }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* PWA + Notification prompts */}
      <PWAPrompt />
      <NotificationPrompt />

      {/* iOS-style frosted bottom tab bar */}
      <nav
        className="ios-tab-bar fixed bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-[430px] mx-auto flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/handyman"
                ? pathname === "/handyman"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-[3px] py-2 min-h-[50px]",
                  "transition-all duration-150"
                )}
              >
                <Icon
                  className="w-[26px] h-[26px]"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{
                    color: isActive ? "var(--brand)" : "var(--label-quaternary)",
                  }}
                />
                <span
                  className="text-[10px] font-semibold tracking-[0.2px]"
                  style={{
                    color: isActive ? "var(--brand)" : "var(--label-quaternary)",
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
