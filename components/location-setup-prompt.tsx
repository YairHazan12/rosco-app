"use client";

import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { updateUserPreferences } from "@/lib/auth-helpers";
import {
  detectLocationPreferences,
  getDefaultPreferences,
  isGeolocationAvailable,
} from "@/lib/location-utils";
import { toast } from "sonner";

const STORAGE_KEY = "rosco-location-setup-decision";
const DELAY_MS = 3000; // 3 seconds after page load

function hasDecided(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function saveDecision(value: "completed" | "dismissed") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
}

/**
 * This component shows a location permission prompt after login
 * for users who don't have preferences set yet.
 * It only shows once (decision is persisted in localStorage).
 */
export default function LocationSetupPrompt() {
  const { user, firebaseUser, refreshUser } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip if:
    // - Not logged in
    // - User already has preferences
    // - Already decided
    // - Geolocation not available
    // - Onboarding not complete
    if (
      !firebaseUser ||
      !user?.onboardingComplete ||
      user?.preferences ||
      hasDecided() ||
      !isGeolocationAvailable()
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [firebaseUser, user]);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const prefs = await detectLocationPreferences(true);
      
      if (firebaseUser) {
        await updateUserPreferences(firebaseUser.uid, {
          timezone: prefs.timezone,
          language: prefs.language,
          currency: prefs.currency,
          countryCode: prefs.countryCode,
        });
        await refreshUser();
        toast.success("Preferences updated automatically!");
      }
      
      saveDecision("completed");
      setVisible(false);
    } catch (error) {
      console.error("Location detection failed:", error);
      
      // Use defaults on failure
      if (firebaseUser) {
        const defaults = getDefaultPreferences();
        await updateUserPreferences(firebaseUser.uid, {
          timezone: defaults.timezone,
          language: defaults.language,
          currency: defaults.currency,
        });
        await refreshUser();
      }
      
      toast.info("Using default preferences. You can change them in settings.");
      saveDecision("completed");
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    saveDecision("dismissed");
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(calc(100vw - 32px), 400px)",
        zIndex: 51,
        pointerEvents: "none",
        animation: "fade-up 0.35s ease forwards",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          background: "var(--bg-card)",
          borderRadius: "20px",
          padding: "16px 18px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10)",
          border: "0.5px solid var(--separator)",
        }}
      >
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,122,255,0.12)" }}
          >
            <MapPin className="w-5 h-5" style={{ color: "#007AFF" }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[15px] font-semibold leading-tight"
              style={{ color: "var(--label-primary)" }}
            >
              Set your preferences
            </p>
            <p
              className="text-[13px] mt-1 leading-snug"
              style={{ color: "var(--label-secondary)" }}
            >
              Allow location to set timezone, language & currency
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            disabled={loading}
            aria-label="Dismiss"
            className="flex-shrink-0 p-1 rounded-lg"
            style={{ color: "var(--label-tertiary)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex-1 h-10 rounded-xl font-semibold text-[15px] text-white disabled:opacity-60"
            style={{
              background: "#007AFF",
              boxShadow: "0 4px 12px rgba(0,122,255,0.35)",
            }}
          >
            {loading ? "Detecting..." : "Allow"}
          </button>
          <button
            onClick={handleDismiss}
            disabled={loading}
            className="h-10 px-4 rounded-xl font-medium text-[15px]"
            style={{
              background: "rgba(120,120,128,0.12)",
              color: "var(--label-primary)",
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
