"use client";

import { useEffect } from "react";
import { X, User, Phone, Mail, CheckCircle, XCircle, Briefcase } from "lucide-react";
import type { Handyman } from "@/lib/types";

interface HandymanDetailsModalProps {
  handyman: Handyman | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HandymanDetailsModal({ handyman, isOpen, onClose }: HandymanDetailsModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !handyman) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="ios-card w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          style={{
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 z-10"
            style={{
              background: "var(--bg-grouped)",
              color: "var(--label-secondary)",
            }}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>

          {/* Header */}
          <div
            className="p-6 pb-4"
            style={{
              background: "linear-gradient(145deg, var(--brand-light), #ffffff)",
              borderBottom: "1px solid var(--separator)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--brand)",
                  boxShadow: "0 4px 12px rgba(15, 156, 140, 0.25)",
                }}
              >
                <User className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="ios-large-title text-[24px] mb-1">{handyman.name}</h2>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{
                      background:
                        handyman.status === "active"
                          ? "var(--green-light)"
                          : "var(--red-light)",
                      color: handyman.status === "active" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {handyman.status === "active" ? (
                      <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
                    ) : (
                      <XCircle className="w-3 h-3" strokeWidth={2.5} />
                    )}
                    {handyman.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Contact Information */}
            <div>
              <h3
                className="text-[13px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--label-tertiary)" }}
              >
                Contact Information
              </h3>
              <div className="space-y-3">
                {/* Email */}
                {handyman.email && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--bg-grouped)" }}
                    >
                      <Mail className="w-5 h-5" style={{ color: "var(--label-secondary)" }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <p
                        className="text-[12px] font-medium mb-0.5"
                        style={{ color: "var(--label-tertiary)" }}
                      >
                        Email
                      </p>
                      <a
                        href={`mailto:${handyman.email}`}
                        className="text-[15px] break-all hover:underline"
                        style={{ color: "var(--brand)" }}
                      >
                        {handyman.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {handyman.phone && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--bg-grouped)" }}
                    >
                      <Phone className="w-5 h-5" style={{ color: "var(--label-secondary)" }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <p
                        className="text-[12px] font-medium mb-0.5"
                        style={{ color: "var(--label-tertiary)" }}
                      >
                        Phone
                      </p>
                      <a
                        href={`tel:${handyman.phone}`}
                        className="text-[15px] hover:underline"
                        style={{ color: "var(--brand)" }}
                      >
                        {handyman.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            {handyman.specialties && handyman.specialties.length > 0 && (
              <div>
                <h3
                  className="text-[13px] font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--label-tertiary)" }}
                >
                  Specialties
                </h3>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--bg-grouped)" }}
                  >
                    <Briefcase className="w-5 h-5" style={{ color: "var(--label-secondary)" }} />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2 pt-1">
                    {handyman.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium"
                        style={{
                          background: "var(--brand-light)",
                          color: "var(--brand)",
                          border: "1px solid var(--brand)",
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div>
              <h3
                className="text-[13px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--label-tertiary)" }}
              >
                Member Information
              </h3>
              <div
                className="rounded-lg p-4"
                style={{
                  background: "var(--bg-grouped)",
                  border: "1px solid var(--separator)",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[14px]" style={{ color: "var(--label-secondary)" }}>
                    Member since
                  </span>
                  <span className="text-[14px] font-semibold" style={{ color: "var(--label)" }}>
                    {new Date(handyman.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[14px]" style={{ color: "var(--label-secondary)" }}>
                    Company ID
                  </span>
                  <span
                    className="text-[12px] font-mono px-2 py-1 rounded"
                    style={{
                      color: "var(--label-tertiary)",
                      background: "white",
                      border: "1px solid var(--separator)",
                    }}
                  >
                    {handyman.companyId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="p-4 flex gap-3"
            style={{
              borderTop: "1px solid var(--separator)",
              background: "var(--bg-grouped)",
            }}
          >
            {handyman.phone && (
              <a
                href={`tel:${handyman.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
                style={{
                  background: "var(--brand)",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(15, 156, 140, 0.25)",
                }}
              >
                <Phone className="w-4 h-4" strokeWidth={2.5} />
                Call
              </a>
            )}
            {handyman.email && (
              <a
                href={`mailto:${handyman.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[15px] transition-all active:scale-[0.97]"
                style={{
                  background: "white",
                  color: "var(--brand)",
                  border: "1.5px solid var(--brand)",
                  boxShadow: "0 1px 3px rgba(15, 156, 140, 0.1)",
                }}
              >
                <Mail className="w-4 h-4" strokeWidth={2.5} />
                Email
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
