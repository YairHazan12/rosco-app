"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  User,
  BarChart3,
  Settings,
  Edit2,
  Star,
  Briefcase,
  DollarSign,
  Bell,
  LogOut,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import EditProfileModal from "./_components/EditProfileModal";

interface HandymanSettings {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  currency?: string;
  language?: string;
  timezone?: string;
}

export default function HandymanProfilePage() {
  const { user, firebaseUser, signOut } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<HandymanSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    currency: "ILS",
    language: "en",
    timezone: "Asia/Jerusalem",
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load settings
  useEffect(() => {
    const load = async () => {
      if (!firebaseUser?.uid) return;
      try {
        const res = await fetch(
          `/api/handyman-settings?handymanId=${firebaseUser.uid}`
        );
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch {
        // silently continue with defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [firebaseUser?.uid]);

  const saveSettings = async (newSettings: HandymanSettings) => {
    if (!firebaseUser?.uid) return;
    setSavingSettings(true);
    try {
      const res = await fetch(
        `/api/handyman-settings?handymanId=${firebaseUser.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        }
      );
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggle = (key: keyof HandymanSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleSelectChange = (key: keyof HandymanSettings, value: string) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  const displayName =
    user?.displayName || firebaseUser?.displayName || "Handyman";
  const email = user?.email || firebaseUser?.email || "—";

  return (
    <>
      <div className="space-y-5 pb-4">
        {/* Page Title */}
        <div className="pt-1">
          <h1 className="ios-large-title">Profile</h1>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--label-tertiary)" }}
          >
            Your account &amp; preferences
          </p>
        </div>

        {/* ─── Section 1: Personal Profile ─── */}
        <div className="ios-card divide-y" style={{ borderColor: "var(--separator)" }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.6px]"
              style={{ color: "var(--label-tertiary)" }}
            >
              Personal Profile
            </p>
          </div>

          {/* Display Name */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex-1">
              <p
                className="text-[13px] font-medium mb-0.5"
                style={{ color: "var(--label-tertiary)" }}
              >
                Display Name
              </p>
              <p
                className="text-[17px] font-semibold"
                style={{ color: "var(--label-primary)" }}
              >
                {displayName}
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] transition-opacity active:opacity-75"
              style={{ background: "rgba(120,120,128,0.12)" }}
            >
              <Edit2 className="w-4 h-4" style={{ color: "var(--brand)" }} />
              <span
                className="text-[14px] font-medium"
                style={{ color: "var(--brand)" }}
              >
                Edit
              </span>
            </button>
          </div>

          {/* Email */}
          <div className="px-4 py-3.5">
            <p
              className="text-[13px] font-medium mb-0.5"
              style={{ color: "var(--label-tertiary)" }}
            >
              Email
            </p>
            <p className="text-[16px]" style={{ color: "var(--label-primary)" }}>
              {email}
            </p>
          </div>

          {/* Role Badge */}
          <div className="px-4 py-3.5">
            <p
              className="text-[13px] font-medium mb-1"
              style={{ color: "var(--label-tertiary)" }}
            >
              Role
            </p>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-semibold"
              style={{
                background: "rgba(255,107,53,0.12)",
                color: "var(--brand)",
              }}
            >
              Handyman
            </span>
          </div>
        </div>

        {/* ─── Section 2: Performance Stats ─── */}
        <div className="ios-card">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.6px]"
              style={{ color: "var(--label-tertiary)" }}
            >
              Performance This Month
            </p>
          </div>

          <div className="px-4 pb-4 grid grid-cols-3 gap-3">
            {/* Jobs Completed */}
            <div
              className="p-3 rounded-[10px] flex flex-col items-center gap-1"
              style={{ background: "rgba(120,120,128,0.12)" }}
            >
              <Briefcase
                className="w-5 h-5"
                style={{ color: "var(--brand)" }}
              />
              <p
                className="text-[22px] font-bold leading-tight"
                style={{ color: "var(--label-primary)" }}
              >
                —
              </p>
              <p
                className="text-[10px] font-medium text-center leading-tight"
                style={{ color: "var(--label-tertiary)" }}
              >
                Jobs Done
              </p>
            </div>

            {/* Average Rating */}
            <div
              className="p-3 rounded-[10px] flex flex-col items-center gap-1"
              style={{ background: "rgba(120,120,128,0.12)" }}
            >
              <Star
                className="w-5 h-5"
                style={{ color: "var(--brand)" }}
              />
              <p
                className="text-[22px] font-bold leading-tight"
                style={{ color: "var(--label-primary)" }}
              >
                —
              </p>
              <p
                className="text-[10px] font-medium text-center leading-tight"
                style={{ color: "var(--label-tertiary)" }}
              >
                Avg Rating
              </p>
            </div>

            {/* Total Earnings */}
            <div
              className="p-3 rounded-[10px] flex flex-col items-center gap-1"
              style={{ background: "rgba(120,120,128,0.12)" }}
            >
              <DollarSign
                className="w-5 h-5"
                style={{ color: "var(--brand)" }}
              />
              <p
                className="text-[22px] font-bold leading-tight"
                style={{ color: "var(--label-primary)" }}
              >
                —
              </p>
              <p
                className="text-[10px] font-medium text-center leading-tight"
                style={{ color: "var(--label-tertiary)" }}
              >
                Earnings
              </p>
            </div>
          </div>
        </div>

        {/* ─── Section 3: Preferences ─── */}
        <div className="ios-card">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.6px]"
              style={{ color: "var(--label-tertiary)" }}
            >
              Preferences
            </p>
          </div>

          {/* Regional */}
          <div
            className="px-4 pb-2 pt-1 border-b"
            style={{ borderColor: "var(--separator)" }}
          >
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.5px] mb-2"
              style={{ color: "var(--label-quaternary)" }}
            >
              Regional
            </p>
            <div className="space-y-3">
              {/* Currency */}
              <div className="flex items-center justify-between">
                <p className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                  Currency
                </p>
                <select
                  value={settings.currency ?? "ILS"}
                  onChange={(e) => handleSelectChange("currency", e.target.value)}
                  disabled={savingSettings}
                  className="text-[14px] rounded-[8px] px-2 py-1 border-0 outline-none"
                  style={{
                    background: "rgba(120,120,128,0.12)",
                    color: "var(--label-primary)",
                  }}
                >
                  <option value="ILS">₪ ILS</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <p className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                  Language
                </p>
                <select
                  value={settings.language ?? "en"}
                  onChange={(e) => handleSelectChange("language", e.target.value)}
                  disabled={savingSettings}
                  className="text-[14px] rounded-[8px] px-2 py-1 border-0 outline-none"
                  style={{
                    background: "rgba(120,120,128,0.12)",
                    color: "var(--label-primary)",
                  }}
                >
                  <option value="en">English</option>
                  <option value="he">Hebrew</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="flex items-center justify-between">
                <p className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                  Timezone
                </p>
                <select
                  value={settings.timezone ?? "Asia/Jerusalem"}
                  onChange={(e) => handleSelectChange("timezone", e.target.value)}
                  disabled={savingSettings}
                  className="text-[14px] rounded-[8px] px-2 py-1 border-0 outline-none"
                  style={{
                    background: "rgba(120,120,128,0.12)",
                    color: "var(--label-primary)",
                  }}
                >
                  <option value="Asia/Jerusalem">Jerusalem (UTC+2)</option>
                  <option value="Europe/London">London (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                  <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                  <option value="Europe/Berlin">Berlin (UTC+1)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Bell className="w-3.5 h-3.5" style={{ color: "var(--label-quaternary)" }} />
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.5px]"
                style={{ color: "var(--label-quaternary)" }}
              >
                Notifications
              </p>
            </div>
            <div className="space-y-3">
              {/* Push */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                    Push Notifications
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: "var(--label-tertiary)" }}
                  >
                    New jobs &amp; status updates
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications ?? true}
                  onCheckedChange={(v) => handleToggle("pushNotifications", v)}
                  disabled={savingSettings}
                />
              </div>

              {/* Email */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                    Email Notifications
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: "var(--label-tertiary)" }}
                  >
                    Job summaries &amp; reminders
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications ?? true}
                  onCheckedChange={(v) => handleToggle("emailNotifications", v)}
                  disabled={savingSettings}
                />
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                    SMS Notifications
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: "var(--label-tertiary)" }}
                  >
                    Urgent alerts only
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications ?? false}
                  onCheckedChange={(v) => handleToggle("smsNotifications", v)}
                  disabled={savingSettings}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sign Out ─── */}
        <div className="ios-card">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3.5 flex items-center gap-3 transition-opacity active:opacity-75"
          >
            <LogOut className="w-5 h-5" style={{ color: "var(--ios-red)" }} />
            <span className="text-[17px]" style={{ color: "var(--ios-red)" }}>
              Log Out
            </span>
          </button>
        </div>

        <div className="h-2" />
      </div>

      {showEditModal && firebaseUser && (
        <EditProfileModal
          userId={firebaseUser.uid}
          currentDisplayName={displayName}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
