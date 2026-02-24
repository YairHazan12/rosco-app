# ROSCO App - System Audit Report
**Date:** 2025-02-24
**Auditor:** Jarvis (AI Assistant)
**App URL:** https://rosco-app-chi.vercel.app

---

## Executive Summary

This audit identified and fixed critical authentication race conditions causing Demo mode sign-in failures, and uncovered significant system design issues related to multi-tenancy, API security, and authentication architecture.

**Immediate Fix Status:** ✅ Demo mode sign-in errors resolved and deployed
**Critical Issues Found:** 6 major system design problems requiring attention

---

## 1. Demo Mode Sign-In Issue (FIXED ✅)

### What Was Broken

The demo mode sign-in flow had multiple race conditions and timing issues:

1. **Race Condition in Auth Flow**
   - `signIn()` function returned immediately after Firebase authentication
   - Navigation to `/admin` or `/handyman` happened before Firestore user document loaded
   - Auth context's `onAuthStateChanged` fired asynchronously but state wasn't ready
   
2. **Redirect Loops in Layouts**
   - Admin/Handyman layouts checked `if (!user)` immediately
   - During initial load, `user` was null while data was being fetched
   - Layouts redirected to `/login`, creating infinite loops
   
3. **Insufficient Wait Times**
   - Demo page used arbitrary 500ms timeout
   - Not enough time for auth state propagation + Firestore fetch
   - Manual `refreshUser()` call didn't guarantee data availability

### The Fix

**File: `lib/auth-context.tsx`**
```typescript
// Modified signIn to wait for user document before resolving
const signIn = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  
  // Wait up to 5 seconds for Firestore user doc to load
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
```

**File: `app/admin/layout.tsx` & `app/handyman/layout.tsx`**
```typescript
// Improved layout guards to prevent redirect loops
useEffect(() => {
  if (!loading && firebaseUser) {
    if (!user) {
      // Wait for Firestore doc to load - don't redirect immediately
      return;
    }
    
    const isDemoUser = firebaseUser.email?.startsWith("demo-");
    
    // ... rest of auth checks
  } else if (!loading && !firebaseUser) {
    // Only redirect to login when we're certain there's no user
    router.push("/login");
  }
}, [user, firebaseUser, loading, router]);
```

**File: `app/demo/page.tsx`**
```typescript
// Simplified demo login - auth context now handles waiting
await signIn(email, password); // This now waits for user data
await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for state propagation
router.push(role === "admin" ? "/admin" : "/handyman");
```

**Commit:** `6177948` - "Fix: Demo mode sign-in race conditions and redirect loops"

---

## 2. Critical System Design Issues

### Issue #1: No API Authentication ⚠️ CRITICAL

**Location:** `app/api/jobs/route.ts`, `app/api/invoices/route.ts`, `app/api/settings/route.ts`

**Problem:**
API routes accept `companyId` as a query/body parameter without any authentication or authorization checks:

```typescript
// Current implementation - INSECURE
export async function GET(req: Request) {
  const companyId = searchParams.get("companyId") || "DEMO";
  const allJobs = await getJobs(companyId); // No auth check!
  return NextResponse.json(allJobs);
}
```

**Security Risk:**
- Any user can access any company's data by changing `companyId` parameter
- No verification that the requesting user belongs to that company
- Bypasses Firestore security rules entirely since API uses admin SDK

**Example Attack:**
```bash
# User A can access Company B's data
curl "https://rosco-app.vercel.app/api/jobs?companyId=COMPANY_B"
```

### Issue #2: Missing Server-Side User Context

**Location:** All server components (`app/admin/page.tsx`, etc.)

**Problem:**
- Server components can't access the current user's session
- No mechanism to extract user context from cookies/headers
- All pages hardcoded to use `companyId = "DEMO"`

**Current Code:**
```typescript
// app/admin/page.tsx (Server Component)
const [allJobs, allInvoices, handymen] = await Promise.all([
  getJobs(),        // Defaults to "DEMO" - can't access user's companyId
  getInvoices(),    // Defaults to "DEMO"
  getHandymen(),    // Defaults to "DEMO"
]);
```

**Impact:**
- True multi-tenancy is not functional
- All authenticated users see the same DEMO company data
- Real company data cannot be accessed in the current architecture

### Issue #3: Client-Controlled Data Access

**Location:** All client-side data fetching (forms, buttons, actions)

**Problem:**
Client components send `companyId` in requests, allowing manipulation:

```typescript
// app/admin/jobs/_components/JobForm.tsx
const response = await fetch("/api/jobs", {
  method: "POST",
  body: JSON.stringify({
    companyId: user?.companyId || "DEMO", // Client-controlled!
    // ... rest of data
  }),
});
```

**Risk:**
Malicious user can modify the request:
```javascript
// Modified request in browser devtools
body: JSON.stringify({
  companyId: "VICTIM_COMPANY_ID", // Inject another company ID
  // ... data gets written to wrong company
})
```

### Issue #4: Inconsistent Demo User Handling

**Location:** Throughout codebase

**Problem:**
Demo users are treated as exceptions with scattered `isDemoUser` checks:

```typescript
const isDemoUser = firebaseUser?.email?.startsWith("demo-");
if (!user.onboardingComplete && !isDemoUser) { ... }
```

**Issues:**
- Demo logic scattered across multiple files
- Inconsistent detection methods (email prefix, companyId check)
- Hard to maintain and error-prone
- Doesn't scale if we want multiple demo modes

### Issue #5: No Firebase Token Verification in API Routes

**Location:** All API routes

**Problem:**
API routes don't verify Firebase authentication tokens:

```typescript
// Missing from all API routes:
// 1. Extract Firebase token from Authorization header
// 2. Verify token with Firebase Admin SDK
// 3. Extract uid and fetch user document
// 4. Verify user has access to requested companyId
```

**Current State:**
- Unauthenticated requests can access API
- No way to know WHO is making the request
- Cannot enforce row-level security

### Issue #6: Cache Keys Not Scoped by User

**Location:** `lib/db.ts`

**Problem:**
Next.js cache tags don't include authentication context:

```typescript
export const getJobs = (companyId: string = "DEMO") => 
  unstable_cache(() => _fetchJobs(companyId), [`jobs-${companyId}`], {
    revalidate: 300,
    tags: [`jobs-${companyId}`],
  })();
```

**Risk:**
- If multiple users access the same company, one user's cache affects another
- Cache poisoning possible if user can manipulate companyId
- No user isolation in cached data

---

## 3. Architecture Recommendations

### Recommendation #1: Implement API Authentication Middleware

**Priority:** CRITICAL

Create a middleware to verify Firebase tokens and extract user context:

```typescript
// lib/auth-middleware.ts
import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "./firebase-admin";

export async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }
  
  try {
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Fetch user document to get companyId and role
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return { error: "User not found", status: 404 };
    }
    
    const user = userDoc.data();
    
    return {
      user: {
        uid,
        email: decodedToken.email,
        companyId: user.companyId,
        role: user.role,
      },
    };
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
}
```

**Usage in API Routes:**
```typescript
// app/api/jobs/route.ts
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  // Use authenticated user's companyId
  const allJobs = await getJobs(auth.user.companyId);
  return NextResponse.json(allJobs);
}
```

### Recommendation #2: Migrate to Server Actions

**Priority:** HIGH

Convert data mutations to Next.js Server Actions with built-in auth:

```typescript
// app/admin/actions.ts
"use server";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth-server";
import { createJob as dbCreateJob } from "@/lib/db";

export async function createJob(formData: FormData) {
  // Verify session from cookies
  const session = await verifySession();
  
  if (!session) {
    return { error: "Unauthorized" };
  }
  
  // Use session's companyId - cannot be manipulated by client
  const job = await dbCreateJob({
    companyId: session.companyId,
    clientName: formData.get("clientName"),
    // ... rest of fields
  });
  
  return { success: true, job };
}
```

### Recommendation #3: Session Management with HTTP-Only Cookies

**Priority:** HIGH

Store Firebase tokens in HTTP-only cookies instead of relying on client-side auth:

```typescript
// lib/auth-server.ts
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";

export async function verifySession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token) return null;
  
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      companyId: userDoc.data()?.companyId,
      role: userDoc.data()?.role,
    };
  } catch {
    return null;
  }
}
```

**Set cookie on login:**
```typescript
// app/api/auth/login/route.ts
export async function POST(req: Request) {
  // ... verify credentials
  const token = await firebaseAuth.createCustomToken(uid);
  
  cookies().set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return NextResponse.json({ success: true });
}
```

### Recommendation #4: Row-Level Security Pattern

**Priority:** HIGH

Enforce data access control at the database query level:

```typescript
// lib/db.ts
export async function getJobs(userId: string, companyId: string) {
  // Verify user belongs to company
  const userDoc = await db.collection("users").doc(userId).get();
  
  if (userDoc.data()?.companyId !== companyId) {
    throw new Error("Unauthorized access to company data");
  }
  
  // Fetch jobs scoped to company
  const jobs = await db
    .collection("jobs")
    .where("companyId", "==", companyId)
    .get();
  
  return jobs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

### Recommendation #5: Unified Demo Mode Strategy

**Priority:** MEDIUM

Create a dedicated demo mode service instead of scattered checks:

```typescript
// lib/demo-mode.ts
export const DEMO_CONFIG = {
  COMPANY_ID: "DEMO",
  ADMIN_EMAIL: "demo-admin@rosco.app",
  HANDYMAN_EMAIL: "demo-handyman@rosco.app",
};

export function isDemoUser(email: string | null | undefined): boolean {
  return email?.endsWith("@rosco.app") && email.startsWith("demo-");
}

export function isDemoCompany(companyId: string | null | undefined): boolean {
  return companyId === DEMO_CONFIG.COMPANY_ID;
}

export function getDemoAccess(user: any) {
  if (isDemoUser(user?.email) || isDemoCompany(user?.companyId)) {
    return {
      isDemo: true,
      companyId: DEMO_CONFIG.COMPANY_ID,
      readOnly: true, // Demo users can't modify data
    };
  }
  return { isDemo: false, companyId: user?.companyId };
}
```

### Recommendation #6: Implement Request Context

**Priority:** MEDIUM

Add a context system to track user identity through the request lifecycle:

```typescript
// lib/request-context.ts
import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
  userId: string;
  companyId: string;
  role: "admin" | "handyman";
  isDemo: boolean;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function withContext<T>(
  context: RequestContext,
  fn: () => T
): T {
  return requestContext.run(context, fn);
}

export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}
```

---

## 4. Security Best Practices Checklist

- [ ] Add Firebase token verification to all API routes
- [ ] Remove `companyId` from client requests (derive from session)
- [ ] Implement server-side auth guards for all data access
- [ ] Add rate limiting to prevent abuse
- [ ] Enable CORS restrictions in production
- [ ] Audit Firestore security rules to ensure defense in depth
- [ ] Add request logging for security monitoring
- [ ] Implement CSRF protection for state-changing operations
- [ ] Add input validation and sanitization
- [ ] Enable security headers (CSP, HSTS, etc.)

---

## 5. Testing Recommendations

### Security Testing

1. **Authentication Tests**
   - Attempt to access API without token
   - Use expired/invalid tokens
   - Try to access other companies' data

2. **Authorization Tests**
   - Handyman trying to access admin endpoints
   - User A trying to access Company B's data
   - Demo user trying to modify data

3. **Session Management Tests**
   - Token expiration handling
   - Concurrent sessions
   - Session invalidation on logout

### Integration Testing

1. **Demo Mode Flow**
   - Sign in as demo admin
   - Sign in as demo handyman
   - Verify data isolation
   - Test navigation and permissions

2. **Real User Flow**
   - Sign up new user
   - Complete onboarding
   - Create company
   - Add team members
   - Verify data is properly scoped

---

## 6. Performance Considerations

### Current Caching Strategy

The app uses Next.js `unstable_cache` with:
- 5-minute cache for jobs, invoices, settings
- 10-minute cache for handymen, presets
- Tag-based revalidation on mutations

**Issue:** Cache keys don't include user context, risking data leakage

### Recommended Caching Strategy

```typescript
// Scope cache by company AND user role
export const getJobs = (companyId: string, userId: string) => 
  unstable_cache(
    () => _fetchJobs(companyId, userId),
    [`jobs-${companyId}-${userId}`],
    {
      revalidate: 300,
      tags: [`jobs-${companyId}`, `user-${userId}`],
    }
  )();
```

---

## 7. Migration Path

### Phase 1: Critical Security Fixes (Week 1)

1. ✅ Fix demo mode sign-in (COMPLETED)
2. Add API authentication middleware
3. Implement session management with HTTP-only cookies
4. Add server-side auth guards

### Phase 2: Architecture Improvements (Week 2-3)

1. Migrate mutations to Server Actions
2. Implement Row-Level Security pattern
3. Add request context system
4. Refactor demo mode handling

### Phase 3: Testing & Monitoring (Week 4)

1. Add comprehensive security tests
2. Implement audit logging
3. Set up monitoring and alerts
4. Perform penetration testing

---

## 8. Conclusion

### What Was Fixed ✅

- Demo mode sign-in race conditions resolved
- Redirect loops in admin/handyman layouts fixed
- Auth state timing issues corrected
- Changes deployed to production

### What Needs Attention ⚠️

**Critical:**
- No API authentication (data exposure risk)
- No server-side user context (multi-tenancy broken)
- Client-controlled data access (security bypass)

**High Priority:**
- Missing token verification in API routes
- Insecure cache scoping
- Inconsistent demo mode handling

### Estimated Effort

- **Critical Fixes:** 2-3 days (API auth + session management)
- **Architecture Refactor:** 1-2 weeks (Server Actions + RLS)
- **Testing & Hardening:** 1 week

### Next Steps

1. Review this report with the development team
2. Prioritize security fixes based on risk assessment
3. Create implementation tickets with clear acceptance criteria
4. Begin with Phase 1 (critical security fixes)
5. Set up monitoring to detect unauthorized access attempts

---

**Report Generated:** 2025-02-24 18:19 GMT+2
**Git Commit:** 6177948
**Deployed:** https://rosco-app-chi.vercel.app
