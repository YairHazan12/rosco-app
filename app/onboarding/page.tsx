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
import type { OnboardingData, Company } from "@/lib/auth-types";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, firebaseUser, loading: authLoading, refreshUser } = useAuth();
  
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<"admin" | "handyman" | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Admin fields
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState<"plumbing" | "electrical" | "general" | "other">("general");
  const [teamSize, setTeamSize] = useState("1-5");
  
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

  const handleRoleSelect = (selectedRole: "admin" | "handyman") => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      const data: OnboardingData = {
        role: "admin",
        companyName,
        phone,
        businessType,
        teamSize,
      };
      
      const company = await completeAdminOnboarding(firebaseUser.uid, firebaseUser.email, data);
      await refreshUser();
      toast.success(`Company created! Your invite code: ${company.companyCode}`);
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
      
      // Create join request
      await createJoinRequest(
        firebaseUser.uid,
        fullName,
        firebaseUser.email,
        company.id,
        company.name
      );
      
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

        {step === "form" && role === "admin" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              onClick={() => setStep("role")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back to role selection
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
            
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
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
              onClick={() => setStep("role")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back to role selection
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">Handyman Profile</h2>
            
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
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
