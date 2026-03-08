"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  Auth,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { clientDb } from "./firebase";
import type { User } from "./auth-types";
import { COMPANY_ID_COOKIE_NAME, USER_UID_COOKIE_NAME, USER_ROLE_COOKIE_NAME } from "./auth-constants";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshUserWithRetry: (maxRetries?: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  // Initialize auth only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuth(getAuth());
    }
  }, []);

  // Helper to set auth cookies (companyId, uid, role)
  const setAuthCookies = (userData: User | null) => {
    if (typeof window === "undefined") return;
    
    if (userData?.companyId) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      const expStr = expires.toUTCString();
      document.cookie = `${COMPANY_ID_COOKIE_NAME}=${userData.companyId}; path=/; expires=${expStr}; SameSite=Lax`;
      document.cookie = `${USER_UID_COOKIE_NAME}=${userData.uid}; path=/; expires=${expStr}; SameSite=Lax`;
      document.cookie = `${USER_ROLE_COOKIE_NAME}=${userData.role}; path=/; expires=${expStr}; SameSite=Lax`;
    } else {
      // Clear all auth cookies on sign out
      document.cookie = `${COMPANY_ID_COOKIE_NAME}=DEMO; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${USER_UID_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${USER_ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  };

  // Legacy alias
  const setCompanyIdCookie = (companyId: string | null) => {
    if (!companyId) {
      setAuthCookies(null);
    }
    // When called with just companyId (no full user), handled by setAuthCookies via user data
  };

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<User | null> => {
    if (!clientDb) {
      console.warn("⚠️ Firestore not initialized, cannot fetch user data");
      return null;
    }
    
    try {
      const userDoc = await getDoc(doc(clientDb, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error: any) {
      // Handle offline errors gracefully
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.error("❌ Firestore offline - cannot fetch user data:", error.message);
        // Return null and rely on cached data or retry
        return null;
      }
      
      console.error("❌ Error fetching user data:", error);
      return null;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await fetchUserData(firebaseUser.uid);
      setUser(userData);
      
      // Update all auth cookies when user data changes (e.g., after onboarding)
      setAuthCookies(userData);
    }
  };
  
  // Refresh user data with retry logic
  const refreshUserWithRetry = async (maxRetries = 3): Promise<boolean> => {
    if (!firebaseUser) return false;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const userData = await fetchUserData(firebaseUser.uid);
      if (userData) {
        setUser(userData);
        setAuthCookies(userData);
        return true;
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retry ${attempt}/${maxRetries} - waiting 1s before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.error(`❌ Failed to fetch user data after ${maxRetries} attempts`);
    return false;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        const userData = await fetchUserData(fbUser.uid);
        setUser(userData);
        setAuthCookies(userData);
      } else {
        setUser(null);
        setAuthCookies(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch user data once immediately after sign in
    // onAuthStateChanged will also trigger and handle any edge cases
    const uid = credential.user.uid;
    const userData = await fetchUserData(uid);
    
    if (userData) {
      setUser(userData);
      setAuthCookies(userData);
    }
  };

  const signUp = async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) throw new Error("Auth not initialized");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    if (!auth) throw new Error("Auth not initialized");
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  };

  const signOut = async () => {
    if (!auth) throw new Error("Auth not initialized");
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshUser,
    refreshUserWithRetry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
