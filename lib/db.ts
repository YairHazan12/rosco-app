/**
 * All Firestore data access in one place.
 * Server-side only (uses firebase-admin).
 *
 * ─── CACHING STRATEGY ───────────────────────────────────────────────────────
 *
 * Collection reads (getJobs, getInvoices, getHandymen, getServicePresets,
 * getSettings) are wrapped with Next.js unstable_cache so Firestore is only
 * hit ONCE per cache window (5 min for jobs/invoices/settings, 10 min for
 * handymen/presets). Cache is immediately revalidated on mutations via tags.
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
 * Dashboard      : 3 collection reads (jobs + invoices + handymen) → cached 5-10min
 * Jobs list      : 1 collection read  (jobs)                       → cached 5min
 * Invoice list   : 1 collection read  (invoices)                   → cached 5min
 * Job detail     : 0 extra reads      (derived from cached jobs)
 * Invoice detail : 0 extra reads      (derived from cached invoices)
 * Settings       : 1 doc read         (settings)                   → cached 5min
 * Handyman       : 1 collection read  (jobs)                       → cached 5min
 * Pay page       : 0 extra reads      (derived from cached invoices)
 *
 * Cache HIT  = 0 Firestore reads per page visit.
 * Cache MISS = reads above (first visit per 5min window for most data).
 * Mutations  = immediate cache revalidation via tags (zero stale data).
 * ────────────────────────────────────────────────────────────────────────────
 */
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "./firebase-admin";
import type { Job, Invoice, Handyman, ServicePreset, InvoiceItem, AppSettings, OffDayRequest, HandymanSettings } from "./types";

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

const _fetchJobs = async (companyId: string = "DEMO"): Promise<Job[]> => {
  // READ: 1 Firestore query, up to JOBS_LIMIT document reads
  console.log(`[🔥 Firestore READ] jobs collection (companyId: ${companyId}, limit: ${JOBS_LIMIT}) — CACHE MISS`);
  const snap = await db
    .collection("jobs")
    .where("companyId", "==", companyId)
    .orderBy("date", "desc")
    .limit(JOBS_LIMIT)
    .get();
  console.log(`[✅ Firestore] Loaded ${snap.docs.length} jobs for company ${companyId}`);
  return snap.docs.map(docToJob);
};

const _fetchInvoices = async (companyId: string = "DEMO"): Promise<Invoice[]> => {
  // READ: 1 Firestore query, up to INVOICES_LIMIT document reads
  console.log(`[🔥 Firestore READ] invoices collection (companyId: ${companyId}, limit: ${INVOICES_LIMIT}) — CACHE MISS`);
  const snap = await db
    .collection("invoices")
    .where("companyId", "==", companyId)
    .orderBy("createdAt", "desc")
    .limit(INVOICES_LIMIT)
    .get();
  console.log(`[✅ Firestore] Loaded ${snap.docs.length} invoices for company ${companyId}`);
  return snap.docs.map(docToInvoice);
};

const _fetchHandymen = async (companyId: string = "DEMO"): Promise<Handyman[]> => {
  // READ: 1 Firestore query, up to HANDYMEN_LIMIT document reads
  console.log(`[🔥 Firestore READ] handymen collection (companyId: ${companyId}, limit: ${HANDYMEN_LIMIT}) — CACHE MISS`);
  const snap = await db
    .collection("handymen")
    .where("companyId", "==", companyId)
    .orderBy("name")
    .limit(HANDYMEN_LIMIT)
    .get();
  console.log(`[✅ Firestore] Loaded ${snap.docs.length} handymen for company ${companyId}`);
  return snap.docs.map(docToHandyman);
};

const _fetchServicePresets = async (companyId: string = "DEMO"): Promise<ServicePreset[]> => {
  // READ: 1 Firestore query, up to PRESETS_LIMIT document reads
  console.log(`[🔥 Firestore READ] servicePresets collection (companyId: ${companyId}, limit: ${PRESETS_LIMIT}) — CACHE MISS`);
  const snap = await db
    .collection("servicePresets")
    .where("companyId", "==", companyId)
    .orderBy("category")
    .limit(PRESETS_LIMIT)
    .get();
  console.log(`[✅ Firestore] Loaded ${snap.docs.length} presets for company ${companyId}`);
  return snap.docs.map(docToPreset);
};

const _fetchSettings = async (companyId: string = "DEMO"): Promise<AppSettings> => {
  // READ: 1 Firestore document read
  console.log(`[🔥 Firestore READ] settings/${companyId} — CACHE MISS`);
  const doc = await db.collection("settings").doc(companyId).get();
  const result = doc.exists 
    ? { ...DEFAULT_SETTINGS, ...(doc.data() as Partial<AppSettings>) }
    : DEFAULT_SETTINGS;
  console.log(`[✅ Firestore] Loaded settings for company ${companyId}`);
  return result;
};

// ─── Cached wrappers — persistent Data Cache, revalidated by tag ─────────────
// In production: cache persists across requests (zero Firestore reads on hit).
// In dev (next dev): cache resets between requests — that's expected behaviour.

/** All jobs, newest-first. Cached 5 min. Tag: "jobs-{companyId}". */
export const getJobs = (companyId: string = "DEMO") => 
  unstable_cache(() => _fetchJobs(companyId), [`jobs-${companyId}`], {
    revalidate: 300, // 5 minutes - reduced from 60s to minimize reads
    tags: [`jobs-${companyId}`],
  })();

/** All invoices, newest-first. Cached 5 min. Tag: "invoices-{companyId}". */
export const getInvoices = (companyId: string = "DEMO") =>
  unstable_cache(() => _fetchInvoices(companyId), [`invoices-${companyId}`], {
    revalidate: 300, // 5 minutes - reduced from 60s to minimize reads
    tags: [`invoices-${companyId}`],
  })();

/** All handymen, alpha. Cached 10 min. Tag: "handymen-{companyId}". */
export const getHandymen = (companyId: string = "DEMO") =>
  unstable_cache(() => _fetchHandymen(companyId), [`handymen-${companyId}`], {
    revalidate: 600,
    tags: [`handymen-${companyId}`],
  })();

/** All service presets, by category. Cached 10 min. Tag: "presets-{companyId}". */
export const getServicePresets = (companyId: string = "DEMO") =>
  unstable_cache(() => _fetchServicePresets(companyId), [`presets-${companyId}`], {
    revalidate: 600,
    tags: [`presets-${companyId}`],
  })();

/** App settings. Cached 5 min. Tag: "settings-{companyId}". */
export const getSettings = (companyId: string = "DEMO") =>
  unstable_cache(() => _fetchSettings(companyId), [`settings-${companyId}`], {
    revalidate: 300,
    tags: [`settings-${companyId}`],
  })();

// ─── Single-doc lookups (DERIVED — zero extra Firestore reads) ────────────────
// These look up a document from the already-cached collection array.
// Cost: 0 Firestore reads when the collection is already cached.

export async function getJob(id: string, companyId: string = "DEMO"): Promise<Job | null> {
  const jobs = await getJobs(companyId);
  return jobs.find(j => j.id === id) ?? null;
}

export async function getInvoice(id: string, companyId: string = "DEMO"): Promise<Invoice | null> {
  const invoices = await getInvoices(companyId);
  return invoices.find(i => i.id === id) ?? null;
}

export async function getHandyman(id: string, companyId: string = "DEMO"): Promise<Handyman | null> {
  const handymen = await getHandymen(companyId);
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
export async function getTodayJobs(companyId: string = "DEMO"): Promise<Job[]> {
  return filterTodayJobs(await getJobs(companyId));
}
/** @deprecated Use getJobs() + filterUpcomingJobs() */
export async function getUpcomingJobs(days = 7, companyId: string = "DEMO"): Promise<Job[]> {
  return filterUpcomingJobs(await getJobs(companyId), days);
}
/** @deprecated Use getJobs() + filterWeekJobs() */
export async function getWeekJobs(companyId: string = "DEMO"): Promise<Job[]> {
  return filterWeekJobs(await getJobs(companyId));
}
/** @deprecated Use getJobs() + filterMonthJobs() */
export async function getMonthJobs(companyId: string = "DEMO"): Promise<Job[]> {
  return filterMonthJobs(await getJobs(companyId));
}
/** @deprecated Use getInvoices() + filterOutstandingInvoices() */
export async function getOutstandingInvoices(companyId: string = "DEMO"): Promise<Invoice[]> {
  return filterOutstandingInvoices(await getInvoices(companyId));
}
/** @deprecated Use getInvoices() + filterPaidInvoices() */
export async function getPaidInvoices(companyId: string = "DEMO"): Promise<Invoice[]> {
  return filterPaidInvoices(await getInvoices(companyId));
}
/** @deprecated Use getInvoices() + findInvoiceByJobId() */
export async function getInvoiceByJobId(jobId: string, companyId: string = "DEMO"): Promise<Invoice | null> {
  return findInvoiceByJobId(await getInvoices(companyId), jobId) ?? null;
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
  console.log(`[♻️ Cache] Revalidating "jobs-${data.companyId}" tag after CREATE`);
  revalidateTag(`jobs-${data.companyId}`, "max");   // bust cached collection so next read is fresh
  return job;
}

export async function updateJob(id: string, data: Partial<Job>, companyId?: string): Promise<void> {
  await db.collection("jobs").doc(id).update({
    ...data,
    updatedAt: now(),
  });
  // Use companyId from data if provided, otherwise use the parameter
  const cid = data.companyId || companyId || "DEMO";
  console.log(`[♻️ Cache] Revalidating "jobs-${cid}" tag after UPDATE`);
  revalidateTag(`jobs-${cid}`, "max");
}

export async function deleteJob(id: string, companyId: string = "DEMO"): Promise<void> {
  await db.collection("jobs").doc(id).delete();
  console.log(`[♻️ Cache] Revalidating "jobs-${companyId}" tag after DELETE`);
  revalidateTag(`jobs-${companyId}`, "max");
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
  await updateJob(data.jobId, { invoiceId: ref.id }, data.companyId);
  console.log(`[♻️ Cache] Revalidating "invoices-${data.companyId}" tag after CREATE`);
  revalidateTag(`invoices-${data.companyId}`, "max");
  return invoice;
}

export async function updateInvoice(id: string, data: Partial<Invoice>, companyId?: string): Promise<void> {
  await db.collection("invoices").doc(id).update({
    ...data,
    updatedAt: now(),
  });
  const cid = data.companyId || companyId || "DEMO";
  console.log(`[♻️ Cache] Revalidating "invoices-${cid}" tag after UPDATE`);
  revalidateTag(`invoices-${cid}`, "max");
}

// ─── Settings ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  currency: "ILS",
  language: "en",
  timezone: "Asia/Jerusalem",
  notifications: { email: true, sms: false, push: false },
};

export async function updateSettings(data: Partial<AppSettings>, companyId: string = "DEMO"): Promise<AppSettings> {
  const ref = db.collection("settings").doc(companyId);
  await ref.set(data, { merge: true });
  console.log(`[♻️ Cache] Revalidating "settings-${companyId}" tag after UPDATE`);
  revalidateTag(`settings-${companyId}`, "max");  // bust settings cache immediately
  const updated = await ref.get();
  return { ...DEFAULT_SETTINGS, ...(updated.data() as Partial<AppSettings>) };
}

// ─── Off-Day Requests ────────────────────────────────────────────────────────

function docToOffDayRequest(doc: FirebaseFirestore.DocumentSnapshot): OffDayRequest {
  return { id: doc.id, ...doc.data() } as OffDayRequest;
}

const _fetchOffDayRequests = async (companyId: string = "DEMO"): Promise<OffDayRequest[]> => {
  console.log(`[🔥 Firestore READ] offDayRequests collection (companyId: ${companyId}) — CACHE MISS`);
  const snap = await db
    .collection("offDayRequests")
    .where("companyId", "==", companyId)
    .orderBy("requestedAt", "desc")
    .limit(200)
    .get();
  console.log(`[✅ Firestore] Loaded ${snap.docs.length} off-day requests for company ${companyId}`);
  return snap.docs.map(docToOffDayRequest);
};

/** All off-day requests, newest-first. Cached 2 min. Tag: "offDayRequests-{companyId}". */
export const getOffDayRequests = (companyId: string = "DEMO") =>
  unstable_cache(() => _fetchOffDayRequests(companyId), [`offDayRequests-${companyId}`], {
    revalidate: 120, // 2 minutes
    tags: [`offDayRequests-${companyId}`],
  })();

export async function createOffDayRequest(data: Omit<OffDayRequest, "id" | "createdAt" | "updatedAt">): Promise<OffDayRequest> {
  const ref = db.collection("offDayRequests").doc();
  const request: OffDayRequest = {
    ...data,
    id: ref.id,
    createdAt: now(),
    updatedAt: now(),
  };
  await ref.set(request);
  console.log(`[♻️ Cache] Revalidating "offDayRequests-${data.companyId}" tag after CREATE`);
  revalidateTag(`offDayRequests-${data.companyId}`, "max");
  return request;
}

export async function updateOffDayRequest(id: string, data: Partial<OffDayRequest>, companyId?: string): Promise<void> {
  await db.collection("offDayRequests").doc(id).update({
    ...data,
    updatedAt: now(),
  });
  const cid = data.companyId || companyId || "DEMO";
  console.log(`[♻️ Cache] Revalidating "offDayRequests-${cid}" tag after UPDATE`);
  revalidateTag(`offDayRequests-${cid}`, "max");
}

export async function deleteOffDayRequest(id: string, companyId: string = "DEMO"): Promise<void> {
  await db.collection("offDayRequests").doc(id).delete();
  console.log(`[♻️ Cache] Revalidating "offDayRequests-${companyId}" tag after DELETE`);
  revalidateTag(`offDayRequests-${companyId}`, "max");
}

/**
 * Fetch off-day requests for a specific handyman (uncached).
 * Used by handyman settings page where per-handyman caching is not needed.
 */
export async function getHandymanOffDayRequests(companyId: string, handymanId: string): Promise<OffDayRequest[]> {
  console.log(`[🔥 Firestore READ] offDayRequests for handyman ${handymanId} in company ${companyId}`);
  const snap = await db
    .collection("offDayRequests")
    .where("companyId", "==", companyId)
    .where("handymanId", "==", handymanId)
    .orderBy("requestedAt", "desc")
    .limit(100)
    .get();
  console.log(`[✅ Firestore] Loaded ${snap.docs.length} off-day requests for handyman ${handymanId}`);
  return snap.docs.map(docToOffDayRequest);
}

// ─── Handyman Settings ───────────────────────────────────────────────────────

export async function getHandymanSettings(handymanId: string): Promise<HandymanSettings> {
  console.log(`[🔥 Firestore READ] handymanSettings/${handymanId}`);
  const doc = await db.collection("handymanSettings").doc(handymanId).get();
  if (!doc.exists) {
    return { pushNotifications: true }; // Default settings
  }
  return doc.data() as HandymanSettings;
}

export async function updateHandymanSettings(handymanId: string, settings: HandymanSettings): Promise<HandymanSettings> {
  console.log(`[🔥 Firestore WRITE] handymanSettings/${handymanId}`);
  const ref = db.collection("handymanSettings").doc(handymanId);
  await ref.set(settings, { merge: true });
  const updated = await ref.get();
  return updated.data() as HandymanSettings;
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<void> {
  const DEMO_COMPANY_ID = "DEMO";
  
  // Create demo company
  const companyRef = db.collection("companies").doc(DEMO_COMPANY_ID);
  await companyRef.set({
    id: DEMO_COMPANY_ID,
    name: "ROSCO Demo Company",
    companyNameLower: "rosco demo company",
    companyCode: "ROSCO-DEMO",
    adminUid: "demo-admin",
    settings: {
      businessType: "general",
      phone: "+972-50-0000000",
      teamSize: "1-5",
    },
    createdAt: now(),
  });

  const batch = db.batch();

  const presets = [
    { name: "Basic Plumbing Repair", description: "Fix leaks, replace fittings", price: 250, category: "Plumbing", companyId: DEMO_COMPANY_ID },
    { name: "Pipe Installation", description: "Install or replace pipes", price: 450, category: "Plumbing", companyId: DEMO_COMPANY_ID },
    { name: "Electrical Outlet Fix", description: "Replace or repair outlets", price: 180, category: "Electrical", companyId: DEMO_COMPANY_ID },
    { name: "Light Fixture Installation", description: "Install ceiling/wall lights", price: 220, category: "Electrical", companyId: DEMO_COMPANY_ID },
    { name: "Tile Repair", description: "Repair broken/cracked tiles", price: 300, category: "Tiling", companyId: DEMO_COMPANY_ID },
    { name: "Tile Installation (per sqm)", description: "Full tile installation", price: 120, category: "Tiling", companyId: DEMO_COMPANY_ID },
    { name: "Painting - Room", description: "Paint single room walls", price: 800, category: "Painting", companyId: DEMO_COMPANY_ID },
    { name: "Door Lock Replacement", description: "Replace lock and keys", price: 350, category: "General", companyId: DEMO_COMPANY_ID },
    { name: "AC Unit Service", description: "Clean and service AC", price: 280, category: "HVAC", companyId: DEMO_COMPANY_ID },
    { name: "General Handyman (per hour)", description: "Hourly rate", price: 150, category: "General", companyId: DEMO_COMPANY_ID },
  ];

  for (const p of presets) {
    const ref = db.collection("servicePresets").doc();
    batch.set(ref, { ...p, id: ref.id });
  }

  const yosefRef = db.collection("handymen").doc();
  batch.set(yosefRef, {
    id: yosefRef.id, name: "Yosef Cohen",
    phone: "+972-50-1234567", email: "yosef@rosco.co.il",
    companyId: DEMO_COMPANY_ID,
    createdAt: now(),
  });

  const aviRef = db.collection("handymen").doc();
  batch.set(aviRef, {
    id: aviRef.id, name: "Avi Mizrahi",
    phone: "+972-52-9876543", email: "avi@rosco.co.il",
    companyId: DEMO_COMPANY_ID,
    createdAt: now(),
  });

  await batch.commit();
  revalidateTag(`handymen-${DEMO_COMPANY_ID}`, "max");
  revalidateTag(`presets-${DEMO_COMPANY_ID}`, "max");

  const jobs = [
    {
      companyId: DEMO_COMPANY_ID,
      clientName: "David Levy", clientPhone: "+972-54-1112223",
      clientEmail: "david.levy@email.com", title: "Kitchen Sink Repair",
      description: "Slow drain and small leak under cabinet.",
      date: new Date(Date.now() + 2 * 3600000).toISOString(),
      location: "Rothschild Blvd 45, Tel Aviv",
      status: "In Progress" as const, handymanId: yosefRef.id, handymanName: "Yosef Cohen",
    },
    {
      companyId: DEMO_COMPANY_ID,
      clientName: "Rachel Shapiro", clientPhone: "+972-58-3334445",
      clientEmail: "rachel.s@gmail.com", title: "Bathroom Tile Repair",
      description: "Three cracked tiles need replacing.",
      date: new Date(Date.now() + 5 * 3600000).toISOString(),
      location: "Ben Yehuda St 12, Tel Aviv",
      status: "Pending" as const, handymanId: yosefRef.id, handymanName: "Yosef Cohen",
    },
    {
      companyId: DEMO_COMPANY_ID,
      clientName: "Moshe Katz", clientPhone: "+972-50-5556667",
      clientEmail: "mkatz@business.com", title: "Office Electrical Work",
      description: "Install 4 new power outlets with surge protectors.",
      date: new Date(Date.now() + 26 * 3600000).toISOString(),
      location: "Azrieli Center Tower 1, Tel Aviv",
      status: "Pending" as const, handymanId: aviRef.id, handymanName: "Avi Mizrahi",
    },
    {
      companyId: DEMO_COMPANY_ID,
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
    companyId: DEMO_COMPANY_ID,
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
    companyId: DEMO_COMPANY_ID,
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

  console.log("✅ Firebase seed complete with DEMO company");
}
