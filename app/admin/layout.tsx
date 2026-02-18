"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs",     label: "Jobs",      icon: Briefcase },
  { href: "/admin/invoices", label: "Invoices",  icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* iOS-style top bar */}
      <header
        className="ios-header fixed top-0 left-0 right-0 z-30"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--brand)" }}
            >
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span
              className="font-semibold text-[17px] tracking-tight"
              style={{ color: "var(--label-primary)" }}
            >
              ROSCO Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-[15px] min-h-[44px] flex items-center px-2 -mr-2"
            style={{ color: "var(--brand)" }}
          >
            Home
          </Link>
        </div>
      </header>

      {/* Scrollable content */}
      <main
        className="max-w-2xl mx-auto px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 70px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
        }}
      >
        {children}
      </main>

      {/* iOS tab bar */}
      <nav
        className="ios-tab-bar fixed bottom-0 left-0 right-0 z-30"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
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
