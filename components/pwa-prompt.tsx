"use client";

import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";

// BeforeInstallPromptEvent is not in standard TS lib
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "rosco-pwa-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari: navigator.standalone is a proprietary boolean
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

export default function PWAPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (isInStandaloneMode() || wasDismissedRecently()) return;

    const ios = isIOS();
    setIsIOSDevice(ios);

    if (ios) {
      // iOS Safari doesn't fire beforeinstallprompt, show custom banner
      setVisible(true);
      return;
    }

    // Android / Chrome / Edge: listen for the install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)", // above tab bar
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(calc(100vw - 32px), 398px)",
        zIndex: 50,
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
        {/* App icon */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-1px",
            }}
          >
            R
          </span>
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
            Add ROSCO to Home Screen
          </p>
          {isIOSDevice ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--label-secondary)",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              Tap{" "}
              <Share
                style={{ display: "inline", width: 14, height: 14, flexShrink: 0 }}
              />{" "}
              then{" "}
              <strong style={{ fontWeight: 600 }}>
                &ldquo;Add to Home Screen&rdquo;
              </strong>
            </p>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: "var(--label-secondary)",
                marginTop: 4,
              }}
            >
              Get the best experience as an app
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {!isIOSDevice && deferredPrompt && (
            <button
              onClick={install}
              style={{
                background: "var(--brand)",
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
              Install
            </button>
          )}
          <button
            onClick={dismiss}
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
