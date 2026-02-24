"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const isDemoUser = firebaseUser?.email?.startsWith("demo-");
      if (!firebaseUser) {
        router.push("/login");
      } else if (!user?.onboardingComplete && !isDemoUser) {
        router.push("/onboarding");
      } else if (user?.status === "pending") {
        router.push("/pending");
      } else if (user?.role !== "admin") {
        router.push("/handyman");
      }
    }
  }, [user, firebaseUser, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
