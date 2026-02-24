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
    }
  };
  
  // Refresh user data with retry logic
  const refreshUserWithRetry = async (maxRetries = 3): Promise<boolean> => {
    if (!firebaseUser) return false;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const userData = await fetchUserData(firebaseUser.uid);
      if (userData) {
        setUser(userData);
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
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    
    // Wait for user document to be fetched
    const uid = credential.user.uid;
    const startTime = Date.now();
    let userData = null;
    
    while (!userData && Date.now() - startTime < 5000) {
      userData = await fetchUserData(uid);
      if (!userData) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    if (userData) {
      setUser(userData);
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
