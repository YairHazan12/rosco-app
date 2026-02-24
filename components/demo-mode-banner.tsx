"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export function DemoModeBanner() {
  const { user, firebaseUser } = useAuth();

  // Show banner if not authenticated OR if using demo account
  const isDemoUser = firebaseUser?.email?.includes("demo-") || user?.companyId === "DEMO";
  const showBanner = !firebaseUser || isDemoUser;

  if (!showBanner) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">👁️</span>
          <span className="font-medium">Demo Mode</span>
          <span className="hidden sm:inline text-blue-100">
            {isDemoUser
              ? "— You're viewing sample data with a demo account."
              : "— You're viewing sample data. Sign in to access your company's data."}
          </span>
        </div>
        {!firebaseUser && (
          <Link
            href="/login"
            className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
