"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/handyman",      label: "Schedule", icon: CalendarDays },
  { href: "/handyman/jobs", label: "Jobs",     icon: Briefcase   },
];

export default function HandymanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Content — padded for top nav + bottom tab bar + safe areas */}
      <main
        className="max-w-[430px] mx-auto"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="px-4 pt-2">
          {children}
        </div>
      </main>

      {/* Fixed iOS-style top bar */}
      <header
        className="ios-header fixed top-0 left-0 right-0 z-30"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo mark */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--brand)" }}
            >
              <span className="text-white font-bold text-xs tracking-tight">R</span>
            </div>
            <span
              className="font-semibold text-[17px] tracking-tight"
              style={{ color: "var(--label-primary)" }}
            >
              ROSCO
            </span>
          </div>
          {/* Status dot */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--ios-green)" }} />
            <span className="text-[13px]" style={{ color: "var(--label-secondary)" }}>Active</span>
          </div>
        </div>
      </header>

      {/* iOS-style bottom tab bar */}
      <nav
        className="ios-tab-bar fixed bottom-0 left-0 right-0 z-30"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
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
                  "flex-1 flex flex-col items-center justify-center gap-[3px] py-2.5 min-h-[50px]",
                  "transition-all duration-150"
                )}
              >
                <Icon
                  className="w-[26px] h-[26px]"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "var(--brand)" : "var(--label-tertiary)" }}
                />
                <span
                  className="text-[10px] font-medium tracking-tight"
                  style={{ color: isActive ? "var(--brand)" : "var(--label-tertiary)" }}
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
