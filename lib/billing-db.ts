/**
 * Billing-specific Firestore operations.
 * Server-side only (uses firebase-admin).
 *
 * Collections:
 *   quotes           – Quote documents
 *   billingInvoices  – Full-featured billing invoices (separate from simple /invoices)
 *   billingCounters  – Per-company auto-increment counters
 */

import { db } from "./firebase-admin";
import type { Quote, BillingInvoice, BillingCounters, QuoteStatus, BillingInvoiceStatus } from "./billing-types";

const now = () => new Date().toISOString();

// ─── Serialization ────────────────────────────────────────────────────────────

function serializeDoc<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  const data = doc.data() ?? {};
  const serialized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value && typeof (value as {toDate: () => Date}).toDate === "function") {
      serialized[key] = (value as {toDate: () => Date}).toDate().toISOString();
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      // Shallow serialize nested (for activityLog items etc.)
      const nested: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        if (v && typeof v === "object" && "toDate" in (v as Record<string, unknown>)) {
          nested[k] = ((v as {toDate: () => Date}).toDate()).toISOString();
        } else {
          nested[k] = v;
        }
      }
      serialized[key] = nested;
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((item) => {
        if (item && typeof item === "object") {
          const si: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(item)) {
            if (v && typeof v === "object" && "toDate" in (v as Record<string, unknown>)) {
              si[k] = ((v as {toDate: () => Date}).toDate()).toISOString();
            } else {
              si[k] = v;
            }
          }
          return si;
        }
        return item;
      });
    } else {
      serialized[key] = value;
    }
  }
  return { id: doc.id, ...serialized } as T;
}

// ─── Document Number Generation ───────────────────────────────────────────────

/**
 * Atomically increments the counter and returns the new document number string.
 * e.g. "RQ-0001", "RI-0012"
 */
export async function getNextDocumentNumber(
  companyId: string,
  type: "quote" | "invoice"
): Promise<string> {
  const counterRef = db.collection("billingCounters").doc(companyId);
  const field = type === "quote" ? "lastQuoteNumber" : "lastInvoiceNumber";
  const prefix = type === "quote" ? "RQ" : "RI";

  let next = 1;
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(counterRef);
    const current: number = doc.exists ? ((doc.data() as Partial<BillingCounters>)[field] ?? 0) : 0;
    next = current + 1;
    tx.set(counterRef, { [field]: next, updatedAt: now() }, { merge: true });
  });

  return `${prefix}-${String(next).padStart(4, "0")}`;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function getQuotes(companyId: string): Promise<Quote[]> {
  const snap = await db
    .collection("quotes")
    .where("companyId", "==", companyId)
    .limit(500)
    .get();
  const docs = snap.docs.map((d) => serializeDoc<Quote>(d));
  return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getQuote(id: string, companyId: string): Promise<Quote | null> {
  const doc = await db.collection("quotes").doc(id).get();
  if (!doc.exists) return null;
  const q = serializeDoc<Quote>(doc);
  if (q.companyId !== companyId) return null;
  return q;
}

export async function createQuote(
  companyId: string,
  data: Omit<Quote, "id" | "createdAt" | "updatedAt">
): Promise<Quote> {
  const ts = now();
  const ref = db.collection("quotes").doc();
  const doc: Omit<Quote, "id"> = { ...data, companyId, createdAt: ts, updatedAt: ts };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function updateQuote(
  id: string,
  companyId: string,
  updates: Partial<Omit<Quote, "id" | "companyId" | "createdAt">>
): Promise<void> {
  await db.collection("quotes").doc(id).update({
    ...updates,
    updatedAt: now(),
  });
}

// ─── Billing Invoices ─────────────────────────────────────────────────────────

export async function getBillingInvoices(companyId: string): Promise<BillingInvoice[]> {
  const snap = await db
    .collection("billingInvoices")
    .where("companyId", "==", companyId)
    .limit(500)
    .get();
  const docs = snap.docs.map((d) => serializeDoc<BillingInvoice>(d));
  return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBillingInvoice(id: string, companyId: string): Promise<BillingInvoice | null> {
  const doc = await db.collection("billingInvoices").doc(id).get();
  if (!doc.exists) return null;
  const inv = serializeDoc<BillingInvoice>(doc);
  if (inv.companyId !== companyId) return null;
  return inv;
}

export async function createBillingInvoice(
  companyId: string,
  data: Omit<BillingInvoice, "id" | "createdAt" | "updatedAt">
): Promise<BillingInvoice> {
  const ts = now();
  const ref = db.collection("billingInvoices").doc();
  const doc: Omit<BillingInvoice, "id"> = { ...data, companyId, createdAt: ts, updatedAt: ts };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function updateBillingInvoice(
  id: string,
  companyId: string,
  updates: Partial<Omit<BillingInvoice, "id" | "companyId" | "createdAt">>
): Promise<void> {
  await db.collection("billingInvoices").doc(id).update({
    ...updates,
    updatedAt: now(),
  });
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function filterQuotesByStatus(quotes: Quote[], status: QuoteStatus | "all"): Quote[] {
  if (status === "all") return quotes;
  return quotes.filter((q) => q.status === status);
}

export function filterInvoicesByStatus(
  invoices: BillingInvoice[],
  status: BillingInvoiceStatus | "all"
): BillingInvoice[] {
  if (status === "all") return invoices;
  return invoices.filter((i) => i.status === status);
}

export function calcBillingStats(quotes: Quote[] | BillingInvoice[]) {
  const total = quotes.length;
  const outstanding = quotes
    .filter((d) => !["paid", "accepted", "draft", "expired"].includes(d.status))
    .reduce((s, d) => s + d.total, 0);
  const collected = quotes
    .filter((d) => d.status === "paid" || d.status === "accepted")
    .reduce((s, d) => s + d.total, 0);
  return { total, outstanding, collected };
}
