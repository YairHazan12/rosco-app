import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebase-admin";
import type { FieldValue } from "firebase-admin/firestore";

const DEMO_ADMIN_EMAIL = "demo-admin@rosco.app";
const DEMO_HANDYMAN_EMAIL = "demo-handyman@rosco.app";
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

export async function POST(request: Request) {
  try {
    // Optional: require a secret token to prevent abuse
    const body = await request.json().catch(() => ({}));
    const secret = body?.secret;
    if (process.env.DEMO_RESET_SECRET && secret !== process.env.DEMO_RESET_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Demo Reset] Starting demo data reset...");

    // 1. Get Firebase UIDs for demo accounts
    const auth = getAuth();
    let adminUid: string | null = null;
    let handymanUid: string | null = null;

    try {
      const adminUser = await auth.getUserByEmail(DEMO_ADMIN_EMAIL);
      adminUid = adminUser.uid;
    } catch {}

    try {
      const handymanUser = await auth.getUserByEmail(DEMO_HANDYMAN_EMAIL);
      handymanUid = handymanUser.uid;
    } catch {}

    // 2. Delete existing demo jobs
    await deleteQuery(
      db.collection("jobs").where("companyId", "==", DEMO_COMPANY_ID)
    );
    console.log("[Demo Reset] Deleted existing jobs");

    // 3. Delete existing demo invoices
    await deleteQuery(
      db.collection("invoices").where("companyId", "==", DEMO_COMPANY_ID)
    );
    console.log("[Demo Reset] Deleted existing invoices");

    // 4. Ensure handymen documents exist for demo accounts
    // Get existing handymen for the demo company
    const handymenSnap = await db
      .collection("handymen")
      .where("companyId", "==", DEMO_COMPANY_ID)
      .where("status", "==", "active")
      .get();

    const existingHandymen: Array<{ id: string; name: string }> = [];
    handymenSnap.forEach((doc) => {
      existingHandymen.push({ id: doc.id, name: doc.data().name });
    });

    // Ensure the demo handyman Firebase user has a handyman document using their UID
    let demoHandymanEntry: { id: string; name: string } | null = null;

    if (handymanUid) {
      const handymanDocRef = db.collection("handymen").doc(handymanUid);
      const handymanDoc = await handymanDocRef.get();
      if (!handymanDoc.exists) {
        await handymanDocRef.set({
          id: handymanUid,
          name: "Demo Handyman",
          email: DEMO_HANDYMAN_EMAIL,
          phone: "+27-81-000-0002",
          specialties: ["Plumbing", "General"],
          status: "active",
          companyId: DEMO_COMPANY_ID,
          createdAt: now(),
          updatedAt: now(),
        });
        console.log("[Demo Reset] Created handyman doc for demo handyman UID");
      } else {
        // Ensure it's active
        await handymanDocRef.update({ status: "active", updatedAt: now() });
      }
      demoHandymanEntry = { id: handymanUid, name: "Demo Handyman" };
    }

    // Build full handyman list for job assignment
    const allHandymen: Array<{ id: string; name: string }> = [];
    
    // Add demo handyman first (so they get jobs)
    if (demoHandymanEntry) {
      allHandymen.push(demoHandymanEntry);
    }

    // Add other seeded handymen (excluding the demo handyman UID)
    for (const hm of existingHandymen) {
      if (hm.id !== handymanUid) {
        allHandymen.push(hm);
      }
    }

    // If no handymen exist besides demo user, use demo user for all jobs
    if (allHandymen.length === 0) {
      // Fallback: create placeholder entries
      allHandymen.push({ id: "handyman-1", name: "Sipho Ndlovu" });
    }

    // 5. Seed fresh jobs with dates in the next 7–14 days
    const newJobs = generateDemoJobs(allHandymen, handymanUid);
    
    const batch = db.batch();
    const jobRefs: Array<{
      id: string;
      ref: FirebaseFirestore.DocumentReference;
      job: ReturnType<typeof generateDemoJobs>[number];
    }> = [];

    for (const job of newJobs) {
      const jobRef = db.collection("jobs").doc();
      batch.set(jobRef, {
        ...job,
        id: jobRef.id,
        companyId: DEMO_COMPANY_ID,
        createdAt: now(),
        updatedAt: now(),
      });
      jobRefs.push({ id: jobRef.id, ref: jobRef, job });
    }

    await batch.commit();
    console.log(`[Demo Reset] Created ${newJobs.length} new jobs`);

    // 6. Create invoices for completed jobs
    const batch2 = db.batch();
    const completedJobs = jobRefs.filter((jr) => jr.job.status === "Completed");

    for (const { id: jobId, ref: jobRef, job } of completedJobs) {
      const subtotal = job.actualCost;
      const vatAmount = Math.round(subtotal * 0.15);
      const total = subtotal + vatAmount;

      const items = [
        {
          id: "1",
          description: "Labor",
          quantity: 1,
          unitPrice: Math.round(subtotal * 0.65),
          total: Math.round(subtotal * 0.65),
        },
        {
          id: "2",
          description: "Materials and parts",
          quantity: 1,
          unitPrice: Math.round(subtotal * 0.35),
          total: Math.round(subtotal * 0.35),
        },
      ];

      const invoiceRef = db.collection("invoices").doc();
      batch2.set(invoiceRef, {
        id: invoiceRef.id,
        companyId: DEMO_COMPANY_ID,
        jobId,
        clientName: job.clientName,
        clientEmail: job.clientEmail,
        clientPhone: job.clientPhone,
        jobTitle: job.title,
        jobDate: job.date,
        jobLocation: job.location,
        handymanName: job.handymanName,
        items,
        subtotal,
        vatEnabled: true,
        vatRate: 0.15,
        vatAmount,
        total,
        status: "Paid",
        createdAt: now(),
        updatedAt: now(),
      });

      batch2.update(jobRef, { invoiceId: invoiceRef.id });
    }

    await batch2.commit();
    console.log(`[Demo Reset] Created ${completedJobs.length} invoices`);

    return NextResponse.json({
      success: true,
      stats: {
        jobsCreated: newJobs.length,
        invoicesCreated: completedJobs.length,
        handymanLinked: !!demoHandymanEntry,
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

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9 + Math.floor(Math.random() * 6), 0, 0, 0); // 9am-3pm
  return d.toISOString();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDemoJobs(
  handymen: Array<{ id: string; name: string }>,
  demoHandymanUid: string | null
): Array<{
  title: string;
  description: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  status: "Pending" | "In Progress" | "Completed";
  estimatedCost: number;
  actualCost: number;
  date: string;
  handymanId: string;
  handymanName: string;
}> {
  const getHandyman = (forDemo = false) => {
    if (forDemo && demoHandymanUid) {
      const demoHm = handymen.find((h) => h.id === demoHandymanUid);
      if (demoHm) return demoHm;
    }
    return pick(handymen);
  };

  // Cape Town clients
  const clients = [
    { name: "Thabo Mokoena", phone: "+27-82-234-5678", email: "thabo.mokoena@gmail.com" },
    { name: "Johan Botha", phone: "+27-83-345-6789", email: "johan.botha@outlook.com" },
    { name: "Nomsa Dlamini", phone: "+27-71-456-7890", email: "nomsa.dlamini@gmail.com" },
    { name: "Pieter Nel", phone: "+27-84-567-8901", email: "pieter.nel@gmail.com" },
    { name: "Ayanda Sithole", phone: "+27-72-678-9012", email: "ayanda.s@gmail.com" },
    { name: "Charlene Davids", phone: "+27-61-789-0123", email: "charlene.davids@gmail.com" },
    { name: "Siphamandla Zulu", phone: "+27-73-890-1234", email: "siphamandla.z@gmail.com" },
    { name: "Megan Fourie", phone: "+27-79-901-2345", email: "megan.fourie@gmail.com" },
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

  type JobTemplate = {
    title: string;
    description: string;
    estimatedCost: number;
    actualCost?: number;
  };

  const jobTemplates: JobTemplate[] = [
    { title: "Kitchen Sink Plumbing Repair", description: "Persistent drip under the kitchen sink — need trap and supply line replaced.", estimatedCost: 950 },
    { title: "Ceiling Light Installation", description: "Install two new LED ceiling fixtures in the lounge and dining room.", estimatedCost: 1200 },
    { title: "Bathroom Tile Re-grouting", description: "Shower tiles are cracking and leaking. Re-grout and seal full shower.", estimatedCost: 1800 },
    { title: "Garden Gate Lock Replacement", description: "Old deadbolt on garden gate is seized. Replace with new lock and two sets of keys.", estimatedCost: 700 },
    { title: "Air Conditioner Service", description: "Annual service and clean of split-unit AC in master bedroom.", estimatedCost: 1100 },
    { title: "Drywall Crack Repair & Paint", description: "Hairline cracks in lounge ceiling. Fill, sand and spot-paint to match.", estimatedCost: 1400 },
    { title: "Outdoor Tap Installation", description: "Install new tap on rear exterior wall connected to main supply.", estimatedCost: 1600 },
    { title: "Electrical DB Board Inspection", description: "DB board tripping intermittently. Full safety inspection and report.", estimatedCost: 950 },
    { title: "Custom Shelving — Home Office", description: "Build and install three floating shelves above the desk in study.", estimatedCost: 2200 },
    { title: "Hot Water Geyser Service", description: "Geyser pressure valve leaking. Replace valve and test system.", estimatedCost: 1350 },
    { title: "Fence Post Repair", description: "Two fence posts leaning after heavy rain. Re-cement and straighten.", estimatedCost: 850 },
    { title: "Bathroom Extractor Fan Install", description: "Install new extractor fan and ducting through external wall.", estimatedCost: 1500 },
  ];

  const jobs = [];

  // --- COMPLETED jobs (past 1-3 days, assigned to various handymen) ---
  for (let i = 0; i < 3; i++) {
    const template = jobTemplates[i];
    const client = clients[i];
    const daysAgo = -(1 + i); // -1, -2, -3
    const hm = getHandyman(i === 0); // first completed job goes to demo handyman
    const actualCost = Math.round(template.estimatedCost * (0.95 + Math.random() * 0.2));
    jobs.push({
      ...template,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      location: locations[i],
      status: "Completed" as const,
      estimatedCost: template.estimatedCost,
      actualCost,
      date: daysFromNow(daysAgo),
      handymanId: hm.id,
      handymanName: hm.name,
    });
  }

  // --- IN PROGRESS jobs (today and tomorrow) ---
  for (let i = 0; i < 2; i++) {
    const template = jobTemplates[3 + i];
    const client = clients[3 + i];
    const hm = getHandyman(i === 0); // first in-progress goes to demo handyman
    jobs.push({
      ...template,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      location: locations[3 + i],
      status: "In Progress" as const,
      estimatedCost: template.estimatedCost,
      actualCost: 0,
      date: daysFromNow(i), // today or tomorrow
      handymanId: hm.id,
      handymanName: hm.name,
    });
  }

  // --- PENDING jobs (next 7-14 days) ---
  const upcomingDays = [3, 5, 7, 8, 10, 11, 14];
  for (let i = 0; i < 7; i++) {
    const template = jobTemplates[5 + i];
    const client = clients[i % clients.length];
    const hm = getHandyman(i === 0 || i === 3); // give demo handyman a few pending jobs
    jobs.push({
      ...template,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      location: locations[i % locations.length],
      status: "Pending" as const,
      estimatedCost: template.estimatedCost,
      actualCost: 0,
      date: daysFromNow(upcomingDays[i]),
      handymanId: hm.id,
      handymanName: hm.name,
    });
  }

  return jobs;
}
