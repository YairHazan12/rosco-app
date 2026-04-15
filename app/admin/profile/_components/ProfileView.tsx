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
          <div className="ios-card p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(240,112,40,0.10)" }}
              >
                <Building2 className="w-5 h-5" style={{ color: "#F07028" }} />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold mb-1" style={{ color: "var(--label-primary)" }}>
                  Demo Mode
                </h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--label-secondary)" }}>
                  You&apos;re exploring ROSCO in demo mode. Create your business account to unlock team
                  management, bank details, and custom branding.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Business Overview (only for real companies) */}
        {company && (
          <div
            className="rounded-[16px] overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #FFFFFF 0%, #F0F8F2 100%)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
              <p
                className="text-[10px] font-semibold uppercase"
                style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
              >
                Business Overview
              </p>
            </div>

            <div className="px-4 pb-4 space-y-4">
              {/* Company name */}
              <h2
                className="text-[24px] font-bold tracking-tight leading-tight"
                style={{ color: "var(--label-primary)" }}
              >
                {company.name}
              </h2>

              {/* Company details grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Company Code */}
                <div className="p-3 rounded-[10px]" style={{ background: "#F5F8F6" }}>
                  <p
                    className="text-[10px] font-semibold uppercase mb-1"
                    style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
                  >
                    Company Code
                  </p>
                  <p
                    className="text-[15px] font-bold"
                    style={{
                      color: "#3CC864",
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {company.companyCode}
                  </p>
                </div>

                {/* Business Type */}
                {company.settings?.businessType && (
                  <div className="p-3 rounded-[10px]" style={{ background: "#F5F8F6" }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
                    >
                      Business Type
                    </p>
                    <p
                      className="text-[14px] font-semibold capitalize"
                      style={{ color: "var(--label-primary)" }}
                    >
                      {company.settings.businessType}
                    </p>
                  </div>
                )}

                {/* Team Size */}
                {company.settings?.teamSize && (
                  <div className="p-3 rounded-[10px]" style={{ background: "#F5F8F6" }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
                    >
                      Team Size
                    </p>
                    <p className="text-[14px] font-semibold" style={{ color: "var(--label-primary)" }}>
                      {company.settings.teamSize}
                    </p>
                  </div>
                )}

                {/* Phone */}
                {company.settings?.phone && (
                  <div className="p-3 rounded-[10px]" style={{ background: "#F5F8F6" }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
                    >
                      Phone
                    </p>
                    <p className="text-[14px] font-semibold" style={{ color: "var(--label-primary)" }}>
                      {company.settings.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Share Join Link — secondary green button */}
              <button
                onClick={() => setShowJoinModal(true)}
                className="w-full flex items-center justify-center gap-2 font-semibold text-[15px] h-[48px] rounded-[12px] transition-all active:scale-[0.98] active:opacity-90"
                style={{
                  background: "rgba(60,200,100,0.08)",
                  border: "1.5px solid rgba(60,200,100,0.25)",
                  color: "#2BA84A",
                }}
              >
                <Share2 className="w-4 h-4" strokeWidth={1.75} />
                Share Join Link
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Admin Profile */}
        <div className="ios-card divide-y" style={{ borderColor: "var(--separator)" }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
            <p
              className="text-[10px] font-semibold uppercase"
              style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
            >
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
              <p
                className="text-[10px] font-semibold uppercase"
                style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
              >
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
            <p
              className="text-[10px] font-semibold uppercase"
              style={{ color: "var(--label-tertiary)", letterSpacing: "0.08em" }}
            >
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
