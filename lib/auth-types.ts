export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "admin" | "handyman";
  companyId: string | null;
  onboardingComplete: boolean;
  status: "active" | "pending" | "inactive";
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
  // Admin fields
  companyName?: string;
  phone?: string;
  businessType?: "plumbing" | "electrical" | "general" | "other";
  teamSize?: string;
  // Handyman fields
  fullName?: string;
  specialties?: string[];
  companySearch?: string;
  companyCode?: string;
}
