"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top header */}
      <header className="bg-slate-900 text-white sticky top-0 z-20 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-lg">ROSCO Admin</span>
          </div>
          <Link href="/" className="text-slate-400 text-sm active:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      {/* Scrollable content — extra bottom padding so content clears the nav */}
      <main className="max-w-2xl mx-auto px-4 pt-5 pb-28">
        {children}
      </main>

      {/* Fixed bottom nav — same style as handyman */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                  isActive ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
