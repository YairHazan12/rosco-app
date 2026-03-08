"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface HandymanSettings {
  pushNotifications?: boolean;
}

export default function SettingsPage() {
  const { user, firebaseUser, signOut } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<HandymanSettings>({
    pushNotifications: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const companyId = user?.companyId || "DEMO";

  // Load settings from API
  useEffect(() => {
    const loadData = async () => {
      if (!firebaseUser?.uid) return;
      
      try {
        // Load settings
        const settingsResponse = await fetch(
          `/api/handyman-settings?handymanId=${firebaseUser.uid}`
        );
        if (settingsResponse.ok) {
          const loadedSettings = await settingsResponse.json();
          setSettings(loadedSettings);
        } else {
          console.error("Failed to load settings");
          // Continue with default settings
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [firebaseUser?.uid]);

  // Save settings to API
  const saveSettings = async (newSettings: HandymanSettings) => {
    if (!firebaseUser?.uid) return;
    
    setSavingSettings(true);
    try {
      const response = await fetch(
        `/api/handyman-settings?handymanId=${firebaseUser.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Settings saved");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle settings change
  const handleSettingsChange = (key: keyof HandymanSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="ios-large-title">Settings</h1>
      </div>

      {/* Profile Section */}
      <section className="ios-card">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Profile
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--separator)" }}>
          <div className="px-4 py-3">
            <div className="text-[13px] font-medium mb-1" style={{ color: "var(--label-secondary)" }}>
              Name
            </div>
            <div className="text-[17px]" style={{ color: "var(--label-primary)" }}>
              {user?.displayName || firebaseUser?.displayName || "Not set"}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[13px] font-medium mb-1" style={{ color: "var(--label-secondary)" }}>
              Email
            </div>
            <div className="text-[17px]" style={{ color: "var(--label-primary)" }}>
              {user?.email || firebaseUser?.email || "Not set"}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[13px] font-medium mb-1" style={{ color: "var(--label-secondary)" }}>
              Role
            </div>
            <div className="text-[17px] capitalize" style={{ color: "var(--label-primary)" }}>
              {user?.role || "Not set"}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="ios-card">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Notifications
          </h2>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[15px]" style={{ color: "var(--label-primary)" }}>
              Push Notifications
            </div>
            <div className="text-[13px] mt-0.5" style={{ color: "var(--label-secondary)" }}>
              Receive alerts for new jobs and updates
            </div>
          </div>
          <Switch
            checked={settings.pushNotifications ?? true}
            onCheckedChange={(checked) => handleSettingsChange("pushNotifications", checked)}
            disabled={savingSettings}
          />
        </div>
      </section>

      {/* Account Section */}
      <section className="ios-card">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Account
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--separator)" }}>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" style={{ color: "var(--ios-red)" }} />
              <span className="text-[17px]" style={{ color: "var(--ios-red)" }}>
                Log Out
              </span>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "var(--label-quaternary)" }} />
          </button>
          <div className="px-4 py-3">
            <div className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
              App Version
            </div>
            <div className="text-[15px] mt-1" style={{ color: "var(--label-secondary)" }}>
              1.0.0
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
