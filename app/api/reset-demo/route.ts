import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebase-admin";

const DEMO_ADMIN_EMAIL = "demo-admin@rosco.app";
const DEMO_COMPANY_ID = "DEMO";

const now = () => new Date().toISOString();

// Helper: delete all docs in a Firestore query (batched)
async function deleteQuery(
  query: FirebaseFirestore.Query
): Promise<void> {
  const snapshot = await query.get();
  if (snapshot.empty) return;

  const batches: FirebaseFirestore.WriteBatch[] = [];
  let batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count++;
    if (count === 400) {
      batches.push(batch);
      batch = db.batch();
      count = 0;
    }
  }
  batches.push(batch);

  for (const b of batches) {
    await b.commit();
  }
}

// The 5 demo handymen profiles
const DEMO_HANDYMEN = [
  {
    docId: "demo-handyman-1",
    name: "John Smith",
    email: "handyman1@rosco-demo.com",
    phone: "+1-555-101-2001",
    specialties: ["Plumbing", "General"],
  },
  {
    docId: "demo-handyman-2",
    name: "Maria Garcia",
    email: "handyman2@rosco-demo.com",
    phone: "+1-555-102-2002",
    specialties: ["Electrical", "Lighting"],
  },
  {
    docId: "demo-handyman-3",
    name: "Ahmed Hassan",
    email: "handyman3@rosco-demo.com",
    phone: "+1-555-103-2003",
    specialties: ["Tiling", "Bathroom"],
  },
  {
    docId: "demo-handyman-4",
    name: "Li Wei",
    email: "handyman4@rosco-demo.com",
    phone: "+1-555-104-2004",
    specialties: ["Carpentry", "Shelving"],
  },
  {
    docId: "demo-handyman-5",
    name: "Sofia Rodriguez",
    email: "handyman5@rosco-demo.com",
    phone: "+1-555-105-2005",
    specialties: ["HVAC", "General Repairs"],
  },
];

export async function POST(request: Request) {
  try {
    // Optional: require a secret token to prevent abuse
    const body = await request.json().catch(() => ({}));
    const secret = body?.secret;
    if (process.env.DEMO_RESET_SECRET && secret !== process.env.DEMO_RESET_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Demo Reset] Starting demo data reset...");

    // 1. Delete ALL existing demo jobs
    await deleteQuery(
      db.collection("jobs").where("companyId", "==", DEMO_COMPANY_ID)
    );
    console.log("[Demo Reset] Deleted existing jobs");

    // 2. Delete ALL existing demo invoices
    await deleteQuery(
      db.collection("invoices").where("companyId", "==", DEMO_COMPANY_ID)
    );
    console.log("[Demo Reset] Deleted existing invoices");

    // 3. Delete ALL existing demo handymen documents (we'll recreate them cleanly)
    await deleteQuery(
      db.collection("handymen").where("companyId", "==", DEMO_COMPANY_ID)
    );
    console.log("[Demo Reset] Deleted existing handymen");

    // 4. Create 5 handymen documents
    const handymenBatch = db.batch();
    const seededHandymen: Array<{ id: string; name: string }> = [];

    for (const hm of DEMO_HANDYMEN) {
      const ref = db.collection("handymen").doc(hm.docId);
      handymenBatch.set(ref, {
        id: hm.docId,
        name: hm.name,
        email: hm.email,
        phone: hm.phone,
        specialties: hm.specialties,
        status: "active",
        companyId: DEMO_COMPANY_ID,
        createdAt: now(),
        updatedAt: now(),
      });
      seededHandymen.push({ id: hm.docId, name: hm.name });
    }

    await handymenBatch.commit();
    console.log(`[Demo Reset] Created ${seededHandymen.length} handymen`);

    // 5. Seed fresh jobs scheduled only for later this week (tomorrow → Sunday)
    const newJobs = generateDemoJobs(seededHandymen);

    const jobBatch = db.batch();
    for (const job of newJobs) {
      const jobRef = db.collection("jobs").doc();
      jobBatch.set(jobRef, {
        ...job,
        id: jobRef.id,
        companyId: DEMO_COMPANY_ID,
        createdAt: now(),
        updatedAt: now(),
      });
    }

    await jobBatch.commit();
    console.log(`[Demo Reset] Created ${newJobs.length} new jobs`);

    return NextResponse.json({
      success: true,
      stats: {
        handymenCreated: seededHandymen.length,
        jobsCreated: newJobs.length,
        invoicesCreated: 0,
      },
    });
  } catch (error: any) {
    console.error("[Demo Reset] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset demo" },
      { status: 500 }
    );
  }
}

// ─── Job Generation ──────────────────────────────────────────────────────────

/**
 * Returns a random date between tomorrow and the end of the current week (Sunday),
 * with a random hour between 9am and 3pm.
 */
function getDateLaterThisWeek(offsetDays: number): string {
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // Days until end of week (Sunday). If today is Sunday, end of week = today.
  const daysUntilSunday = (7 - todayDay) % 7;

  // "Later this week" = tomorrow (1) through Sunday (daysUntilSunday).
  // If today is Saturday, daysUntilSunday = 1, so only tomorrow (Sunday) is available.
  // If today is Sunday, daysUntilSunday = 0 — use next week's days as fallback.
  const maxOffset = daysUntilSunday > 0 ? daysUntilSunday : 7;

  // Clamp offsetDays (1-based) to the available range
  const clampedOffset = Math.min(offsetDays, maxOffset);

  const d = new Date(today);
  d.setDate(today.getDate() + clampedOffset);
  d.setHours(9 + Math.floor(Math.random() * 7), 0, 0, 0); // 9am–3pm
  return d.toISOString();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDemoJobs(
  handymen: Array<{ id: string; name: string }>
): Array<{
  title: string;
  description: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  status: "Pending" | "In Progress";
  estimatedCost: number;
  actualCost: number;
  date: string;
  handymanId: string;
  handymanName: string;
}> {
  const clients = [
    { name: "Thabo Mokoena", phone: "+1-555-234-5678", email: "thabo.mokoena@gmail.com" },
    { name: "Johan Botha", phone: "+1-555-345-6789", email: "johan.botha@outlook.com" },
    { name: "Nomsa Dlamini", phone: "+1-555-456-7890", email: "nomsa.dlamini@gmail.com" },
    { name: "Pieter Nel", phone: "+1-555-567-8901", email: "pieter.nel@gmail.com" },
    { name: "Ayanda Sithole", phone: "+1-555-678-9012", email: "ayanda.s@gmail.com" },
    { name: "Charlene Davids", phone: "+1-555-789-0123", email: "charlene.davids@gmail.com" },
    { name: "Siphamandla Zulu", phone: "+1-555-890-1234", email: "siphamandla.z@gmail.com" },
    { name: "Megan Fourie", phone: "+1-555-901-2345", email: "megan.fourie@gmail.com" },
  ];

  const locations = [
    "15 Long Street, Cape Town City Centre",
    "42 Kloof Street, Gardens, Cape Town",
    "88 Bree Street, Cape Town CBD",
    "7 Ocean View Drive, Sea Point",
    "23 Main Road, Claremont",
    "5 Firgrove Way, Constantia",
    "110 Voortrekker Road, Bellville",
    "34 Victoria Road, Camps Bay",
  ];

  const jobTemplates = [
    { title: "Kitchen Sink Plumbing Repair", description: "Persistent drip under the kitchen sink — need trap and supply line replaced.", estimatedCost: 950 },
    { title: "Ceiling Light Installation", description: "Install two new LED ceiling fixtures in the lounge and dining room.", estimatedCost: 1200 },
    { title: "Bathroom Tile Re-grouting", description: "Shower tiles are cracking and leaking. Re-grout and seal full shower.", estimatedCost: 1800 },
    { title: "Garden Gate Lock Replacement", description: "Old deadbolt on garden gate is seized. Replace with new lock and two sets of keys.", estimatedCost: 700 },
    { title: "Air Conditioner Service", description: "Annual service and clean of split-unit AC in master bedroom.", estimatedCost: 1100 },
    { title: "Drywall Crack Repair & Paint", description: "Hairline cracks in lounge ceiling. Fill, sand and spot-paint to match.", estimatedCost: 1400 },
    { title: "Outdoor Tap Installation", description: "Install new tap on rear exterior wall connected to main supply.", estimatedCost: 1600 },
    { title: "Electrical DB Board Inspection", description: "DB board tripping intermittently. Full safety inspection and report.", estimatedCost: 950 },
  ];

  // Determine how many days are available later this week
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun
  const daysUntilSunday = (7 - todayDay) % 7;
  const availableDays = daysUntilSunday > 0 ? daysUntilSunday : 7; // at least 1 day

  // Spread 7 jobs across available days (days 1 through availableDays)
  const totalJobs = Math.min(7, jobTemplates.length);

  // Assign day offsets: spread evenly from 1..availableDays, deduplicate-ish
  const dayOffsets: number[] = [];
  for (let i = 0; i < totalJobs; i++) {
    // evenly distribute across [1, availableDays]
    const offset = 1 + Math.round((i / (totalJobs - 1 || 1)) * (availableDays - 1));
    dayOffsets.push(Math.max(1, Math.min(offset, availableDays)));
  }

  // Shuffle handymen assignment: distribute jobs round-robin with a shuffle
  const shuffledHandymen = [...handymen].sort(() => Math.random() - 0.5);

  const jobs = [];
  for (let i = 0; i < totalJobs; i++) {
    const template = jobTemplates[i];
    const client = clients[i % clients.length];
    const hm = shuffledHandymen[i % shuffledHandymen.length];

    // Mostly "Pending", first 1-2 jobs are "In Progress"
    const status: "Pending" | "In Progress" = i < 2 ? "In Progress" : "Pending";

    jobs.push({
      title: template.title,
      description: template.description,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      location: locations[i % locations.length],
      status,
      estimatedCost: template.estimatedCost,
      actualCost: 0,
      date: getDateLaterThisWeek(dayOffsets[i]),
      handymanId: hm.id,
      handymanName: hm.name,
    });
  }

  return jobs;
}
