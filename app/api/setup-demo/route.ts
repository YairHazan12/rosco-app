import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebase-admin";

const DEMO_ADMIN_EMAIL = "demo-admin@rosco.app";
const DEMO_ADMIN_PASSWORD = "demo123456";
const DEMO_HANDYMAN_EMAIL = "demo-handyman@rosco.app";
const DEMO_HANDYMAN_PASSWORD = "demo123456";
const DEMO_COMPANY_ID = "DEMO";

const now = () => new Date().toISOString();

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (!role || (role !== "admin" && role !== "handyman")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const auth = getAuth();

    const email = role === "admin" ? DEMO_ADMIN_EMAIL : DEMO_HANDYMAN_EMAIL;
    const password = role === "admin" ? DEMO_ADMIN_PASSWORD : DEMO_HANDYMAN_PASSWORD;
    const displayName = role === "admin" ? "Demo Admin" : "Demo Handyman";

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // User doesn't exist, create it
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
        });
      } else {
        throw error;
      }
    }

    // OPTIMIZATION: Early return if user doc already exists
    const userRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Ensure handyman doc is linked for the demo handyman user
      if (role === "handyman") {
        await ensureDemoHandymanDoc(userRecord.uid);
      }
      // User already fully set up, return immediately
      return NextResponse.json({ success: true, uid: userRecord.uid, cached: true });
    }

    // Create Firestore user document (only if doesn't exist)
    await userRef.set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      companyId: DEMO_COMPANY_ID,
      onboardingComplete: true,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    });

    // Ensure demo company exists
    const companyRef = db.collection("companies").doc(DEMO_COMPANY_ID);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      await companyRef.set({
        id: DEMO_COMPANY_ID,
        name: "Cape Town Handyman Services",
        companyNameLower: "cape town handyman services",
        companyCode: "CTHS-DEMO",
        adminUid: role === "admin" ? userRecord.uid : "demo-admin",
        settings: {
          businessType: "handyman",
          phone: "+27-21-555-0100",
          email: "admin@cthservices.co.za",
          address: "15 Bree Street, Cape Town City Centre, 8001",
          teamSize: "5-10",
        },
        createdAt: now(),
      });
    }

    // Ensure handyman doc is linked for the demo handyman user
    if (role === "handyman") {
      await ensureDemoHandymanDoc(userRecord.uid);
    }

    // Seed demo data if it doesn't exist
    await seedDemoData(role === "handyman" ? userRecord.uid : null);

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Setup demo error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup demo" },
      { status: 500 }
    );
  }
}

async function ensureDemoHandymanDoc(uid: string): Promise<void> {
  const handymanDocRef = db.collection("handymen").doc(uid);
  const handymanDoc = await handymanDocRef.get();
  if (!handymanDoc.exists) {
    await handymanDocRef.set({
      id: uid,
      name: "Demo Handyman",
      email: DEMO_HANDYMAN_EMAIL,
      phone: "+27-81-000-0002",
      specialties: ["Plumbing", "General"],
      status: "active",
      companyId: DEMO_COMPANY_ID,
      createdAt: now(),
      updatedAt: now(),
    });
  } else {
    // Ensure it's active and in the right company
    const data = handymanDoc.data() as { companyId?: string; status?: string };
    if (data.companyId !== DEMO_COMPANY_ID || data.status !== "active") {
      await handymanDocRef.update({
        companyId: DEMO_COMPANY_ID,
        status: "active",
        updatedAt: now(),
      });
    }
  }
}

async function seedDemoData(demoHandymanUid: string | null = null) {
  // Check if demo data already exists
  const existingJobs = await db
    .collection("jobs")
    .where("companyId", "==", DEMO_COMPANY_ID)
    .limit(1)
    .get();

  if (!existingJobs.empty) {
    // Demo data already exists, skip seeding
    return;
  }

  console.log("Seeding demo data for Cape Town Handyman Services...");

  // Use batch writes for better performance
  const batch = db.batch();

  // Create settings
  const settingsRef = db.collection("settings").doc(DEMO_COMPANY_ID);
  const settingsDoc = await settingsRef.get();
  
  if (!settingsDoc.exists) {
    batch.set(settingsRef, {
      companyId: DEMO_COMPANY_ID,
      currency: "ZAR",
      language: "en",
      timezone: "Africa/Johannesburg",
      vatEnabled: true,
      vatRate: 0.15,
      createdAt: now(),
    });
  }

  // Create service presets
  const presets = [
    { name: "Basic Plumbing Repair", description: "Fix leaks, replace fittings, unblock drains", price: 850, category: "Plumbing" },
    { name: "Pipe Installation", description: "Install or replace pipes (kitchen/bathroom)", price: 1500, category: "Plumbing" },
    { name: "Electrical Outlet Repair", description: "Replace or repair wall outlets and switches", price: 600, category: "Electrical" },
    { name: "Light Fixture Installation", description: "Install ceiling/wall lights with wiring", price: 1200, category: "Electrical" },
    { name: "DB Board Inspection", description: "Electrical distribution board safety check", price: 950, category: "Electrical" },
    { name: "Interior Room Painting", description: "Paint single room walls and ceiling", price: 3500, category: "Painting" },
    { name: "Exterior Wall Painting", description: "Exterior wall prep and painting", price: 5500, category: "Painting" },
    { name: "Tile Repair & Replacement", description: "Repair cracked/broken tiles", price: 1200, category: "Tiling" },
    { name: "Kitchen/Bathroom Tiling (per sqm)", description: "Full tile installation", price: 450, category: "Tiling" },
    { name: "Carpentry - Shelving", description: "Custom shelf installation", price: 2200, category: "Carpentry" },
    { name: "Door Lock Replacement", description: "Replace lock and provide new keys", price: 750, category: "General" },
    { name: "HVAC Service & Cleaning", description: "Clean and service air conditioning unit", price: 1100, category: "HVAC" },
    { name: "General Handyman (hourly)", description: "Hourly rate for general repairs", price: 350, category: "General" },
  ];

  for (const p of presets) {
    const ref = db.collection("servicePresets").doc();
    batch.set(ref, { ...p, id: ref.id, companyId: DEMO_COMPANY_ID, createdAt: now() });
  }

  // Create handymen with South African names and specialties
  const handymen = [
    {
      name: "Sipho Ndlovu",
      phone: "+27-82-456-7891",
      email: "sipho.ndlovu@cthservices.co.za",
      specialties: ["Plumbing", "General"],
      status: "active",
    },
    {
      name: "Pieter van der Merwe",
      phone: "+27-83-567-8902",
      email: "pieter.vdm@cthservices.co.za",
      specialties: ["Electrical", "HVAC"],
      status: "active",
    },
    {
      name: "Thandiwe Khumalo",
      phone: "+27-71-678-9013",
      email: "thandiwe.k@cthservices.co.za",
      specialties: ["Carpentry", "Tiling"],
      status: "active",
    },
    {
      name: "Jaco Erasmus",
      phone: "+27-84-789-0124",
      email: "jaco.erasmus@cthservices.co.za",
      specialties: ["Painting", "General"],
      status: "active",
    },
    {
      name: "Lindiwe Mahlangu",
      phone: "+27-72-890-1235",
      email: "lindiwe.m@cthservices.co.za",
      specialties: ["HVAC", "Electrical"],
      status: "active",
    },
  ];

  const handymanRefs: Array<{ id: string; name: string }> = [];
  
  for (const hm of handymen) {
    const ref = db.collection("handymen").doc();
    batch.set(ref, {
      ...hm,
      id: ref.id,
      companyId: DEMO_COMPANY_ID,
      createdAt: now(),
      updatedAt: now(),
    });
    handymanRefs.push({ id: ref.id, name: hm.name });
  }

  // Commit first batch (settings + presets + handymen)
  await batch.commit();

  // Create second batch for jobs and invoice
  const batch2 = db.batch();

  // Helper to get a date N days from now (with morning time)
  const futureDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  // Use the demo handyman UID if available, otherwise fall back to seeded handymen
  const demoHmId = demoHandymanUid ?? handymanRefs[0].id;
  const demoHmName = demoHandymanUid ? "Demo Handyman" : handymanRefs[0].name;

  // Create sample jobs — mix of completed (past), in-progress (today/tomorrow), pending (upcoming)
  const sampleJobs = [
    {
      title: "Kitchen Sink Leak Repair",
      description: "Persistent leak under kitchen sink. Need urgent repair.",
      clientName: "Thabo Mokoena",
      clientPhone: "+27-82-234-5678",
      clientEmail: "thabo.mokoena@example.co.za",
      location: "15 Long Street, Cape Town City Centre",
      status: "Completed",
      estimatedCost: 1200,
      actualCost: 1350,
      date: futureDays(-3),
      handymanId: demoHmId,
      handymanName: demoHmName,
    },
    {
      title: "Bedroom Ceiling Light Installation",
      description: "Install new ceiling light fixture in master bedroom.",
      clientName: "Johan Botha",
      clientPhone: "+27-83-345-6789",
      clientEmail: "johan.botha@example.co.za",
      location: "42 Kloof Street, Gardens, Cape Town",
      status: "In Progress",
      estimatedCost: 1400,
      actualCost: 0,
      date: futureDays(0),
      handymanId: demoHmId,
      handymanName: demoHmName,
    },
    {
      title: "Custom Kitchen Shelving",
      description: "Build and install floating shelves in kitchen.",
      clientName: "Nomsa Dlamini",
      clientPhone: "+27-71-456-7890",
      clientEmail: "nomsa.dlamini@example.co.za",
      location: "88 Bree Street, Cape Town CBD",
      status: "Pending",
      estimatedCost: 2800,
      actualCost: 0,
      date: futureDays(5),
      handymanId: demoHmId,
      handymanName: demoHmName,
    },
    {
      title: "Air Conditioner Service",
      description: "Annual service and clean of split-unit AC in master bedroom.",
      clientName: "Ayanda Sithole",
      clientPhone: "+27-72-678-9012",
      clientEmail: "ayanda.s@example.co.za",
      location: "7 Ocean View Drive, Sea Point",
      status: "Pending",
      estimatedCost: 1100,
      actualCost: 0,
      date: futureDays(8),
      handymanId: handymanRefs[1].id,
      handymanName: handymanRefs[1].name,
    },
    {
      title: "Electrical DB Board Inspection",
      description: "DB board tripping intermittently. Full safety inspection and report.",
      clientName: "Charlene Davids",
      clientPhone: "+27-61-789-0123",
      clientEmail: "charlene.davids@example.co.za",
      location: "23 Main Road, Claremont",
      status: "Pending",
      estimatedCost: 950,
      actualCost: 0,
      date: futureDays(10),
      handymanId: handymanRefs[1].id,
      handymanName: handymanRefs[1].name,
    },
  ];

  const jobRefs: Array<{ id: string; ref: FirebaseFirestore.DocumentReference; status: string; actualCost: number; clientName: string; clientPhone: string; clientEmail: string; title: string; date: string; location: string; handymanName: string }> = [];

  for (const job of sampleJobs) {
    const jobRef = db.collection("jobs").doc();
    batch2.set(jobRef, {
      ...job,
      id: jobRef.id,
      companyId: DEMO_COMPANY_ID,
      createdAt: now(),
      updatedAt: now(),
    });
    jobRefs.push({
      id: jobRef.id,
      ref: jobRef,
      status: job.status,
      actualCost: job.actualCost,
      clientName: job.clientName,
      clientPhone: job.clientPhone,
      clientEmail: job.clientEmail,
      title: job.title,
      date: job.date,
      location: job.location,
      handymanName: job.handymanName,
    });
  }

  // Create invoice for completed job
  const completedJob = jobRefs.find(j => j.status === "Completed");
  if (completedJob) {
    const items = [
      {
        id: "1",
        description: "Labor",
        quantity: 1,
        unitPrice: 900,
        total: 900,
      },
      {
        id: "2",
        description: "Materials and parts",
        quantity: 1,
        unitPrice: 450,
        total: 450,
      },
    ];
    
    const subtotal = 1350;
    const vatAmount = Math.round(subtotal * 0.15);
    const total = subtotal + vatAmount;

    const invoiceRef = db.collection("invoices").doc();
    batch2.set(invoiceRef, {
      id: invoiceRef.id,
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
      vatRate: 0.15,
      vatAmount,
      total,
      status: "Paid",
      createdAt: now(),
      updatedAt: now(),
    });

    // Link invoice to job
    batch2.update(completedJob.ref, { invoiceId: invoiceRef.id });
  }

  // Commit second batch
  await batch2.commit();

  console.log("Demo data seeding complete!");
}
