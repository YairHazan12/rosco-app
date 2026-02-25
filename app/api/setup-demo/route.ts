import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/firebase-admin";
import admin from "firebase-admin";

const DEMO_ADMIN_EMAIL = "demo-admin@rosco.app";
const DEMO_ADMIN_PASSWORD = "demo123456";
const DEMO_HANDYMAN_EMAIL = "demo-handyman@rosco.app";
const DEMO_HANDYMAN_PASSWORD = "demo123456";
const DEMO_COMPANY_ID = "DEMO";

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

    // Create or update Firestore user document
    const userRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid: userRecord.uid,
        email,
        displayName,
        role,
        companyId: DEMO_COMPANY_ID,
        onboardingComplete: true,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Ensure demo company exists
    const companyRef = db.collection("companies").doc(DEMO_COMPANY_ID);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      await companyRef.set({
        id: DEMO_COMPANY_ID,
        name: "ROSCO Demo Company",
        companyNameLower: "rosco demo company",
        companyCode: "ROSCO-DEMO",
        adminUid: role === "admin" ? userRecord.uid : "demo-admin",
        settings: {
          businessType: "general",
          phone: "+1-555-0100",
          teamSize: "5-10",
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Seed demo data if it doesn't exist
    await seedDemoData();

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Setup demo error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup demo" },
      { status: 500 }
    );
  }
}

async function seedDemoData() {
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

  // Create handymen with South African names
  const handymenData = [
    {
      name: "Sipho Ndlovu",
      phone: "+27-82-456-7891",
      specialties: ["plumbing", "general"],
      status: "active",
    },
    {
      name: "Pieter van der Merwe",
      phone: "+27-83-567-8902",
      specialties: ["electrical", "painting"],
      status: "active",
    },
    {
      name: "Thandiwe Khumalo",
      phone: "+27-71-678-9013",
      specialties: ["carpentry", "tiling"],
      status: "active",
    },
  ];

  const handymanIds: string[] = [];
  const handymanNames: string[] = [];
  for (const handymanData of handymenData) {
    const handymanRef = db.collection("handymen").doc();
    await handymanRef.set({
      ...handymanData,
      companyId: DEMO_COMPANY_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    handymanIds.push(handymanRef.id);
    handymanNames.push(handymanData.name);
  }

  // Create jobs with South African data
  const jobsData = [
    {
      title: "Kitchen Sink Repair",
      clientName: "Thabo Mokoena",
      clientPhone: "+27-82-234-5678",
      clientEmail: "thabo.mokoena@example.co.za",
      location: "Long Street 45, Cape Town",
      description: "Fix leaking kitchen sink and replace tap",
      status: "Completed",
      serviceType: "plumbing",
      estimatedCost: 1500,
      handymanId: handymanIds[0],
      handymanName: handymanNames[0],
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Ceiling Light Installation",
      clientName: "Johan Botha",
      clientPhone: "+27-83-345-6789",
      clientEmail: "johan.botha@example.co.za",
      location: "Nelson Mandela Square, Sandton",
      description: "Install ceiling lights in living room and bedroom",
      status: "In Progress",
      serviceType: "electrical",
      estimatedCost: 2800,
      handymanId: handymanIds[1],
      handymanName: handymanNames[1],
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Custom Bookshelf Build",
      clientName: "Nomsa Dlamini",
      clientPhone: "+27-71-456-7890",
      clientEmail: "nomsa.dlamini@example.co.za",
      location: "Florida Road 88, Durban",
      description: "Build custom bookshelf for home office",
      status: "Pending",
      serviceType: "carpentry",
      estimatedCost: 4500,
      handymanId: handymanIds[2],
      handymanName: handymanNames[2],
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Exterior Painting",
      clientName: "Andries Pretorius",
      clientPhone: "+27-82-567-8901",
      clientEmail: "andries.pretorius@example.co.za",
      location: "Church Street 123, Pretoria",
      description: "Paint exterior walls and front door",
      status: "Completed",
      serviceType: "painting",
      estimatedCost: 6200,
      handymanId: handymanIds[1],
      handymanName: handymanNames[1],
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Bathroom Tile Installation",
      clientName: "Zanele Nkosi",
      clientPhone: "+27-71-678-9012",
      clientEmail: "zanele.nkosi@example.co.za",
      location: "Kloof Street 56, Gardens",
      description: "Install new bathroom tiles and grout",
      status: "In Progress",
      serviceType: "tiling",
      estimatedCost: 3800,
      handymanId: handymanIds[2],
      handymanName: handymanNames[2],
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: "Drain Repair",
      clientName: "Jaco Erasmus",
      clientPhone: "+27-83-789-0123",
      clientEmail: "jaco.erasmus@example.co.za",
      location: "Bree Street 234, Cape Town CBD",
      description: "Fix blocked drain and replace pipe section",
      status: "Pending",
      serviceType: "plumbing",
      estimatedCost: 1200,
      handymanId: handymanIds[0],
      handymanName: handymanNames[0],
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const jobIds: string[] = [];
  for (const jobData of jobsData) {
    const jobRef = db.collection("jobs").doc();
    await jobRef.set({
      ...jobData,
      companyId: DEMO_COMPANY_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    jobIds.push(jobRef.id);
  }

  // Create invoices with South African data
  const invoicesData = [
    {
      jobId: jobIds[0],
      jobTitle: "Kitchen Sink Repair",
      jobDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      clientName: "Thabo Mokoena",
      clientPhone: "+27-82-234-5678",
      jobLocation: "Long Street 45, Cape Town",
      handymanName: handymanNames[0],
      status: "Paid",
      total: 1500,
      subtotal: 1500,
      vatEnabled: false,
      vatRate: 0,
      vatAmount: 0,
      items: [
        { id: "1", description: "Sink repair", quantity: 1, unitPrice: 800, total: 800 },
        { id: "2", description: "New tap installation", quantity: 1, unitPrice: 700, total: 700 },
      ],
    },
    {
      jobId: jobIds[1],
      jobTitle: "Ceiling Light Installation",
      jobDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      clientName: "Johan Botha",
      clientPhone: "+27-83-345-6789",
      jobLocation: "Nelson Mandela Square, Sandton",
      handymanName: handymanNames[1],
      status: "Sent",
      total: 2800,
      subtotal: 2800,
      vatEnabled: false,
      vatRate: 0,
      vatAmount: 0,
      items: [
        { id: "1", description: "Ceiling light installation", quantity: 2, unitPrice: 1200, total: 2400 },
        { id: "2", description: "Wiring and materials", quantity: 1, unitPrice: 400, total: 400 },
      ],
    },
    {
      jobId: jobIds[3],
      jobTitle: "Exterior Painting",
      jobDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      clientName: "Andries Pretorius",
      clientPhone: "+27-82-567-8901",
      jobLocation: "Church Street 123, Pretoria",
      handymanName: handymanNames[1],
      status: "Paid",
      total: 6200,
      subtotal: 6200,
      vatEnabled: false,
      vatRate: 0,
      vatAmount: 0,
      items: [
        { id: "1", description: "Exterior wall painting", quantity: 1, unitPrice: 4500, total: 4500 },
        { id: "2", description: "Door painting", quantity: 1, unitPrice: 1200, total: 1200 },
        { id: "3", description: "Paint and supplies", quantity: 1, unitPrice: 500, total: 500 },
      ],
    },
    {
      jobId: jobIds[4],
      jobTitle: "Bathroom Tile Installation",
      jobDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      clientName: "Zanele Nkosi",
      clientPhone: "+27-71-678-9012",
      jobLocation: "Kloof Street 56, Gardens",
      handymanName: handymanNames[2],
      status: "Draft",
      total: 3800,
      subtotal: 3800,
      vatEnabled: false,
      vatRate: 0,
      vatAmount: 0,
      items: [
        { id: "1", description: "Bathroom tile installation", quantity: 1, unitPrice: 3000, total: 3000 },
        { id: "2", description: "Grouting and finishing", quantity: 1, unitPrice: 800, total: 800 },
      ],
    },
  ];

  for (const invoiceData of invoicesData) {
    const invoiceRef = db.collection("invoices").doc();
    await invoiceRef.set({
      ...invoiceData,
      companyId: DEMO_COMPANY_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Create service presets
  const presetsData = [
    {
      name: "Basic Plumbing Repair",
      category: "plumbing",
      defaultPrice: 1200,
      description: "Standard plumbing repair including leak fixes and minor replacements",
    },
    {
      name: "Electrical Installation",
      category: "electrical",
      defaultPrice: 2500,
      description: "Install lights, outlets, or switches",
    },
    {
      name: "Interior Painting",
      category: "painting",
      defaultPrice: 3500,
      description: "Paint one room including preparation and cleanup",
    },
    {
      name: "General Handyman Service",
      category: "general",
      defaultPrice: 800,
      description: "General repairs and maintenance tasks",
    },
    {
      name: "Tile Installation",
      category: "general",
      defaultPrice: 2800,
      description: "Install tiles for bathroom or kitchen",
    },
  ];

  for (const presetData of presetsData) {
    const presetRef = db.collection("servicePresets").doc();
    await presetRef.set({
      ...presetData,
      companyId: DEMO_COMPANY_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  // Create settings
  await db.collection("settings").doc(DEMO_COMPANY_ID).set({
    currency: "ZAR",
    language: "en",
    timezone: "Africa/Johannesburg",
    companyId: DEMO_COMPANY_ID,
  });
}
