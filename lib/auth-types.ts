export interface UserPreferences {
  timezone: string;
  language: "en" | "he" | "ru" | "ar";
  currency: "ZAR" | "USD" | "EUR" | "GBP" | "ILS";
  countryCode?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string; // Required: user's full name (minimum 2 characters)
  role: "admin" | "handyman";
  companyId: string | null;
  onboardingComplete: boolean;
  status: "active" | "pending" | "inactive";
  preferences?: UserPreferences; // Location-based preferences
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  companyNameLower: string;
  companyCode: string; // e.g., "ROSCO-A1B2"
  adminUid: string;
  settings?: {
    businessType?: "plumbing" | "electrical" | "general" | "other";
    phone?: string;
    teamSize?: string;
  };
  // South Africa — billing & compliance
  vatNumber?: string;            // SARS VAT registration number (e.g., "4123456789")
  registrationNumber?: string;   // CIPC company registration number (e.g., "2023/123456/07")
  address?: string;              // Full business address
  email?: string;                // Business email address
  phone?: string;                // Business phone number
  // Banking details for EFT (shown on invoices)
  bankName?: string;             // e.g., "FNB", "Standard Bank", "ABSA", "Nedbank", "Capitec"
  accountHolder?: string;        // Account holder name
  branchCode?: string;           // 6-digit SA branch code (e.g., "250655" for FNB)
  accountType?: string;          // e.g., "Cheque", "Savings"
  // Paystack subaccount fields (for platform revenue split)
  settlementBank?: string;       // Bank code for Paystack (e.g., "044")
  accountNumber?: string;        // Company bank account number
  subaccountCode?: string;       // Paystack subaccount code (ACCT_xxx)
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  handymanUid: string;
  handymanName: string;
  handymanEmail: string;
  companyId: string;
  companyName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  role: "admin" | "handyman";
  // Common fields
  fullName: string; // Required for both admin and handyman (minimum 2 characters)
  // Location-based preferences (detected automatically)
  preferences?: UserPreferences;
  // Admin fields
  companyName?: string;
  phone?: string;
  businessType?: "plumbing" | "electrical" | "general" | "other";
  teamSize?: string;
  // Bank details for Paystack subaccount (optional during signup, can be added later)
  settlementBank?: string;
  accountNumber?: string;
  // Handyman fields
  specialties?: string[];
  companySearch?: string;
  companyCode?: string;
}
