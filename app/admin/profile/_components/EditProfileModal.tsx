"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  userId: string;
  currentDisplayName: string;
  onClose: () => void;
}

export default function EditProfileModal({ userId, currentDisplayName, onClose }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (displayName.trim().length < 2) {
      toast.error("Display name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update");
      }

      toast.success("Profile updated!");
      // Reload to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="ios-card w-full max-w-md mx-4 mb-4 sm:mb-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--separator)" }}>
          <h3 className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-opacity active:opacity-75"
            style={{ background: "rgba(120,120,128,0.12)" }}
          >
            <X className="w-4 h-4" style={{ color: "var(--label-secondary)" }} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Display Name Input */}
          <div>
            <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--label-tertiary)" }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full text-[16px] rounded-[10px] px-3 py-2.5 border-0 outline-none"
              style={{ 
                background: "rgba(120,120,128,0.12)", 
                color: "var(--label-primary)",
              }}
              disabled={saving}
            />
            <p className="text-[12px] mt-1.5" style={{ color: "var(--label-tertiary)" }}>
              This name will be shown throughout the app
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 font-medium text-[15px] h-[44px] rounded-[10px] transition-opacity active:opacity-75 disabled:opacity-50"
              style={{ 
                background: "rgba(120,120,128,0.12)", 
                color: "var(--label-primary)" 
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || displayName.trim().length < 2}
              className="flex-1 font-semibold text-[15px] h-[44px] rounded-[10px] text-white transition-opacity active:opacity-75 disabled:opacity-50"
              style={{ 
                background: "linear-gradient(145deg, #FF7A47, #FF5500)", 
                boxShadow: "0 4px 14px rgba(255,107,53,0.30)" 
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
