"use client";

import { useState } from "react";
import { X, Copy, QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface JoinLinkModalProps {
  companyCode: string;
  companyName: string;
  onClose: () => void;
}

export default function JoinLinkModal({ companyCode, companyName, onClose }: JoinLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const joinUrl = `${window.location.origin}/onboarding?code=${companyCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(companyCode);
      setCopied(true);
      toast.success("Company code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Join link copied!");
    } catch {
      toast.error("Failed to copy");
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
            Invite Team Members
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
          {/* Instructions */}
          <p className="text-[15px]" style={{ color: "var(--label-secondary)" }}>
            Share this company code or join link with handymen to let them join <strong>{companyName}</strong>.
          </p>

          {/* Company Code */}
          <div>
            <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--label-tertiary)" }}>
              Company Code
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="flex-1 p-3 rounded-[10px] font-mono text-[18px] font-bold text-center"
                style={{ 
                  background: "rgba(120,120,128,0.12)", 
                  color: "var(--brand)" 
                }}
              >
                {companyCode}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-3 rounded-[10px] transition-opacity active:opacity-75"
                style={{ background: "rgba(120,120,128,0.12)" }}
              >
                {copied ? (
                  <Check className="w-5 h-5" style={{ color: "var(--ios-green)" }} />
                ) : (
                  <Copy className="w-5 h-5" style={{ color: "var(--label-primary)" }} />
                )}
              </button>
            </div>
          </div>

          {/* Join Link */}
          <div>
            <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--label-tertiary)" }}>
              Join Link
            </label>
            <div 
              className="p-3 rounded-[10px] text-[13px] break-all"
              style={{ background: "rgba(120,120,128,0.12)", color: "var(--label-secondary)" }}
            >
              {joinUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full mt-2 flex items-center justify-center gap-2 font-medium text-[15px] h-[44px] rounded-[10px] transition-opacity active:opacity-75"
              style={{ 
                background: "var(--brand)", 
                color: "white" 
              }}
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>

          {/* QR Code Toggle */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-2 font-medium text-[15px] h-[44px] rounded-[10px] transition-opacity active:opacity-75"
            style={{ 
              background: "rgba(120,120,128,0.12)", 
              color: "var(--label-primary)" 
            }}
          >
            <QrCode className="w-4 h-4" />
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </button>

          {/* QR Code */}
          {showQR && (
            <div className="flex justify-center p-4 rounded-[12px]" style={{ background: "white" }}>
              <QRCode value={joinUrl} size={200} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
