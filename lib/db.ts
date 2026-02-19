/**
 * All Firestore data access in one place.
 * Server-side only (uses firebase-admin).
 *
 * CACHING STRATEGY
 * ─────────────────
 * Base read functions (getJobs, getInvoices, getHandymen, getServicePresets)
 * are wrapped with Next.js unstable_cache so Firestore is only hit once per
 * cache window (default 60 s).  After any write the relevant tag is
 * revalidated so the next read picks up fresh data.
 *
 * Tags:
 *   "jobs"      – revalidated by createJob / updateJob / deleteJob
 *   "invoices"  – revalidated by createInvoice / updateInvoice
 *   "handymen"  – revalidated by any handyman write (seed only for now)
 *   "presets"   – revalidated by any preset write  (seed only for now)
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Job, Invoice, Handyman, ServicePreset, InvoiceItem } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

function docToJob(doc: FirebaseFirestore.DocumentSnapshot): Job {
  return { id: doc.id, ...doc.data() } as Job;
}
function docToInvoice(doc: FirebaseFirestore.DocumentSnapshot): Invoice {
  return { id: doc.id, ...doc.data() } as Invoice;
}
function docToHandyman(doc: FirebaseFirestore.DocumentSnapshot): Handyman {
  return { id: doc.id, ...doc.data() } as Handyman;
}
function docToPreset(doc: FirebaseFirestore.DocumentSnapshot): ServicePreset {
  return { id: doc.id, ...doc.data() } as ServicePreset;
}

// ─── Base Firestore reads (cached) ───────────────────────────────────────────
// Each function is wrapped with unstable_cache so repeated calls within the
// same 60-second window return the same data without hitting Firestore.

const _fetchJobs = async (): Promise<Job[]> => {
  const snap = await db.collection("jobs").orderBy("date", "desc").get();
  return snap.docs.map(docToJob);
};

const _fetchInvoices = async (): Promise<Invoice[]> => {
  const snap = await db.collection("invoices").orderBy("createdAt", "desc").get();
  return snap.docs.map(docToInvoice);
};

const _fetchHandymen = async (): Promise<Handyman[]> => {
  const snap = await db.collection("handymen").orderBy("name").get();
  return snap.docs.map(docToHandyman);
};

const _fetchServicePresets = async (): Promise<ServicePreset[]> => {
  const snap = await db.collection("servicePresets").orderBy("category").get();
  return snap.docs.map(docToPreset);
};

// Cached wrappers – 60-second TTL, revalidated by tag on writes
export const getJobs = unstable_cache(_fetchJobs, ["jobs"], {
  revalidate: 60,
  tags: ["jobs"],
});

export const getInvoices = unstable_cache(_fetchInvoices, ["invoices"], {
  revalidate: 60,
  tags: ["invoices"],
});

export const getHandymen = unstable_cache(_fetchHandymen, ["handymen"], {
  revalidate: 60,
  tags: ["handymen"],
});

export const getServicePresets = unstable_cache(_fetchServicePresets, ["presets"], {
  revalidate: 60,
  tags: ["presets"],
});

// ─── Single-doc reads (short cache) ──────────────────────────────────────────
// These are cached per-ID to avoid re-fetching the same doc on detail pages.
// Tags ensure they're busted when the parent collection is revalidated.

export async function getHandyman(id: string): Promise<Handyman | null> {
  const cached = unstable_cache(
    async () => {
      const doc = await db.collection("handymen").doc(id).get();
      return doc.exists ? docToHandyman(doc) : null;
    },
    [`handyman-${id}`],
    { revalidate: 60, tags: ["handymen"] }
  );
  return cached();
}

export async function getJob(id: string): Promise<Job | null> {
  const cached = unstable_cache(
    async () => {
      const doc = await db.collection("jobs").doc(id).get();
      return doc.exists ? docToJob(doc) : null;
    },
    [`job-${id}`],
    { revalidate: 60, tags: ["jobs"] }
  );
  return cached();
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const cached = unstable_cache(
    async () => {
      const doc = await db.collection("invoices").doc(id).get();
      return doc.exists ? docToInvoice(doc) : null;
    },
    [`invoice-${id}`],
    { revalidate: 60, tags: ["invoices"] }
  );
  return cached();
}

// ─── In-memory derived queries (no extra Firestore reads) ────────────────────
// These accept a pre-fetched array so the caller decides how to source data.
// Nothing here touches Firestore.

export function filterTodayJobs(jobs: Job[]): Job[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return jobs
    .filter(j => j.date >= today.toISOString() && j.date < tomorrow.toISOString())
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function filterUpcomingJobs(jobs: Job[], days = 7): Job[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return jobs
    .filter(j => j.date >= start.toISOString() && j.date <= end.toISOString() && j.status !== "Completed")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function filterWeekJobs(jobs: Job[]): Job[] {
  const today = new Date();
  const dow = today.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const start = new Date(today);
  start.setDate(today.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return jobs
    .filter(j => j.date >= start.toISOString() && j.date < end.toISOString())
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function filterMonthJobs(jobs: Job[]): Job[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end   = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return jobs
    .filter(j => j.date >= start.toISOString() && j.date < end.toISOString())
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function filterOutstandingInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter(i => ["Sent", "Outstanding"].includes(i.status));
}

export function filterPaidInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter(i => i.status === "Paid");
}

export function findInvoiceByJobId(invoices: Invoice[], jobId: string): Invoice | undefined {
  return invoices.find(i => i.jobId === jobId);
}

// ─── Legacy wrapper aliases (kept for any callers not yet updated) ────────────
// These still return the same data but now go through the cache.

/** @deprecated Use getJobs() + filterTodayJobs() */
export async function getTodayJobs(): Promise<Job[]> {
  return filterTodayJobs(await getJobs());
}

/** @deprecated Use getJobs() + filterUpcomingJobs() */
export async function getUpcomingJobs(days = 7): Promise<Job[]> {
  return filterUpcomingJobs(await getJobs(), days);
}

/** @deprecated Use getJobs() + filterWeekJobs() */
export async function getWeekJobs(): Promise<Job[]> {
  return filterWeekJobs(await getJobs());
}

/** @deprecated Use getJobs() + filterMonthJobs() */
export async function getMonthJobs(): Promise<Job[]> {
  return filterMonthJobs(await getJobs());
}

/** @deprecated Use getInvoices() + filterOutstandingInvoices() */
export async function getOutstandingInvoices(): Promise<Invoice[]> {
  return filterOutstandingInvoices(await getInvoices());
}

/** @deprecated Use getInvoices() + filterPaidInvoices() */
export async function getPaidInvoices(): Promise<Invoice[]> {
  return filterPaidInvoices(await getInvoices());
}

/** @deprecated Use getInvoices() + findInvoiceByJobId() */
export async function getInvoiceByJobId(jobId: string): Promise<Invoice | null> {
  return findInvoiceByJobId(await getInvoices(), jobId) ?? null;
}

// ─── Jobs – mutations ────────────────────────────────────────────────────────

export async function createJob(data: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
  const ref = db.collection("jobs").doc();
  const job: Job = {
    ...data,
    id: ref.id,
    createdAt: now(),
    updatedAt: now(),
  };
  await ref.set(job);
  revalidateTag("jobs", "max");
  return job;
}

export async function updateJob(id: string, data: Partial<Job>): Promise<void> {
  await db.collection("jobs").doc(id).update({
    ...data,
    updatedAt: now(),
  });
  revalidateTag("jobs", "max");
}

export async function deleteJob(id: string): Promise<void> {
  await db.collection("jobs").doc(id).delete();
  revalidateTag("jobs", "max");
}

// ─── Invoices – mutations ────────────────────────────────────────────────────

export async function createInvoice(data: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
  const ref = db.collection("invoices").doc();
  const invoice: Invoice = {
    ...data,
    id: ref.id,
    createdAt: now(),
    updatedAt: now(),
  };
  await ref.set(invoice);
  // Update job with invoiceId
  await updateJob(data.jobId, { invoiceId: ref.id });
  revalidateTag("invoices", "max");
  return invoice;
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<void> {
  await db.collection("invoices").doc(id).update({
    ...data,
    updatedAt: now(),
  });
  revalidateTag("invoices", "max");
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<void> {
  const batch = db.batch();

  // Service presets
  const presets = [
    { name: "Basic Plumbing Repair", description: "Fix leaks, replace fittings", price: 250, category: "Plumbing" },
    { name: "Pipe Installation", description: "Install or replace pipes", price: 450, category: "Plumbing" },
    { name: "Electrical Outlet Fix", description: "Replace or repair outlets", price: 180, category: "Electrical" },
    { name: "Light Fixture Installation", description: "Install ceiling/wall lights", price: 220, category: "Electrical" },
    { name: "Tile Repair", description: "Repair broken/cracked tiles", price: 300, category: "Tiling" },
    { name: "Tile Installation (per sqm)", description: "Full tile installation", price: 120, category: "Tiling" },
    { name: "Painting - Room", description: "Paint single room walls", price: 800, category: "Painting" },
    { name: "Door Lock Replacement", description: "Replace lock and keys", price: 350, category: "General" },
    { name: "AC Unit Service", description: "Clean and service AC", price: 280, category: "HVAC" },
    { name: "General Handyman (per hour)", description: "Hourly rate", price: 150, category: "General" },
  ];

  for (const p of presets) {
    const ref = db.collection("servicePresets").doc();
    batch.set(ref, { ...p, id: ref.id });
  }

  // Handymen
  const yosefRef = db.collection("handymen").doc();
  batch.set(yosefRef, {
    id: yosefRef.id, name: "Yosef Cohen",
    phone: "+972-50-1234567", email: "yosef@rosco.co.il",
    createdAt: now(),
  });

  const aviRef = db.collection("handymen").doc();
  batch.set(aviRef, {
    id: aviRef.id, name: "Avi Mizrahi",
    phone: "+972-52-9876543", email: "avi@rosco.co.il",
    createdAt: now(),
  });

  await batch.commit();
  revalidateTag("handymen", "max");
  revalidateTag("presets", "max");

  // Jobs (sequential so we can reference IDs)
  const jobs = [
    {
      clientName: "David Levy", clientPhone: "+972-54-1112223",
      clientEmail: "david.levy@email.com", title: "Kitchen Sink Repair",
      description: "Slow drain and small leak under cabinet.",
      date: new Date(Date.now() + 2 * 3600000).toISOString(),
      location: "Rothschild Blvd 45, Tel Aviv",
      status: "In Progress" as const, handymanId: yosefRef.id, handymanName: "Yosef Cohen",
    },
    {
      clientName: "Rachel Shapiro", clientPhone: "+972-58-3334445",
      clientEmail: "rachel.s@gmail.com", title: "Bathroom Tile Repair",
      description: "Three cracked tiles need replacing.",
      date: new Date(Date.now() + 5 * 3600000).toISOString(),
      location: "Ben Yehuda St 12, Tel Aviv",
      status: "Pending" as const, handymanId: yosefRef.id, handymanName: "Yosef Cohen",
    },
    {
      clientName: "Moshe Katz", clientPhone: "+972-50-5556667",
      clientEmail: "mkatz@business.com", title: "Office Electrical Work",
      description: "Install 4 new power outlets with surge protectors.",
      date: new Date(Date.now() + 26 * 3600000).toISOString(),
      location: "Azrieli Center Tower 1, Tel Aviv",
      status: "Pending" as const, handymanId: aviRef.id, handymanName: "Avi Mizrahi",
    },
    {
      clientName: "Ilan Peretz", clientPhone: "+972-54-9990001",
      clientEmail: "ilan.p@company.co.il", title: "AC Unit Service & Repair",
      description: "Two AC units — one noisy, one needs cleaning.",
      date: new Date(Date.now() + 50 * 3600000).toISOString(),
      location: "Dizengoff St 100, Tel Aviv",
      status: "Pending" as const, handymanId: yosefRef.id, handymanName: "Yosef Cohen",
    },
  ];

  for (const j of jobs) {
    await createJob(j);
  }

  // One completed job with invoice
  const completedJob = await createJob({
    clientName: "Noa Ben-David", clientPhone: "+972-52-7778889",
    clientEmail: "noa.bd@hotmail.com", title: "Bedroom Door Lock Replacement",
    description: "Door lock broken, full replacement with new keys.",
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    location: "Herzl St 88, Jerusalem",
    status: "Completed", handymanId: aviRef.id, handymanName: "Avi Mizrahi",
  });

  const items: InvoiceItem[] = [
    { id: "1", description: "Door Lock Replacement", quantity: 1, unitPrice: 350, total: 350 },
    { id: "2", description: "General Handyman (per hour)", quantity: 2, unitPrice: 150, total: 300 },
  ];
  const subtotal = 650;
  const vatAmount = subtotal * 0.17;

  await createInvoice({
    jobId: completedJob.id,
    clientName: completedJob.clientName,
    clientEmail: completedJob.clientEmail,
    clientPhone: completedJob.clientPhone,
    jobTitle: completedJob.title,
    jobDate: completedJob.date,
    jobLocation: completedJob.location,
    handymanName: completedJob.handymanName,
    items,
    subtotal,
    vatEnabled: true,
    vatRate: 0.17,
    vatAmount,
    total: subtotal + vatAmount,
    status: "Sent",
  });

  console.log("✅ Firebase seed complete");
}
