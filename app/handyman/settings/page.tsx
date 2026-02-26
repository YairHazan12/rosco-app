"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { clientDb } from "@/lib/firebase";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronRight, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface HandymanSettings {
  // Availability
  offDays?: string[]; // ISO date strings

  // Work Preferences
  workHours?: {
    start: string;
    end: string;
  };
  maxJobsPerDay?: number;
  preferredAreas?: string[];

  // Notifications
  pushNotifications?: boolean;
}

export default function SettingsPage() {
  const { user, firebaseUser, signOut } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<HandymanSettings>({
    offDays: [],
    workHours: { start: "08:00", end: "17:00" },
    maxJobsPerDay: 5,
    preferredAreas: [],
    pushNotifications: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Add off day form
  const [newOffDay, setNewOffDay] = useState("");
  const [newArea, setNewArea] = useState("");

  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!firebaseUser?.uid) return;
      
      try {
        const settingsRef = doc(clientDb, "users", firebaseUser.uid, "settings", "preferences");
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as HandymanSettings;
          setSettings({
            offDays: data.offDays || [],
            workHours: data.workHours || { start: "08:00", end: "17:00" },
            maxJobsPerDay: data.maxJobsPerDay || 5,
            preferredAreas: data.preferredAreas || [],
            pushNotifications: data.pushNotifications ?? true,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [firebaseUser?.uid]);

  // Save settings to Firestore
  const saveSettings = async (updatedSettings: Partial<HandymanSettings>) => {
    if (!firebaseUser?.uid) return;
    
    setSaving(true);
    try {
      const settingsRef = doc(clientDb, "users", firebaseUser.uid, "settings", "preferences");
      await setDoc(settingsRef, { ...settings, ...updatedSettings }, { merge: true });
      setSettings((prev) => ({ ...prev, ...updatedSettings }));
      toast.success("Settings saved");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Add off day
  const addOffDay = () => {
    if (!newOffDay) return;
    const updated = [...(settings.offDays || []), newOffDay].sort();
    saveSettings({ offDays: updated });
    setNewOffDay("");
  };

  // Remove off day
  const removeOffDay = (date: string) => {
    const updated = (settings.offDays || []).filter((d) => d !== date);
    saveSettings({ offDays: updated });
  };

  // Add preferred area
  const addArea = () => {
    if (!newArea.trim()) return;
    const updated = [...(settings.preferredAreas || []), newArea.trim()];
    saveSettings({ preferredAreas: updated });
    setNewArea("");
  };

  // Remove preferred area
  const removeArea = (area: string) => {
    const updated = (settings.preferredAreas || []).filter((a) => a !== area);
    saveSettings({ preferredAreas: updated });
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

      {/* Availability Section */}
      <section className="ios-card">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Availability
          </h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--label-secondary)" }}>
            Mark dates when you're unavailable
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Add off day */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={newOffDay}
              onChange={(e) => setNewOffDay(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="flex-1"
            />
            <Button 
              onClick={addOffDay} 
              disabled={!newOffDay || saving}
              size="sm"
              style={{ background: "var(--brand)" }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Off days list */}
          {settings.offDays && settings.offDays.length > 0 ? (
            <div className="space-y-2">
              {settings.offDays.map((date) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--bg-card-alt)" }}
                >
                  <span className="text-[15px]" style={{ color: "var(--label-primary)" }}>
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => removeOffDay(date)}
                    disabled={saving}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-center py-4" style={{ color: "var(--label-tertiary)" }}>
              No off days scheduled
            </p>
          )}
        </div>
      </section>

      {/* Work Preferences Section */}
      <section className="ios-card">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Work Preferences
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Work hours */}
          <div className="space-y-2">
            <Label className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
              Preferred Work Hours
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                type="time"
                value={settings.workHours?.start || "08:00"}
                onChange={(e) =>
                  saveSettings({
                    workHours: { ...settings.workHours, start: e.target.value, end: settings.workHours?.end || "17:00" },
                  })
                }
                disabled={saving}
              />
              <span style={{ color: "var(--label-tertiary)" }}>to</span>
              <Input
                type="time"
                value={settings.workHours?.end || "17:00"}
                onChange={(e) =>
                  saveSettings({
                    workHours: { start: settings.workHours?.start || "08:00", end: e.target.value },
                  })
                }
                disabled={saving}
              />
            </div>
          </div>

          {/* Max jobs per day */}
          <div className="space-y-2">
            <Label className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
              Max Jobs Per Day
            </Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.maxJobsPerDay || 5}
              onChange={(e) => saveSettings({ maxJobsPerDay: parseInt(e.target.value) || 5 })}
              disabled={saving}
            />
          </div>

          {/* Preferred areas */}
          <div className="space-y-2">
            <Label className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
              Preferred Areas / Zones
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., Downtown, Northside"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addArea()}
                disabled={saving}
                className="flex-1"
              />
              <Button 
                onClick={addArea} 
                disabled={!newArea.trim() || saving}
                size="sm"
                style={{ background: "var(--brand)" }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {settings.preferredAreas && settings.preferredAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.preferredAreas.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px]"
                    style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                  >
                    <span>{area}</span>
                    <button
                      onClick={() => removeArea(area)}
                      disabled={saving}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            onCheckedChange={(checked) => saveSettings({ pushNotifications: checked })}
            disabled={saving}
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
