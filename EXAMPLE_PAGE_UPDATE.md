# Example: How to Update a Page for Multi-Tenancy

This guide shows **step-by-step** how to update an existing page to use the authenticated user's `companyId` instead of the default "DEMO" data.

---

## Example: Admin Jobs List Page

### ❌ BEFORE (uses DEMO data)
```tsx
// /app/admin/jobs/page.tsx
import { getJobs } from "@/lib/db";

export default async function AdminJobsPage() {
  const jobs = await getJobs(); // ⚠️ Uses "DEMO" by default
  
  return (
    <div>
      <h1>Jobs</h1>
      {jobs.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### ✅ AFTER (uses user's companyId)
```tsx
// /app/admin/jobs/page.tsx
"use client"; // Must be client component to use hooks

import { useState, useEffect } from "react";
import { getJobs } from "@/lib/db";
import { useCompany } from "@/lib/use-company";

export default function AdminJobsPage() {
  const companyId = useCompany(); // ✅ Gets user's companyId or "DEMO"
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const data = await getJobs(companyId); // ✅ Pass companyId
        setJobs(data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadJobs();
  }, [companyId]); // Re-fetch if companyId changes

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Jobs</h1>
      {jobs.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

---

## Key Changes

### 1. Add `"use client"`
Server components can't use hooks, so convert to client component.

### 2. Import `useCompany` hook
```tsx
import { useCompany } from "@/lib/use-company";
```

### 3. Get companyId in component
```tsx
const companyId = useCompany();
```

### 4. Pass companyId to all data functions
```tsx
const jobs = await getJobs(companyId);        // ✅
const invoices = await getInvoices(companyId); // ✅
const handymen = await getHandymen(companyId); // ✅
const settings = await getSettings(companyId); // ✅
```

### 5. Use `useState` + `useEffect` for async data
Since it's now a client component, use hooks instead of `async/await` at the top level.

---

## Example: Create Job Form

### ❌ BEFORE
```tsx
// /app/admin/jobs/new/page.tsx
async function handleSubmit(formData) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    body: JSON.stringify({
      title: formData.title,
      date: formData.date,
      // ...
    }),
  });
}
```

### ✅ AFTER
```tsx
// /app/admin/jobs/new/page.tsx
"use client";

import { useCompany } from "@/lib/use-company";

export default function NewJobPage() {
  const companyId = useCompany();

  async function handleSubmit(formData) {
    const res = await fetch("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        companyId,           // ✅ Include companyId
        title: formData.title,
        date: formData.date,
        // ...
      }),
    });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Example: Job Detail Page (with params)

### ❌ BEFORE
```tsx
// /app/admin/jobs/[id]/page.tsx
export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJob(id); // ⚠️ Uses "DEMO"
  
  return <div>{job.title}</div>;
}
```

### ✅ AFTER
```tsx
// /app/admin/jobs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getJob } from "@/lib/db";
import { useCompany } from "@/lib/use-company";

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const companyId = useCompany();
  const [job, setJob] = useState(null);

  useEffect(() => {
    getJob(id, companyId).then(setJob); // ✅ Pass both id and companyId
  }, [id, companyId]);

  if (!job) return <div>Loading...</div>;

  return <div>{job.title}</div>;
}
```

---

## Example: Update Job API Call

### ❌ BEFORE
```tsx
async function updateJobStatus(jobId, newStatus) {
  await fetch(`/api/jobs/${jobId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });
}
```

### ✅ AFTER
```tsx
"use client";

import { useCompany } from "@/lib/use-company";

function JobStatusButton({ jobId }) {
  const companyId = useCompany();

  async function updateJobStatus(newStatus) {
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ 
        companyId,        // ✅ Include companyId
        status: newStatus 
      }),
    });
  }

  return <button onClick={() => updateJobStatus("Completed")}>Mark Done</button>;
}
```

---

## Quick Reference

### Data Fetching
```tsx
// ✅ Always pass companyId
const companyId = useCompany();

const jobs = await getJobs(companyId);
const job = await getJob(jobId, companyId);
const invoices = await getInvoices(companyId);
const invoice = await getInvoice(invoiceId, companyId);
const handymen = await getHandymen(companyId);
const handyman = await getHandyman(handymanId, companyId);
const presets = await getServicePresets(companyId);
const settings = await getSettings(companyId);
```

### API Calls
```tsx
// ✅ Always include companyId in body or params
const companyId = useCompany();

// POST / PUT / PATCH
fetch("/api/jobs", {
  method: "POST",
  body: JSON.stringify({ companyId, ...data }),
});

// GET / DELETE (in URL params)
fetch(`/api/jobs/${id}?companyId=${companyId}`);
```

### Mutations
```tsx
// ✅ Always pass companyId to mutations
await createJob({ companyId, ...jobData });
await updateJob(jobId, { ...updates }, companyId);
await deleteJob(jobId, companyId);

await createInvoice({ companyId, ...invoiceData });
await updateInvoice(invoiceId, { ...updates }, companyId);

await updateSettings({ ...settings }, companyId);
```

---

## Testing Your Changes

### 1. Test Demo Mode (Unauthenticated)
```bash
# Open incognito window
# Go to http://localhost:3000
# Should see DEMO data without login ✅
```

### 2. Test Admin User
```bash
# Sign up as admin
# Create company "Test Company"
# Should see ONLY your company's data ✅
# Create a job → should be saved with your companyId ✅
```

### 3. Test Handyman User
```bash
# Sign up as handyman
# Join "Test Company"
# Admin approves
# Should see only Test Company's jobs ✅
```

### 4. Test Multi-Tenant Isolation
```bash
# Create 2 companies: "Company A" and "Company B"
# Create jobs in Company A
# Sign in as Company B admin
# Should NOT see Company A's jobs ✅
```

---

## Common Pitfalls

### ❌ Forgetting to pass companyId
```tsx
const jobs = await getJobs(); // Uses "DEMO"
```
**Fix:**
```tsx
const companyId = useCompany();
const jobs = await getJobs(companyId);
```

### ❌ Using server component syntax in client component
```tsx
export default async function MyPage() { // ❌ async at top level
  const jobs = await getJobs();
  // ...
}
```
**Fix:**
```tsx
"use client";

export default function MyPage() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    getJobs(companyId).then(setJobs);
  }, [companyId]);
  // ...
}
```

### ❌ Not re-fetching when companyId changes
```tsx
useEffect(() => {
  getJobs(companyId).then(setJobs);
}, []); // ❌ Missing companyId dependency
```
**Fix:**
```tsx
useEffect(() => {
  getJobs(companyId).then(setJobs);
}, [companyId]); // ✅ Re-fetch when companyId changes
```

---

## Pro Tips

### 1. Loading States
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    setLoading(true);
    const data = await getJobs(companyId);
    setJobs(data);
    setLoading(false);
  }
  load();
}, [companyId]);

if (loading) return <Spinner />;
```

### 2. Error Handling
```tsx
const [error, setError] = useState(null);

useEffect(() => {
  async function load() {
    try {
      const data = await getJobs(companyId);
      setJobs(data);
    } catch (err) {
      setError(err.message);
    }
  }
  load();
}, [companyId]);

if (error) return <div>Error: {error}</div>;
```

### 3. Optimistic Updates
```tsx
async function markComplete(jobId) {
  // Update UI immediately
  setJobs(prev => prev.map(j => 
    j.id === jobId ? { ...j, status: "Completed" } : j
  ));

  // Then update server
  try {
    await updateJob(jobId, { status: "Completed" }, companyId);
  } catch (err) {
    // Revert on error
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: "Pending" } : j
    ));
  }
}
```

---

## Summary

**Every page update follows this pattern:**
1. Add `"use client"`
2. Import `useCompany` hook
3. Get `companyId` from hook
4. Pass `companyId` to ALL data functions
5. Convert `async` page to `useState` + `useEffect`

**Estimated time per page:** ~15-30 minutes
**Total pages to update:** ~15 pages
**Total time:** ~4-8 hours for full migration
