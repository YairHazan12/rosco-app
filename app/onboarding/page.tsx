"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  completeAdminOnboarding,
  searchCompaniesByName,
  findCompanyByCode,
  createJoinRequest,
  completeHandymanOnboarding,
} from "@/lib/auth-helpers";
import type { OnboardingData, Company, UserPreferences } from "@/lib/auth-types";
import { toast } from "sonner";
import LocationPermissionPrompt from "@/components/location-permission-prompt";
import {
  detectLocationPreferences,
  getDefaultPreferences,
  isGeolocationAvailable,
  type LocationPreferences,
} from "@/lib/location-utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, firebaseUser, loading: authLoading, refreshUser } = useAuth();
  
  const [step, setStep] = useState<"role" | "location" | "form">("role");
  const [role, setRole] = useState<"admin" | "handyman" | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Location preferences (detected or defaults)
  const [detectedPreferences, setDetectedPreferences] = useState<LocationPreferences | null>(null);
  const [locationDetecting, setLocationDetecting] = useState(false);
  
  // Admin fields
  const [adminFullName, setAdminFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState<"plumbing" | "electrical" | "general" | "other">("general");
  const [teamSize, setTeamSize] = useState("1-5");
  
  // Bank details for Paystack subaccount
  const [settlementBank, setSettlementBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  
  // Handyman fields
  const [fullName, setFullName] = useState("");
  const [handymanPhone, setHandymanPhone] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [searchMethod, setSearchMethod] = useState<"name" | "code">("name");
  const [companySearch, setCompanySearch] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!firebaseUser) {
        router.push("/login");
      } else if (user?.onboardingComplete) {
        router.push("/");
      }
    }
  }, [user, firebaseUser, authLoading, router]);

  // Search companies as user types
  useEffect(() => {
    if (searchMethod === "name" && companySearch.length >= 2) {
      const timer = setTimeout(async () => {
        const results = await searchCompaniesByName(companySearch);
        setSearchResults(results);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [companySearch, searchMethod]);

  // Check for pending team invite
  const [pendingInvite, setPendingInvite] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pending = localStorage.getItem("pendingTeamInvite");
      if (pending) {
        setPendingInvite(pending);
        // Auto-select handyman role if there's a pending invite
        setRole("handyman");
        setStep("location"); // Go to location step first
        // Pre-fill the code
        setSearchMethod("code");
        setCompanyCode(pending);
      }
    }
  }, []);
  
  // Auto-fill account holder name when company name changes
  useEffect(() => {
    if (companyName) {
      setAccountHolderName(companyName);
    }
  }, [companyName]);
  
  // Fetch available banks from Paystack when admin role is selected
  useEffect(() => {
    if (role === "admin") {
      fetch("/api/paystack/subaccounts")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.banks) {
            setBanks(data.banks);
          } else {
            // Fallback to hardcoded major SA banks if API fails
            setBanks([
              { name: "ABSA Bank", code: "632005" },
              { name: "Standard Bank", code: "051001" },
              { name: "First National Bank (FNB)", code: "250655" },
              { name: "Nedbank", code: "198765" },
              { name: "Capitec Bank", code: "470010" },
            ]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch banks:", err);
          // Fallback to hardcoded major SA banks
          setBanks([
            { name: "ABSA Bank", code: "632005" },
            { name: "Standard Bank", code: "051001" },
            { name: "First National Bank (FNB)", code: "250655" },
            { name: "Nedbank", code: "198765" },
            { name: "Capitec Bank", code: "470010" },
          ]);
        });
    }
  }, [role]);

  const handleRoleSelect = (selectedRole: "admin" | "handyman") => {
    setRole(selectedRole);
    // Check if geolocation is available
    if (isGeolocationAvailable()) {
      setStep("location");
    } else {
      // Skip location step if not available, use defaults
      setDetectedPreferences(getDefaultPreferences());
      setStep("form");
    }
  };

  const handleLocationAllow = async () => {
    setLocationDetecting(true);
    try {
      const prefs = await detectLocationPreferences(true);
      setDetectedPreferences(prefs);
      toast.success("Preferences detected automatically!");
      setStep("form");
    } catch (error) {
      console.error("Location detection failed:", error);
      setDetectedPreferences(getDefaultPreferences());
      toast.info("Using default preferences. You can change them in settings.");
      setStep("form");
    } finally {
      setLocationDetecting(false);
    }
  };

  const handleLocationSkip = () => {
    setDetectedPreferences(getDefaultPreferences());
    setStep("form");
  };

  // Convert detected preferences to UserPreferences type for storage
  const getUserPreferences = (): UserPreferences | undefined => {
    if (!detectedPreferences) return undefined;
    
    return {
      timezone: detectedPreferences.timezone,
      language: detectedPreferences.language as UserPreferences["language"],
      currency: detectedPreferences.currency as UserPreferences["currency"],
      countryCode: detectedPreferences.countryCode,
    };
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    // Client-side validation
    if (adminFullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }
    
    if (companyName.trim().length < 2) {
      toast.error("Company name must be at least 2 characters");
      return;
    }
    
    // Validate bank details - if one is provided, both must be provided
    if ((settlementBank && !accountNumber) || (!settlementBank && accountNumber)) {
      toast.error("Please provide both bank name and account number, or leave both empty");
      return;
    }
    
    if (accountNumber && accountNumber.length < 8) {
      toast.error("Account number must be at least 8 digits");
      return;
    }
    
    setLoading(true);
    try {
      const data: OnboardingData = {
        role: "admin",
        fullName: adminFullName,
        companyName,
        phone,
        businessType,
        teamSize,
        preferences: getUserPreferences(),
      };
      
      // Include bank details if provided (for Paystack subaccount)
      if (settlementBank && accountNumber) {
        data.settlementBank = settlementBank;
        data.accountNumber = accountNumber;
      }
      
      const company = await completeAdminOnboarding(firebaseUser.uid, firebaseUser.email, data);
      await refreshUser();
      
      // Show success message with additional info about bank setup
      if (company.subaccountCode) {
        toast.success(`Company created! Bank account linked for payments. Invite code: ${company.companyCode}`);
      } else if (settlementBank && accountNumber) {
        toast.success(`Company created! (Bank setup pending - you can configure it later). Invite code: ${company.companyCode}`);
      } else {
        toast.success(`Company created! Your invite code: ${company.companyCode}`);
      }
      
      router.push("/admin");
    } catch (error: any) {
      console.error("Admin onboarding error:", error);
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleHandymanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    // Client-side validation
    if (fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }
    
    setLoading(true);
    try {
      let company: Company | null = selectedCompany;
      
      // If using code, find company first
      if (searchMethod === "code" && companyCode) {
        company = await findCompanyByCode(companyCode);
        if (!company) {
          toast.error("Invalid company code");
          setLoading(false);
          return;
        }
      }
      
      if (!company) {
        toast.error("Please select a company");
        setLoading(false);
        return;
      }
      
      // Create join request with preferences
      await createJoinRequest(
        firebaseUser.uid,
        fullName,
        firebaseUser.email,
        company.id,
        company.name,
        getUserPreferences()
      );
      
      // Clear pending invite if any
      localStorage.removeItem("pendingTeamInvite");
      
      await refreshUser();
      toast.success("Join request sent! Waiting for admin approval.");
      router.push("/pending");
    } catch (error: any) {
      console.error("Handyman onboarding error:", error);
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const specialtyOptions = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Tiling",
    "HVAC",
    "General Maintenance",
  ];

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  if (authLoading || !firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ROSCO</h1>
          <p className="text-gray-600">Let's set up your account</p>
        </div>

        {step === "role" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose your role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect("admin")}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">👔</div>
                <h3 className="font-semibold text-gray-900 mb-1">Company Admin</h3>
                <p className="text-sm text-gray-600">
                  Create your company, manage jobs, and invite team members
                </p>
              </button>

              <button
                onClick={() => handleRoleSelect("handyman")}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold text-gray-900 mb-1">Handyman</h3>
                <p className="text-sm text-gray-600">
                  Join a company and manage your assigned jobs
                </p>
              </button>
            </div>
          </div>
        )}

        {step === "location" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              onClick={() => setStep("role")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back to role selection
            </button>

            <LocationPermissionPrompt
              inline
              onAllow={handleLocationAllow}
              onSkip={handleLocationSkip}
            />
            
            {locationDetecting && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Detecting your location...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "form" && role === "admin" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              onClick={() => setStep("location")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
            
            {/* Show detected preferences summary */}
            {detectedPreferences && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-2">📍 Detected preferences</p>
                <div className="flex flex-wrap gap-3 text-xs text-blue-700">
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    🌍 {detectedPreferences.timezone}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    💬 {detectedPreferences.language.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    💰 {detectedPreferences.currency}
                  </span>
                  {detectedPreferences.countryCode && (
                    <span className="px-2 py-1 bg-blue-100 rounded-full">
                      🏳️ {detectedPreferences.countryCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  You can change these anytime in Settings
                </p>
              </div>
            )}
            
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                <p className="text-xs text-gray-500 mt-1">Your personal name (not company name)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ROSCO Services Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+972-50-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="general">General Handyman</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <select
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1-5">1-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="11-20">11-20 people</option>
                  <option value="20+">20+ people</option>
                </select>
              </div>

              {/* Bank Details Section */}
              <div className="border-t pt-4 mt-2">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Bank Details (Optional)
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Provide your bank details to receive 95% of customer payments directly. 
                    ROSCO keeps 5% as a platform fee. You can add this later in settings.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                      <span className="ml-1 text-xs text-gray-500 font-normal">
                        (for payment splits)
                      </span>
                    </label>
                    <select
                      value={settlementBank}
                      onChange={(e) => setSettlementBank(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={banks.length === 0}
                    >
                      <option value="">
                        {banks.length === 0 ? "Loading banks..." : "Select your bank..."}
                      </option>
                      {banks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Choose the bank where you want to receive payments
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, "");
                        setAccountNumber(value);
                      }}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="1234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your business bank account number (numbers only)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Company name or business owner"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ℹ️ Auto-filled with company name - should match your bank records
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating company..." : "Create Company"}
              </button>
            </form>
          </div>
        )}

        {step === "form" && role === "handyman" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              onClick={() => setStep("location")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">Handyman Profile</h2>
            
            {/* Show detected preferences summary */}
            {detectedPreferences && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-2">📍 Detected preferences</p>
                <div className="flex flex-wrap gap-3 text-xs text-blue-700">
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    🌍 {detectedPreferences.timezone}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    💬 {detectedPreferences.language.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    💰 {detectedPreferences.currency}
                  </span>
                  {detectedPreferences.countryCode && (
                    <span className="px-2 py-1 bg-blue-100 rounded-full">
                      🏳️ {detectedPreferences.countryCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  You can change these anytime in Settings
                </p>
              </div>
            )}
            
            <form onSubmit={handleHandymanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 2 characters required</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={handymanPhone}
                  onChange={(e) => setHandymanPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+972-50-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        specialties.includes(specialty)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Find Your Company
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setSearchMethod("name")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      searchMethod === "name"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Search by Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchMethod("code")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      searchMethod === "code"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Enter Code
                  </button>
                </div>

                {searchMethod === "name" ? (
                  <div>
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        setSelectedCompany(null);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type company name..."
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                        {searchResults.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => {
                              setSelectedCompany(company);
                              setCompanySearch(company.name);
                              setSearchResults([]);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{company.name}</div>
                            <div className="text-sm text-gray-500">Code: {company.companyCode}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCompany && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-900">
                          ✓ Selected: <strong>{selectedCompany.name}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ROSCO-A1B2"
                    required={searchMethod === "code"}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (searchMethod === "name" && !selectedCompany)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending request..." : "Request to Join"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
