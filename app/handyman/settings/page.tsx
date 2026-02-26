"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, ChevronRight, Trash2, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OffDayRequest {
  id: string;
  date: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
}

interface HandymanSettings {
  pushNotifications?: boolean;
}

export default function SettingsPage() {
  const { user, firebaseUser, signOut } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<HandymanSettings>({
    pushNotifications: true,
  });
  
  const [offDayRequests, setOffDayRequests] = useState<OffDayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Add off day form
  const [newOffDay, setNewOffDay] = useState("");
  const [offDayReason, setOffDayReason] = useState("");

  const companyId = user?.companyId || "DEMO";

  // Load off-day requests and settings from API
  useEffect(() => {
    const loadData = async () => {
      if (!firebaseUser?.uid) return;
      
      try {
        // Load off-day requests
        const requestsResponse = await fetch(
          `/api/off-day-requests?companyId=${companyId}&handymanId=${firebaseUser.uid}`
        );
        if (requestsResponse.ok) {
          const requests = await requestsResponse.json();
          setOffDayRequests(requests);
        } else {
          console.error("Failed to load off-day requests");
          toast.error("Failed to load off-day requests");
        }

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
  }, [firebaseUser?.uid, companyId]);

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

  // Submit off-day request
  const submitOffDayRequest = async () => {
    if (!newOffDay || !firebaseUser?.uid) return;
    
    setSubmitting(true);
    try {
      const response = await fetch("/api/off-day-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handymanId: firebaseUser.uid,
          handymanName: user?.displayName || firebaseUser.displayName || "Unknown",
          date: newOffDay,
          reason: offDayReason.trim() || undefined,
          companyId,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      const newRequest = await response.json();
      setOffDayRequests(prev => [newRequest, ...prev]);
      setNewOffDay("");
      setOffDayReason("");
      toast.success("Off-day request submitted");
    } catch (error) {
      console.error("Error submitting off-day request:", error);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel pending request
  const cancelRequest = async (requestId: string) => {
    if (!confirm("Cancel this off-day request?")) return;
    
    try {
      const response = await fetch(`/api/off-day-requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel request");

      setOffDayRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success("Request cancelled");
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error("Failed to cancel request");
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "var(--ios-green)";
      case "rejected": return "var(--ios-red)";
      default: return "var(--ios-orange)";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-5 h-5" />;
      case "rejected": return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
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

      {/* Off-Day Requests Section */}
      <section className="ios-card">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Off-Day Requests
          </h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--label-secondary)" }}>
            Request time off — admin will review and approve
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Request form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                Date
              </Label>
              <Input
                type="date"
                value={newOffDay}
                onChange={(e) => setNewOffDay(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                Reason (optional)
              </Label>
              <Textarea
                value={offDayReason}
                onChange={(e) => setOffDayReason(e.target.value)}
                placeholder="e.g., Family event, medical appointment..."
                disabled={submitting}
                rows={2}
              />
            </div>
            <Button 
              onClick={submitOffDayRequest} 
              disabled={!newOffDay || submitting}
              className="w-full"
              style={{ background: "var(--brand)" }}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>

          {/* Requests list */}
          {offDayRequests.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="text-[13px] font-medium" style={{ color: "var(--label-secondary)" }}>
                Your Requests
              </div>
              {offDayRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 rounded-xl"
                  style={{ background: "var(--bg-card-alt)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-[15px] font-medium" style={{ color: "var(--label-primary)" }}>
                        {new Date(request.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      {request.reason && (
                        <div className="text-[13px] mt-1" style={{ color: "var(--label-secondary)" }}>
                          {request.reason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex items-center gap-1 text-[13px] font-medium"
                        style={{ color: getStatusColor(request.status) }}
                      >
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status}</span>
                      </div>
                      {request.status === "pending" && (
                        <button
                          onClick={() => cancelRequest(request.id)}
                          className="text-red-500 hover:text-red-600 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--label-tertiary)" }}>
                    Requested {new Date(request.requestedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-center py-4" style={{ color: "var(--label-tertiary)" }}>
              No off-day requests yet
            </p>
          )}
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
