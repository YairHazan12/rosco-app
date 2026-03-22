"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CalendarDays, Briefcase, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import PWAPrompt from "@/components/pwa-prompt";
// notification prompt removed - was blocking mobile UI
import { useAuth } from "@/lib/auth-context";
import LocationSetupPrompt from "@/components/location-setup-prompt";

const navItems = [
  { href: "/handyman",         label: "Schedule", icon: CalendarDays },
  { href: "/handyman/jobs",    label: "Jobs",     icon: Briefcase   },
  { href: "/handyman/profile", label: "Profile",  icon: UserCircle  },
];

export default function HandymanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, firebaseUser, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && firebaseUser) {
      if (!user) {
        // Firestore doc not loaded yet — wait (don't redirect immediately)
        // This prevents redirect loops during initial load
        return;
      }
      
      const isDemoUser = firebaseUser.email?.startsWith("demo-");
      
      if (!user.onboardingComplete && !isDemoUser) {
        router.push("/onboarding");
      } else if (user.status === "pending") {
        router.push("/pending");
      } else if (user.role !== "handyman") {
        router.push("/admin");
      }
    } else if (!loading && !firebaseUser) {
      // Only redirect to login if we're sure there's no user
      router.push("/login");
    }
  }, [user, firebaseUser, loading, router]);

  if (loading || !user || user?.role !== "handyman") {
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
            {/* AppLogo.png: app icon/avatar for header navigation */}
            <Image src="/AppLogo.png" alt="ROSCO" width={34} height={34} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </header>

      {/* PWA prompt */}
      <PWAPrompt />

      {/* Location setup prompt for users without preferences */}
      <LocationSetupPrompt />

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
                : pathname?.startsWith(href);

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
