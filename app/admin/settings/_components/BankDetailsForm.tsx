"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Bank {
  name: string;
  code: string;
}

interface BankDetailsFormProps {
  companyId: string;
  companyName: string;
  initialSettlementBank?: string;
  initialAccountNumber?: string;
  initialSubaccountCode?: string;
}

export default function BankDetailsForm({
  companyId,
  companyName,
  initialSettlementBank,
  initialAccountNumber,
  initialSubaccountCode,
}: BankDetailsFormProps) {
  const [settlementBank, setSettlementBank] = useState(initialSettlementBank || "");
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber || "");
  const [accountHolderName, setAccountHolderName] = useState(companyName);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Check if already configured
  const isConfigured = !!initialSubaccountCode;

  // Fetch banks on mount
  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/paystack/subaccounts");
        const data = await res.json();
        
        if (data.success && data.banks) {
          setBanks(data.banks);
        } else {
          // Fallback to hardcoded SA banks
          setBanks([
            { name: "ABSA Bank", code: "632005" },
            { name: "Standard Bank", code: "051001" },
            { name: "First National Bank (FNB)", code: "250655" },
            { name: "Nedbank", code: "198765" },
            { name: "Capitec Bank", code: "470010" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        // Fallback
        setBanks([
          { name: "ABSA Bank", code: "632005" },
          { name: "Standard Bank", code: "051001" },
          { name: "First National Bank (FNB)", code: "250655" },
          { name: "Nedbank", code: "198765" },
          { name: "Capitec Bank", code: "470010" },
        ]);
      } finally {
        setLoadingBanks(false);
      }
    }

    fetchBanks();
  }, []);

  async function handleSave() {
    // Validation
    if (!settlementBank) {
      toast.error("Please select a bank");
      return;
    }

    if (!accountNumber) {
      toast.error("Please enter your account number");
      return;
    }

    if (accountNumber.length < 8) {
      toast.error("Account number must be at least 8 digits");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settlementBank,
          accountNumber,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save");
      }

      const result = await res.json();
      
      if (result.success && result.data.subaccountCode) {
        toast.success("Bank details saved! Payment split configured.");
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        toast.error("Bank details saved, but subaccount creation pending.");
      }
    } catch (error: any) {
      console.error("Failed to save bank details:", error);
      toast.error(error.message || "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  }

  if (isConfigured) {
    return (
      <div className="ios-card">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
             style={{ color: "var(--label-tertiary)" }}>
            Bank Details
          </p>
        </div>

        <div className="px-4 pb-4">
          <div 
            className="p-4 rounded-[12px] flex items-start gap-3"
            style={{ background: "rgba(52, 199, 89, 0.08)" }}
          >
            <CheckCircle2 
              className="w-5 h-5 flex-shrink-0 mt-0.5" 
              style={{ color: "var(--ios-green)" }} 
            />
            <div>
              <p className="font-semibold text-[15px] mb-1" style={{ color: "var(--label-primary)" }}>
                Payment Setup Complete
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--label-secondary)" }}>
                Your bank account is linked. You'll receive 95% of customer payments directly, 
                ROSCO keeps 5% as platform fee.
              </p>
              {initialSettlementBank && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(52, 199, 89, 0.2)" }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--label-tertiary)" }}>
                    CONFIGURED ACCOUNT
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                    Bank: {banks.find(b => b.code === initialSettlementBank)?.name || initialSettlementBank}
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                    Account: •••• {initialAccountNumber?.slice(-4) || "****"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ios-card">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.6px]"
           style={{ color: "var(--label-tertiary)" }}>
          Bank Details
        </p>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Info banner */}
        <div 
          className="p-4 rounded-[12px] flex items-start gap-3"
          style={{ background: "rgba(255, 149, 0, 0.08)" }}
        >
          <AlertCircle 
            className="w-5 h-5 flex-shrink-0 mt-0.5" 
            style={{ color: "var(--ios-orange)" }} 
          />
          <div>
            <p className="font-semibold text-[14px] mb-1" style={{ color: "var(--label-primary)" }}>
              Set Up Payment Split
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--label-secondary)" }}>
              Add your bank details to receive <strong>95% of customer payments</strong> directly. 
              ROSCO keeps 5% as a platform fee.
            </p>
          </div>
        </div>

        {/* Bank selection */}
        <div>
          <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--label-secondary)" }}>
            Bank Name *
          </label>
          <select
            value={settlementBank}
            onChange={(e) => setSettlementBank(e.target.value)}
            disabled={loadingBanks || saving}
            className="w-full text-[16px] rounded-[10px] px-3 py-2.5 border-0 outline-none"
            style={{ 
              background: "rgba(120,120,128,0.12)", 
              color: "var(--label-primary)",
            }}
          >
            <option value="">
              {loadingBanks ? "Loading banks..." : "Select your bank..."}
            </option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account number */}
        <div>
          <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--label-secondary)" }}>
            Account Number *
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setAccountNumber(value);
            }}
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={15}
            placeholder="1234567890"
            disabled={saving}
            className="w-full text-[16px] rounded-[10px] px-3 py-2.5 border-0 outline-none"
            style={{ 
              background: "rgba(120,120,128,0.12)", 
              color: "var(--label-primary)",
            }}
          />
          <p className="text-[12px] mt-1.5" style={{ color: "var(--label-tertiary)" }}>
            Enter your business bank account number (numbers only)
          </p>
        </div>

        {/* Account holder name (read-only, pre-filled) */}
        <div>
          <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--label-secondary)" }}>
            Account Holder Name
          </label>
          <input
            type="text"
            value={accountHolderName}
            readOnly
            disabled
            className="w-full text-[16px] rounded-[10px] px-3 py-2.5 border-0 outline-none"
            style={{ 
              background: "rgba(120,120,128,0.08)", 
              color: "var(--label-tertiary)",
            }}
          />
          <p className="text-[12px] mt-1.5" style={{ color: "var(--label-tertiary)" }}>
            ℹ️ Pre-filled with your company name - should match bank records
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !settlementBank || !accountNumber}
          className="w-full font-semibold text-[17px] h-[50px] rounded-[14px] text-white transition-opacity active:opacity-75 disabled:opacity-50"
          style={{ 
            background: "linear-gradient(145deg, #FF7A47, #FF5500)", 
            boxShadow: "0 4px 14px rgba(255,107,53,0.30)" 
          }}
        >
          {saving ? "Saving..." : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}
