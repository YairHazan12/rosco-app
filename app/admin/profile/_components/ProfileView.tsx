"use client";

import { useState } from "react";
import { Building2, User, CreditCard, Settings, Share2, Edit2 } from "lucide-react";
import type { User as UserType, Company } from "@/lib/auth-types";
import type { AppSettings } from "@/lib/types";
import SettingsForm from "./SettingsForm";
import BankDetailsForm from "./BankDetailsForm";
import JoinLinkModal from "./JoinLinkModal";
import EditProfileModal from "./EditProfileModal";

interface ProfileViewProps {
  user: UserType;
  company: Company | null;
  settings: AppSettings;
}

export default function ProfileView({ user, company, settings }: ProfileViewProps) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="space-y-5">
        {/* Page Title */}
        <div>
          <h1 className="ios-large-title pt-1">Profile</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
            {company ? "Your business & account" : "Your account"}
          </p>
        </div>

        {/* Demo Notice (if no company) */}
        {!company && (
          <div 
            className="ios-card p-4"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,107,53,0.05))",
              borderColor: "rgba(255,107,53,0.2)"
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--brand)" }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold mb-1" style={{ color: "var(--label-primary)" }}>
                  Demo Mode
                </h3>
                <p className="text-[15px] leading-relaxed" style={{ color: "var(--label-secondary)" }}>
                  You're exploring ROSCO in demo mode. To unlock full company features like team management, 
                  bank details, and custom branding, create your business account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Business Overview (only for real companies) */}
        {company && (
          <div className="ios-card">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
               style={{ color: "var(--label-tertiary)" }}>
              Business Overview
            </p>
          </div>

          <div className="px-4 pb-4 space-y-4">
            {/* Company name - large and prominent */}
            <div>
              <h2 className="text-[28px] font-bold tracking-tight leading-tight"
                  style={{ color: "var(--label-primary)" }}>
                {company.name}
              </h2>
            </div>

            {/* Company details grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Company Code */}
              <div 
                className="p-3 rounded-[10px]"
                style={{ background: "rgba(120,120,128,0.12)" }}
              >
                <p className="text-[11px] font-medium mb-1" style={{ color: "var(--label-tertiary)" }}>
                  COMPANY CODE
                </p>
                <p className="text-[15px] font-semibold font-mono" style={{ color: "var(--brand)" }}>
                  {company.companyCode}
                </p>
              </div>

              {/* Business Type */}
              {company.settings?.businessType && (
                <div 
                  className="p-3 rounded-[10px]"
                  style={{ background: "rgba(120,120,128,0.12)" }}
                >
                  <p className="text-[11px] font-medium mb-1" style={{ color: "var(--label-tertiary)" }}>
                    BUSINESS TYPE
                  </p>
                  <p className="text-[15px] font-semibold capitalize" style={{ color: "var(--label-primary)" }}>
                    {company.settings.businessType}
                  </p>
                </div>
              )}

              {/* Team Size */}
              {company.settings?.teamSize && (
                <div 
                  className="p-3 rounded-[10px]"
                  style={{ background: "rgba(120,120,128,0.12)" }}
                >
                  <p className="text-[11px] font-medium mb-1" style={{ color: "var(--label-tertiary)" }}>
                    TEAM SIZE
                  </p>
                  <p className="text-[15px] font-semibold" style={{ color: "var(--label-primary)" }}>
                    {company.settings.teamSize}
                  </p>
                </div>
              )}

              {/* Phone */}
              {company.settings?.phone && (
                <div 
                  className="p-3 rounded-[10px]"
                  style={{ background: "rgba(120,120,128,0.12)" }}
                >
                  <p className="text-[11px] font-medium mb-1" style={{ color: "var(--label-tertiary)" }}>
                    PHONE
                  </p>
                  <p className="text-[15px] font-semibold" style={{ color: "var(--label-primary)" }}>
                    {company.settings.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Join Link Button */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full flex items-center justify-center gap-2 font-semibold text-[15px] h-[44px] rounded-[10px] transition-opacity active:opacity-75"
              style={{ 
                background: "var(--brand)", 
                color: "white",
                boxShadow: "0 2px 8px rgba(255,107,53,0.25)"
              }}
            >
              <Share2 className="w-4 h-4" />
              Share Join Link
            </button>
          </div>
        </div>
        )}

        {/* Section 2: Admin Profile */}
        <div className="ios-card divide-y" style={{ borderColor: "var(--separator)" }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
               style={{ color: "var(--label-tertiary)" }}>
              Admin Profile
            </p>
          </div>

          {/* Display Name */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex-1">
              <p className="text-[13px] font-medium mb-0.5" style={{ color: "var(--label-tertiary)" }}>
                Display Name
              </p>
              <p className="text-[17px] font-semibold" style={{ color: "var(--label-primary)" }}>
                {user.displayName}
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] transition-opacity active:opacity-75"
              style={{ background: "rgba(120,120,128,0.12)" }}
            >
              <Edit2 className="w-4 h-4" style={{ color: "var(--brand)" }} />
              <span className="text-[14px] font-medium" style={{ color: "var(--brand)" }}>
                Edit
              </span>
            </button>
          </div>

          {/* Email */}
          <div className="px-4 py-3.5">
            <p className="text-[13px] font-medium mb-0.5" style={{ color: "var(--label-tertiary)" }}>
              Email
            </p>
            <p className="text-[16px]" style={{ color: "var(--label-primary)" }}>
              {user.email || "—"}
            </p>
          </div>

          {/* Role */}
          <div className="px-4 py-3.5">
            <p className="text-[13px] font-medium mb-0.5" style={{ color: "var(--label-tertiary)" }}>
              Role
            </p>
            <span 
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-semibold"
              style={{ 
                background: "rgba(0, 122, 255, 0.1)", 
                color: "var(--ios-blue)" 
              }}
            >
              Admin
            </span>
          </div>
        </div>

        {/* Section 3: Bank Details (only for real companies) */}
        {company && (
          <div className="ios-card">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
                 style={{ color: "var(--label-tertiary)" }}>
                Bank Details
              </p>
            </div>
            
            <div className="px-4 pb-4">
              <BankDetailsForm
                companyId={company.id}
                companyName={company.name}
                initialSettlementBank={company.settlementBank}
                initialAccountNumber={company.accountNumber}
                initialSubaccountCode={company.subaccountCode}
              />
            </div>
          </div>
        )}

        {/* Section 4: Settings */}
        <div className="ios-card">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
               style={{ color: "var(--label-tertiary)" }}>
              Preferences
            </p>
          </div>
          
          <div className="px-4 pb-4">
            <SettingsForm initialSettings={settings} />
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Modals */}
      {showJoinModal && company && (
        <JoinLinkModal
          companyCode={company.companyCode}
          companyName={company.name}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          userId={user.uid}
          currentDisplayName={user.displayName}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
