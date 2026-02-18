"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

const STORAGE_KEY = "rosco-notifications-decision";
const DELAY_MS = 4000; // 4 seconds after page load

function hasDecided(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function saveDecision(value: "granted" | "denied" | "dismissed") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
}

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip if: notifications not supported, already decided, or already granted
    if (
      typeof Notification === "undefined" ||
      Notification.permission === "granted" ||
      Notification.permission === "denied" ||
      hasDecided()
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setVisible(false);
    try {
      const permission = await Notification.requestPermission();
      saveDecision(permission === "granted" ? "granted" : "denied");
    } catch {
      saveDecision("denied");
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
        // Sits just above the PWA prompt area (or bottom tab bar), slightly higher
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 158px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(calc(100vw - 32px), 398px)",
        zIndex: 51,
        animation: "fade-up 0.35s ease forwards",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "18px",
          padding: "14px 16px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          border: "0.5px solid var(--separator)",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        {/* Bell icon */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "rgba(0,122,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bell style={{ width: 22, height: 22, color: "#007AFF" }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--label-primary)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Enable Notifications
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--label-secondary)",
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            Get notified about new jobs and updates
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleAllow}
            style={{
              background: "#007AFF",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "6px 14px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Allow
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--label-tertiary)",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
