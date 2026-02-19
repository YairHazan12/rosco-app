/**
 * All Firestore data access in one place.
 * Server-side only (uses firebase-admin).
 *
 * ─── CACHING STRATEGY ───────────────────────────────────────────────────────
 *
 * Collection reads (getJobs, getInvoices, getHandymen, getServicePresets,
 * getSettings) are wrapped with Next.js unstable_cache so Firestore is only
 * hit ONCE per cache window (60 s for jobs/invoices, 5 min for settings,
 * 10 min for handymen/presets).
 *
 * Single-doc lookups (getJob, getInvoice, getHandyman) are derived from the
 * already-cached collection, costing zero extra Firestore reads.
 *
 * Tags:
 *   "jobs"      – revalidated by createJob / updateJob / deleteJob
 *   "invoices"  – revalidated by createInvoice / updateInvoice
 *   "handymen"  – (seed only for now)
 *   "presets"   – (seed only for now)
 *   "settings"  – revalidated by updateSettings
 *
 * ─── READ BUDGET PER PAGE LOAD ──────────────────────────────────────────────
 * Dashboard  : 3 collection reads  (jobs + invoices + handymen)  → cached
 * Jobs list  : 1 collection read   (jobs)                        → cached
 * Invoice list: 1 collection read  (invoices)                    → cached
 * Job detail : 0 extra reads       (derived from cached jobs)
 * Invoice detail: 0 extra reads    (derived from cached invoices)
 * Settings   : 1 doc read          (settings)                    → cached 5 min
 * Handyman   : 1 collection read   (jobs)                        → cached
 * Pay page   : 0 extra reads       (derived from cached invoices)
 *
 * Cache HIT  = 0 Firestore reads per page visit.
 * Cache MISS = reads above (first visit per 60s window).
 * ────────────────────────────────────────────────────────────────────────────
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "./firebase-admin";
import type { Job, Invoice, Handyman, ServicePreset, InvoiceItem, AppSettings } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

// Max docs per collection fetch — safety bound to prevent runaway reads.
// Increase only if the business genuinely grows beyond this.
const JOBS_LIMIT     = 500;
const INVOICES_LIMIT = 500;
const HANDYMEN_LIMIT = 50;
const PRESETS_LIMIT  = 100;

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

// ─── Base Firestore reads (UNCACHED — only called by the cache wrappers) ─────

const _fetchJobs = async (): Promise<Job[]> => {
  // READ: 1 Firestore query, up to JOBS_LIMIT document reads
  console.log("[Firestore READ] jobs collection — cache miss");
  const snap = await db
    .collection("jobs")
    .orderBy("date", "desc")
    .limit(JOBS_LIMIT)
    .get();
  return snap.docs.map(docToJob);
};

const _fetchInvoices = async (): Promise<Invoice[]> => {
  // READ: 1 Firestore query, up to INVOICES_LIMIT document reads
  console.log("[Firestore READ] invoices collection — cache miss");
  const snap = await db
    .collection("invoices")
    .orderBy("createdAt", "desc")
    .limit(INVOICES_LIMIT)
    .get();
  return snap.docs.map(docToInvoice);
};

const _fetchHandymen = async (): Promise<Handyman[]> => {
  // READ: 1 Firestore query, up to HANDYMEN_LIMIT document reads
  console.log("[Firestore READ] handymen collection — cache miss");
  const snap = await db
    .collection("handymen")
    .orderBy("name")
    .limit(HANDYMEN_LIMIT)
    .get();
  return snap.docs.map(docToHandyman);
};

const _fetchServicePresets = async (): Promise<ServicePreset[]> => {
  // READ: 1 Firestore query, up to PRESETS_LIMIT document reads
  console.log("[Firestore READ] servicePresets collection — cache miss");
  const snap = await db
    .collection("servicePresets")
    .orderBy("category")
    .limit(PRESETS_LIMIT)
    .get();
  return snap.docs.map(docToPreset);
};

const _fetchSettings = async (): Promise<AppSettings> => {
  // READ: 1 Firestore document read
  console.log("[Firestore READ] settings/admin — cache miss");
  const doc = await db.collection("settings").doc("admin").get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(doc.data() as Partial<AppSettings>) };
};

// ─── Cached wrappers — persistent Data Cache, revalidated by tag ─────────────
// In production: cache persists across requests (zero Firestore reads on hit).
// In dev (next dev): cache resets between requests — that's expected behaviour.

/** All jobs, newest-first. Cached 60 s. Tag: "jobs". */
export const getJobs = unstable_cache(_fetchJobs, ["jobs"], {
  revalidate: 60,
  tags: ["jobs"],
});

/** All invoices, newest-first. Cached 60 s. Tag: "invoices". */
export const getInvoices = unstable_cache(_fetchInvoices, ["invoices"], {
  revalidate: 60,
  tags: ["invoices"],
});

/** All handymen, alpha. Cached 10 min. Tag: "handymen". */
export const getHandymen = unstable_cache(_fetchHandymen, ["handymen"], {
  revalidate: 600,
  tags: ["handymen"],
});

/** All service presets, by category. Cached 10 min. Tag: "presets". */
export const getServicePresets = unstable_cache(_fetchServicePresets, ["presets"], {
  revalidate: 600,
  tags: ["presets"],
});

/** App settings. Cached 5 min. Tag: "settings". */
export const getSettings = unstable_cache(_fetchSettings, ["settings"], {
  revalidate: 300,
  tags: ["settings"],
});

// ─── Single-doc lookups (DERIVED — zero extra Firestore reads) ────────────────
// These look up a document from the already-cached collection array.
// Cost: 0 Firestore reads when the collection is already cached.

export async function getJob(id: string): Promise<Job | null> {
  const jobs = await getJobs();
  return jobs.find(j => j.id === id) ?? null;
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const invoices = await getInvoices();
  return invoices.find(i => i.id === id) ?? null;
}

export async function getHandyman(id: string): Promise<Handyman | null> {
  const handymen = await getHandymen();
  return handymen.find(h => h.id === id) ?? null;
}

// ─── In-memory derived queries (no Firestore reads) ─────────────────────────

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

// ─── Legacy wrapper aliases ───────────────────────────────────────────────────

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
  revalidateTag("jobs", "max");   // bust cached collection so next read is fresh
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
  // Link invoice to job
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

// ─── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  currency: "ILS",
  language: "en",
  timezone: "Asia/Jerusalem",
  notifications: { email: true, sms: false, push: false },
};

export async function updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  const ref = db.collection("settings").doc("admin");
  await ref.set(data, { merge: true });
  revalidateTag("settings", "max");  // bust settings cache immediately
  const updated = await ref.get();
  return { ...DEFAULT_SETTINGS, ...(updated.data() as Partial<AppSettings>) };
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<void> {
  const batch = db.batch();

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
