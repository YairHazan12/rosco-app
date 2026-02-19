"use client";

/**
 * Settings form — client component.
 * Receives initial settings from the Server Component parent (no fetch on mount).
 * Saves via PUT /api/settings which revalidates the "settings" cache tag.
 */

import { useState } from "react";
import { toast } from "sonner";
import type { AppSettings } from "@/lib/types";

const CURRENCIES = [
  { value: "ILS", label: "₪ ILS – Israeli Shekel" },
  { value: "USD", label: "$ USD – US Dollar" },
  { value: "EUR", label: "€ EUR – Euro" },
  { value: "GBP", label: "£ GBP – British Pound" },
] as const;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "he", label: "עברית" },
  { value: "ru", label: "Русский" },
  { value: "ar", label: "العربية" },
] as const;

const TIMEZONES = [
  "Asia/Jerusalem", "UTC",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo", "Asia/Shanghai",
  "Australia/Sydney", "Pacific/Auckland",
];

export default function SettingsForm({ initialSettings }: { initialSettings: AppSettings }) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function setNotif(key: keyof AppSettings["notifications"], val: boolean) {
    setSettings((s) => ({
      ...s,
      notifications: { ...s.notifications, [key]: val },
    }));
  }

  return (
    <div className="space-y-5">
      {/* Preferences card */}
      <div className="ios-card divide-y" style={{ borderColor: "var(--separator)" }}>
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
             style={{ color: "var(--label-tertiary)" }}>
            Regional
          </p>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[16px] font-medium" style={{ color: "var(--label-primary)" }}>Currency</p>
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Used in invoices and totals</p>
          </div>
          <select
            value={settings.currency}
            onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value as AppSettings["currency"] }))}
            className="text-[14px] font-medium rounded-[10px] px-3 py-2 border-0 outline-none"
            style={{ background: "rgba(120,120,128,0.12)", color: "var(--label-primary)", maxWidth: "160px" }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[16px] font-medium" style={{ color: "var(--label-primary)" }}>Language</p>
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>Interface language</p>
          </div>
          <select
            value={settings.language}
            onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value as AppSettings["language"] }))}
            className="text-[14px] font-medium rounded-[10px] px-3 py-2 border-0 outline-none"
            style={{ background: "rgba(120,120,128,0.12)", color: "var(--label-primary)", maxWidth: "160px" }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[16px] font-medium" style={{ color: "var(--label-primary)" }}>Timezone</p>
            <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>For scheduling and dates</p>
          </div>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
            className="text-[14px] font-medium rounded-[10px] px-3 py-2 border-0 outline-none"
            style={{ background: "rgba(120,120,128,0.12)", color: "var(--label-primary)", maxWidth: "160px" }}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications card */}
      <div className="ios-card divide-y" style={{ borderColor: "var(--separator)" }}>
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
             style={{ color: "var(--label-tertiary)" }}>
            Notifications
          </p>
        </div>

        {(
          [
            { key: "email" as const, label: "Email notifications", desc: "Job updates via email" },
            { key: "sms"   as const, label: "SMS notifications",   desc: "Text alerts to your phone" },
            { key: "push"  as const, label: "Push notifications",  desc: "Browser & app push alerts" },
          ] as const
        ).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-[16px] font-medium" style={{ color: "var(--label-primary)" }}>{label}</p>
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={settings.notifications[key]}
              onClick={() => setNotif(key, !settings.notifications[key])}
              className="relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
              style={{
                width: "51px", height: "31px",
                background: settings.notifications[key] ? "var(--brand)" : "rgba(120,120,128,0.3)",
              }}
            >
              <span
                className="inline-block rounded-full bg-white shadow-md transition-transform duration-200"
                style={{
                  width: "27px", height: "27px", marginTop: "2px",
                  transform: settings.notifications[key] ? "translateX(22px)" : "translateX(2px)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full font-semibold text-[17px] h-[50px] rounded-[14px] text-white transition-opacity active:opacity-75 disabled:opacity-60"
        style={{ background: "linear-gradient(145deg, #FF7A47, #FF5500)", boxShadow: "0 4px 14px rgba(255,107,53,0.30)" }}
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>

      <div className="h-2" />
    </div>
  );
}
