"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs",      label: "Jobs",      icon: Briefcase },
  { href: "/admin/invoices",  label: "Invoices",  icon: FileText },
  { href: "/admin/settings",  label: "Settings",  icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* iOS-style frosted top bar */}
      <header
        className="ios-header fixed top-0 left-0 right-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo + brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #FF7A47, #FF5500)",
                boxShadow: "0 2px 6px rgba(255,107,53,0.35)",
              }}
            >
              <span className="text-white font-bold text-[13px] tracking-tight">R</span>
            </div>
            <span
              className="font-semibold text-[17px] tracking-[-0.3px]"
              style={{ color: "var(--label-primary)" }}
            >
              Admin
            </span>
          </div>

          {/* Home link */}
          <Link
            href="/"
            className="text-[15px] font-medium min-h-[44px] flex items-center px-2 -mr-2"
            style={{ color: "var(--brand)" }}
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Scrollable content */}
      <main
        className="max-w-2xl mx-auto px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
        }}
      >
        {children}
      </main>

      {/* iOS-style frosted tab bar */}
      <nav
        className="ios-tab-bar fixed bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
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
