"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, List, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/handyman", label: "Schedule", icon: Calendar },
  { href: "/handyman/jobs", label: "All Jobs", icon: List },
];

export default function HandymanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top header */}
      <header className="bg-orange-600 text-white sticky top-0 z-20 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-white/80" />
            <span className="font-bold text-lg">ROSCO</span>
          </div>
          <Link href="/" className="text-orange-200 text-sm active:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      {/* Content — extra padding so nothing hides behind bottom nav */}
      <main className="max-w-lg mx-auto px-4 pt-5 pb-28">
        {children}
      </main>

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto flex">
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
