"use client";

import { doc, setDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { clientDb } from "./firebase";
import type { User, Company, JoinRequest, OnboardingData } from "./auth-types";

// Generate a short company code (e.g., "ROSCO-A1B2")
function generateCompanyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous chars
  const random = Array.from({ length: 4 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `ROSCO-${random}`;
}

// Create a new user document after signup
export async function createUserDocument(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<void> {
  const userRef = doc(clientDb, "users", uid);
  const userData: User = {
    uid,
    email,
    displayName,
    role: "handyman", // Default, will be set during onboarding
    companyId: null,
    onboardingComplete: false,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await setDoc(userRef, userData);
}

// Complete admin onboarding
export async function completeAdminOnboarding(
  uid: string,
  email: string | null,
  data: OnboardingData
): Promise<Company> {
  // Create company
  const companyRef = doc(collection(clientDb, "companies"));
  const company: Company = {
    id: companyRef.id,
    name: data.companyName!,
    companyNameLower: data.companyName!.toLowerCase(),
    companyCode: generateCompanyCode(),
    adminUid: uid,
    settings: {
      businessType: data.businessType,
      phone: data.phone,
      teamSize: data.teamSize,
    },
    createdAt: new Date().toISOString(),
  };
  
  await setDoc(companyRef, company);

  // Update user
  const userRef = doc(clientDb, "users", uid);
  await updateDoc(userRef, {
    role: "admin",
    companyId: companyRef.id,
    displayName: data.companyName,
    onboardingComplete: true,
    status: "active",
    updatedAt: new Date().toISOString(),
  });

  return company;
}

// Search companies by name
export async function searchCompaniesByName(searchTerm: string): Promise<Company[]> {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const lower = searchTerm.toLowerCase();
  const companiesRef = collection(clientDb, "companies");
  
  // Firestore doesn't support case-insensitive search, so we use companyNameLower
  // and filter locally for contains
  const q = query(companiesRef);
  const snapshot = await getDocs(q);
  
  const companies: Company[] = [];
  snapshot.forEach((doc) => {
    const company = { id: doc.id, ...doc.data() } as Company;
    if (company.companyNameLower.includes(lower)) {
      companies.push(company);
    }
  });
  
  return companies.slice(0, 10); // Limit to 10 results
}

// Find company by code
export async function findCompanyByCode(code: string): Promise<Company | null> {
  const companiesRef = collection(clientDb, "companies");
  const q = query(companiesRef, where("companyCode", "==", code.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Company;
}

// Create join request
export async function createJoinRequest(
  uid: string,
  name: string,
  email: string | null,
  companyId: string,
  companyName: string
): Promise<JoinRequest> {
  const requestRef = doc(collection(clientDb, "joinRequests"));
  const request: JoinRequest = {
    id: requestRef.id,
    handymanUid: uid,
    handymanName: name,
    handymanEmail: email || "",
    companyId,
    companyName,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await setDoc(requestRef, request);
  
  // Update user to mark as pending
  const userRef = doc(clientDb, "users", uid);
  await updateDoc(userRef, {
    onboardingComplete: true,
    status: "pending",
    updatedAt: new Date().toISOString(),
  });
  
  return request;
}

// Complete handyman onboarding (direct join via code or after approval)
export async function completeHandymanOnboarding(
  uid: string,
  data: OnboardingData,
  companyId: string
): Promise<void> {
  const userRef = doc(clientDb, "users", uid);
  await updateDoc(userRef, {
    role: "handyman",
    companyId,
    displayName: data.fullName,
    onboardingComplete: true,
    status: "active",
    updatedAt: new Date().toISOString(),
  });
}

// Get pending join requests for a company
export async function getPendingJoinRequests(companyId: string): Promise<JoinRequest[]> {
  const requestsRef = collection(clientDb, "joinRequests");
  const q = query(
    requestsRef,
    where("companyId", "==", companyId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  
  const requests: JoinRequest[] = [];
  snapshot.forEach((doc) => {
    requests.push({ id: doc.id, ...doc.data() } as JoinRequest);
  });
  
  return requests;
}

// Approve join request
export async function approveJoinRequest(requestId: string): Promise<void> {
  const requestRef = doc(clientDb, "joinRequests", requestId);
  const requestSnap = await getDocs(query(collection(clientDb, "joinRequests"), where("__name__", "==", requestId)));
  
  if (requestSnap.empty) throw new Error("Request not found");
  
  const request = requestSnap.docs[0].data() as JoinRequest;
  
  // Update request status
  await updateDoc(requestRef, {
    status: "approved",
    updatedAt: new Date().toISOString(),
  });
  
  // Update user to active and assign company
  const userRef = doc(clientDb, "users", request.handymanUid);
  await updateDoc(userRef, {
    companyId: request.companyId,
    status: "active",
    updatedAt: new Date().toISOString(),
  });
}

// Reject join request
export async function rejectJoinRequest(requestId: string): Promise<void> {
  const requestRef = doc(clientDb, "joinRequests", requestId);
  
  await updateDoc(requestRef, {
    status: "rejected",
    updatedAt: new Date().toISOString(),
  });
}
