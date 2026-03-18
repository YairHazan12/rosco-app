"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BankSetupBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBankSetup() {
      try {
        // Fetch current company data from auth context
        // We need to check if subaccountCode exists
        const res = await fetch("/api/companies/current");
        if (res.ok) {
          const data = await res.json();
          const company = data.company;
          
          // Show banner if company exists but has no subaccountCode
          if (company && !company.subaccountCode) {
            setShowBanner(true);
          }
        }
      } catch (error) {
        console.error("Failed to check bank setup:", error);
      } finally {
        setLoading(false);
      }
    }

    checkBankSetup();
  }, []);

  if (loading || !showBanner) {
    return null;
  }

  return (
    <div
      className="ios-card p-4 mb-6"
      style={{ 
        background: "linear-gradient(135deg, rgba(255, 149, 0, 0.08), rgba(255, 107, 53, 0.08))",
        borderColor: "rgba(255, 149, 0, 0.2)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255, 149, 0, 0.15)" }}
        >
          <AlertCircle className="w-5 h-5" style={{ color: "var(--ios-orange)" }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-[15px] mb-1" 
            style={{ color: "var(--label-primary)" }}
          >
            Complete Your Payment Setup
          </h3>
          <p 
            className="text-[13px] leading-relaxed mb-3" 
            style={{ color: "var(--label-secondary)" }}
          >
            Add your bank details to receive <strong>95% of customer payments</strong> directly. 
            Takes less than a minute to set up.
          </p>
          
          <Link href="/admin/settings">
            <button
              className="flex items-center gap-1.5 font-semibold text-[14px] px-4 h-[36px] rounded-[10px] text-white transition-opacity active:opacity-75"
              style={{
                background: "linear-gradient(145deg, #FF7A47, #FF5500)",
                boxShadow: "0 2px 8px rgba(255,107,53,0.25)",
              }}
            >
              Set Up Now
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
