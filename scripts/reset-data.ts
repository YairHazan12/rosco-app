#!/usr/bin/env tsx
/**
 * Reset Firebase Data Script
 * 
 * Deletes all documents from all ROSCO collections and re-seeds with fresh demo data.
 * 
 * Run: npm run reset-data
 * Or: node -r dotenv/config node_modules/.bin/tsx scripts/reset-data.ts
 * 
 * NOTE: Must preload dotenv before firebase-admin initializes
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../.env") });

// Now import firebase-admin after env vars are loaded
import { db } from "../lib/firebase-admin";

const DEMO_COMPANY_ID = "DEMO";
const COLLECTIONS = ["jobs", "invoices", "handymen", "servicePresets", "settings", "companies"];

const now = () => new Date().toISOString();

interface DeleteStats {
  [collection: string]: number;
}

interface SeedStats {
  companies: number;
  servicePresets: number;
  handymen: number;
  jobs: number;
  invoices: number;
  settings: number;
}

async function deleteCollection(collectionName: string): Promise<number> {
  console.log(`🗑️  Deleting all documents from "${collectionName}"...`);
  const snapshot = await db.collection(collectionName).get();
  const count = snapshot.size;
  
  if (count === 0) {
    console.log(`   ✓ "${collectionName}" is already empty`);
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  
  console.log(`   ✓ Deleted ${count} documents from "${collectionName}"`);
  return count;
}

async function deleteAllData(): Promise<DeleteStats> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔥 DELETING ALL DATA FROM FIREBASE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const stats: DeleteStats = {};
  
  for (const collection of COLLECTIONS) {
    stats[collection] = await deleteCollection(collection);
  }
  
  return stats;
}

async function seedData(): Promise<SeedStats> {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 SEEDING FRESH DEMO DATA");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const stats: SeedStats = {
    companies: 0,
    servicePresets: 0,
    handymen: 0,
    jobs: 0,
    invoices: 0,
    settings: 0,
  };

  // 1. Create demo company - Cape Town Handyman Services
  console.log("🏢 Creating demo company...");
  const companyRef = db.collection("companies").doc(DEMO_COMPANY_ID);
  await companyRef.set({
    id: DEMO_COMPANY_ID,
    name: "Cape Town Handyman Services",
    companyNameLower: "cape town handyman services",
    companyCode: "CTHS-DEMO",
    adminUid: "demo-admin",
    settings: {
      businessType: "handyman",
      phone: "+27-21-555-0100",
      email: "admin@cthservices.co.za",
      address: "15 Bree Street, Cape Town City Centre, 8001",
      teamSize: "5-10",
    },
    createdAt: now(),
  });
  stats.companies = 1;
  console.log("   ✓ Created Cape Town Handyman Services");

  // 2. Create settings
  console.log("\n⚙️  Creating settings...");
  await db.collection("settings").doc(DEMO_COMPANY_ID).set({
    companyId: DEMO_COMPANY_ID,
    currency: "ZAR",
    language: "en",
    timezone: "Africa/Johannesburg",
    vatEnabled: true,
    vatRate: 0.15,
    createdAt: now(),
  });
  stats.settings = 1;
  console.log("   ✓ Created settings (ZAR, Africa/Johannesburg, 15% VAT)");

  // 3. Create service presets
  console.log("\n🛠️  Creating service presets...");
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

  const presetBatch = db.batch();
  for (const p of presets) {
    const ref = db.collection("servicePresets").doc();
    presetBatch.set(ref, { ...p, id: ref.id, companyId: DEMO_COMPANY_ID, createdAt: now() });
  }
  await presetBatch.commit();
  stats.servicePresets = presets.length;
  console.log(`   ✓ Created ${presets.length} service presets`);

  // 4. Create handymen with South African names and specialties
  console.log("\n👷 Creating handymen...");
  
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

  const handymanRefs: Array<{ id: string; name: string; specialties: string[] }> = [];
  
  for (const hm of handymen) {
    const ref = db.collection("handymen").doc();
    await ref.set({
      ...hm,
      id: ref.id,
      companyId: DEMO_COMPANY_ID,
      createdAt: now(),
      updatedAt: now(),
    });
    handymanRefs.push({ id: ref.id, name: hm.name, specialties: hm.specialties });
    stats.handymen++;
    console.log(`   ✓ Created ${hm.name} (${hm.specialties.join(", ")})`);
  }

  // 5. Create jobs spread over past 2 months (late Dec 2025 - Feb 25, 2026)
  console.log("\n📋 Creating demo jobs (past 2 months)...");
  
  const baseDate = new Date("2026-02-25T16:00:00+02:00"); // Current date/time
  const twoMonthsAgo = new Date(baseDate);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  // Helper to create date within range
  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  // Helper to pick random handyman by specialty
  const pickHandyman = (specialty?: string) => {
    if (specialty) {
      const matches = handymanRefs.filter(h => h.specialties.includes(specialty));
      if (matches.length > 0) return matches[Math.floor(Math.random() * matches.length)];
    }
    return handymanRefs[Math.floor(Math.random() * handymanRefs.length)];
  };

  const locations = [
    "15 Long Street, Cape Town City Centre",
    "42 Kloof Street, Gardens, Cape Town",
    "88 Bree Street, Cape Town CBD",
    "123 Nelson Mandela Blvd, Sea Point",
    "67 Main Road, Green Point",
    "34 Camps Bay Drive, Camps Bay",
    "210 Loop Street, Cape Town",
    "55 Strand Street, City Bowl",
    "99 Adderley Street, Cape Town",
    "12 Hout Street, Cape Town",
    "76 Sandton Drive, Sandton, Johannesburg",
    "43 Commissioner Street, Johannesburg CBD",
    "150 Florida Road, Morningside, Durban",
    "88 Margaret Mncadi Avenue, Durban",
    "234 Church Street, Arcadia, Pretoria",
    "67 Lynnwood Road, Pretoria East",
    "45 Beyers Naude Drive, Stellenbosch",
    "18 Victoria Road, Camps Bay",
    "92 Voortrekker Road, Goodwood",
    "31 Constantia Main Road, Constantia",
  ];

  const clientNames = [
    "Thabo Mokoena", "Johan Botha", "Nomsa Dlamini", "Andries Pretorius", "Zanele Nkosi",
    "Pieter Joubert", "Lindiwe Sithole", "Francois du Plessis", "Ayanda Mthembu", "Christo van Zyl",
    "Naledi Kgomo", "Hendrik Steyn", "Zinhle Ngcobo", "Willem de Klerk", "Thandi Radebe",
    "Gerhard Muller", "Bontle Molefe", "Riaan Viljoen", "Kgotso Molapo", "Annelie Swanepoel",
    "Mandla Dube", "Elsa Kruger", "Sipho Khoza", "Marlene Rossouw", "Bongani Zwane",
  ];

  const jobs = [
    // Oldest jobs (late Dec) - Mostly Completed
    {
      title: "Kitchen Sink Leak Repair",
      description: "Persistent leak under kitchen sink. Need urgent repair and tap replacement if necessary.",
      specialty: "Plumbing",
      estimatedCost: 1200,
      actualCost: 1350,
      date: new Date("2025-12-28T09:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Bedroom Ceiling Light Installation",
      description: "Install new ceiling light fixture in master bedroom. Wiring needs to be checked.",
      specialty: "Electrical",
      estimatedCost: 1400,
      actualCost: 1400,
      date: new Date("2025-12-29T10:30:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Exterior Gate Painting",
      description: "Sand, prime, and paint front entrance gate. Two coats required.",
      specialty: "Painting",
      estimatedCost: 2200,
      actualCost: 2500,
      date: new Date("2025-12-30T08:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Bathroom Shower Tiles Replacement",
      description: "Replace 6 cracked tiles in shower area. Need waterproof grouting.",
      specialty: "Tiling",
      estimatedCost: 1800,
      actualCost: 1950,
      date: new Date("2026-01-02T09:30:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Air Conditioning Unit Service",
      description: "Annual AC service - cleaning, filter replacement, gas check.",
      specialty: "HVAC",
      estimatedCost: 1100,
      actualCost: 1100,
      date: new Date("2026-01-03T11:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Custom Kitchen Shelving Installation",
      description: "Build and install floating shelves in kitchen (3 shelves, 1.2m each).",
      specialty: "Carpentry",
      estimatedCost: 2800,
      actualCost: 3200,
      date: new Date("2026-01-05T08:30:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Blocked Drain Clearing",
      description: "Main bathroom drain completely blocked. Needs professional clearing.",
      specialty: "Plumbing",
      estimatedCost: 950,
      actualCost: 950,
      date: new Date("2026-01-06T14:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Living Room Wall Painting",
      description: "Repaint living room walls (40 sqm). Two coats, neutral color.",
      specialty: "Painting",
      estimatedCost: 4500,
      actualCost: 4800,
      date: new Date("2026-01-08T08:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Electrical DB Board Inspection",
      description: "Safety inspection of distribution board. Previous electrician flagged concerns.",
      specialty: "Electrical",
      estimatedCost: 950,
      actualCost: 1200,
      date: new Date("2026-01-09T10:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Office Door Lock Replacement",
      description: "Replace broken door lock with new security lock. Need 3 keys.",
      specialty: "General",
      estimatedCost: 750,
      actualCost: 750,
      date: new Date("2026-01-10T13:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Guest Bathroom Tap Replacement",
      description: "Old tap leaking and won't close properly. Full replacement needed.",
      specialty: "Plumbing",
      estimatedCost: 1100,
      actualCost: 1250,
      date: new Date("2026-01-13T09:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Kitchen Floor Tiling Repair",
      description: "Several loose tiles near sink area. Need re-grouting and sealing.",
      specialty: "Tiling",
      estimatedCost: 1400,
      actualCost: 1400,
      date: new Date("2026-01-15T08:30:00+02:00"),
      status: "Completed" as const,
    },
    
    // Mid-January jobs - Mix of Completed and In Progress
    {
      title: "Exterior Wall Painting (Full House)",
      description: "Complete exterior repaint. Needs prep work, primer, two coats.",
      specialty: "Painting",
      estimatedCost: 12500,
      actualCost: 13200,
      date: new Date("2026-01-17T07:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Garage Power Outlet Installation",
      description: "Install 4 new power outlets in garage for workshop setup.",
      specialty: "Electrical",
      estimatedCost: 2400,
      actualCost: 2600,
      date: new Date("2026-01-20T09:30:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Bedroom Built-in Cupboard Repair",
      description: "Repair sliding doors and replace broken shelf brackets.",
      specialty: "Carpentry",
      estimatedCost: 1800,
      actualCost: 0,
      date: new Date("2026-01-22T10:00:00+02:00"),
      status: "In Progress" as const,
    },
    {
      title: "Kitchen Plumbing Upgrade",
      description: "Install dishwasher plumbing connections and upgrade waste pipes.",
      specialty: "Plumbing",
      estimatedCost: 2200,
      actualCost: 2200,
      date: new Date("2026-01-24T08:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Pool House AC Installation",
      description: "Install new split AC unit in pool house. Includes electrical work.",
      specialty: "HVAC",
      estimatedCost: 8500,
      actualCost: 0,
      date: new Date("2026-01-27T09:00:00+02:00"),
      status: "In Progress" as const,
    },
    
    // Late January / Early February - More In Progress
    {
      title: "Patio Tiling Project",
      description: "Tile entire patio area (25 sqm). Non-slip outdoor tiles.",
      specialty: "Tiling",
      estimatedCost: 11250,
      actualCost: 0,
      date: new Date("2026-01-30T07:30:00+02:00"),
      status: "In Progress" as const,
    },
    {
      title: "Geyser Leak Inspection",
      description: "Hot water cylinder showing signs of leaking. Urgent inspection needed.",
      specialty: "Plumbing",
      estimatedCost: 850,
      actualCost: 850,
      date: new Date("2026-02-03T08:30:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Security Light Installation",
      description: "Install motion-sensor security lights at entrance and back door.",
      specialty: "Electrical",
      estimatedCost: 1800,
      actualCost: 0,
      date: new Date("2026-02-05T10:00:00+02:00"),
      status: "In Progress" as const,
    },
    {
      title: "Nursery Room Painting",
      description: "Prepare and paint nursery. Low-VOC paint required. Feature wall in soft yellow.",
      specialty: "Painting",
      estimatedCost: 3200,
      actualCost: 3400,
      date: new Date("2026-02-07T08:00:00+02:00"),
      status: "Completed" as const,
    },
    
    // Recent / Upcoming - Mix of In Progress and Pending
    {
      title: "Bathroom Ventilation Fan Installation",
      description: "Install exhaust fan in bathroom to prevent mold. Needs ducting through roof.",
      specialty: "Electrical",
      estimatedCost: 1950,
      actualCost: 0,
      date: new Date("2026-02-10T09:30:00+02:00"),
      status: "In Progress" as const,
    },
    {
      title: "Garden Shed Door Repair",
      description: "Fix broken hinges and install new lock on garden shed door.",
      specialty: "General",
      estimatedCost: 650,
      actualCost: 650,
      date: new Date("2026-02-12T13:00:00+02:00"),
      status: "Completed" as const,
    },
    {
      title: "Study Room Bookshelf Installation",
      description: "Install wall-mounted bookshelf system in home office.",
      specialty: "Carpentry",
      estimatedCost: 2400,
      actualCost: 0,
      date: new Date("2026-02-14T09:00:00+02:00"),
      status: "In Progress" as const,
    },
    {
      title: "Kitchen Backsplash Tiling",
      description: "Install glass mosaic tile backsplash behind stove (3 sqm).",
      specialty: "Tiling",
      estimatedCost: 2800,
      actualCost: 0,
      date: new Date("2026-02-17T08:00:00+02:00"),
      status: "Pending" as const,
    },
    {
      title: "Lounge AC Deep Clean Service",
      description: "Deep cleaning service for main lounge AC unit. Performance has degraded.",
      specialty: "HVAC",
      estimatedCost: 1200,
      actualCost: 0,
      date: new Date("2026-02-19T10:30:00+02:00"),
      status: "Pending" as const,
    },
    {
      title: "Washing Machine Plumbing Connection",
      description: "Install proper plumbing for new washing machine. Hot and cold connections.",
      specialty: "Plumbing",
      estimatedCost: 1100,
      actualCost: 0,
      date: new Date("2026-02-21T11:00:00+02:00"),
      status: "Pending" as const,
    },
    {
      title: "Outdoor Wall Electrical Outlet",
      description: "Install weatherproof power outlet on exterior wall for garden equipment.",
      specialty: "Electrical",
      estimatedCost: 850,
      actualCost: 0,
      date: new Date("2026-02-24T09:00:00+02:00"),
      status: "Pending" as const,
    },
    {
      title: "Front Door Painting & Varnish",
      description: "Sand, repaint, and varnish front wooden door. Weather protection needed.",
      specialty: "Painting",
      estimatedCost: 1400,
      actualCost: 0,
      date: new Date("2026-02-26T08:30:00+02:00"),
      status: "Pending" as const,
    },
    {
      title: "Balcony Railing Repair",
      description: "Repair loose balcony railing and reinforce mounting brackets.",
      specialty: "General",
      estimatedCost: 1600,
      actualCost: 0,
      date: new Date("2026-02-28T10:00:00+02:00"),
      status: "Pending" as const,
    },
  ];

  const jobRefs: Array<{ id: string; status: string; title: string; actualCost: number; clientName: string; clientPhone: string; clientEmail: string; location: string; date: string; handymanName: string }> = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const handyman = pickHandyman(job.specialty);
    const clientName = clientNames[i % clientNames.length];
    const location = locations[i % locations.length];
    const clientPhone = `+27-${70 + Math.floor(Math.random() * 20)}-${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`;
    const clientEmail = `${clientName.toLowerCase().replace(" ", ".")}@example.co.za`;

    const jobRef = db.collection("jobs").doc();
    const jobData = {
      id: jobRef.id,
      companyId: DEMO_COMPANY_ID,
      title: job.title,
      description: job.description,
      clientName,
      clientPhone,
      clientEmail,
      location,
      status: job.status,
      date: job.date.toISOString(),
      handymanId: handyman.id,
      handymanName: handyman.name,
      estimatedCost: job.estimatedCost,
      actualCost: job.actualCost,
      createdAt: now(),
      updatedAt: now(),
    };

    await jobRef.set(jobData);
    jobRefs.push({
      id: jobRef.id,
      status: job.status,
      title: job.title,
      actualCost: job.actualCost,
      clientName,
      clientPhone,
      clientEmail,
      location,
      date: job.date.toISOString(),
      handymanName: handyman.name,
    });
    stats.jobs++;
    console.log(`   ✓ Created job: ${job.title} (${job.status})`);
  }

  // 6. Create invoices for all Completed jobs
  console.log("\n🧾 Creating invoices for completed jobs...");
  
  const completedJobs = jobRefs.filter(j => j.status === "Completed");
  
  // Mix of invoice statuses: Paid, Sent, Overdue
  const invoiceStatuses = ["Paid", "Paid", "Paid", "Sent", "Sent", "Overdue", "Paid", "Sent", "Paid", "Overdue"];
  
  for (let i = 0; i < completedJobs.length; i++) {
    const job = completedJobs[i];
    const invoiceStatus = invoiceStatuses[i % invoiceStatuses.length];
    
    // Create realistic line items
    const items = [];
    const basePrice = job.actualCost;
    
    // Split into 2-3 line items
    if (basePrice > 2000) {
      const laborCost = Math.round(basePrice * 0.65);
      const materialsCost = Math.round(basePrice * 0.35);
      items.push({
        id: "1",
        description: "Labor",
        quantity: 1,
        unitPrice: laborCost,
        total: laborCost,
      });
      items.push({
        id: "2",
        description: "Materials and supplies",
        quantity: 1,
        unitPrice: materialsCost,
        total: materialsCost,
      });
    } else {
      items.push({
        id: "1",
        description: job.title,
        quantity: 1,
        unitPrice: basePrice,
        total: basePrice,
      });
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = Math.round(subtotal * 0.15);
    const total = subtotal + vatAmount;

    const invoiceRef = db.collection("invoices").doc();
    await invoiceRef.set({
      id: invoiceRef.id,
      companyId: DEMO_COMPANY_ID,
      jobId: job.id,
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
      status: invoiceStatus,
      createdAt: now(),
      updatedAt: now(),
    });
    
    // Link invoice back to job
    await db.collection("jobs").doc(job.id).update({ invoiceId: invoiceRef.id });
    
    stats.invoices++;
    console.log(`   ✓ Created invoice for "${job.title}" (${invoiceStatus}) - R${total.toLocaleString()}`);
  }

  return stats;
}

async function main() {
  try {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   ROSCO FIREBASE DATA RESET SCRIPT    ║");
    console.log("║   Cape Town Handyman Services Demo    ║");
    console.log("╚════════════════════════════════════════╝");

    const deleteStats = await deleteAllData();
    const seedStats = await seedData();

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🗑️  DELETED:");
    for (const [collection, count] of Object.entries(deleteStats)) {
      console.log(`   ${collection.padEnd(20)} ${count} documents`);
    }

    console.log("\n🌱 SEEDED:");
    console.log(`   companies            ${seedStats.companies} document`);
    console.log(`   settings             ${seedStats.settings} document`);
    console.log(`   servicePresets       ${seedStats.servicePresets} documents`);
    console.log(`   handymen             ${seedStats.handymen} documents`);
    console.log(`   jobs                 ${seedStats.jobs} documents`);
    console.log(`   invoices             ${seedStats.invoices} documents`);

    console.log("\n✅ Database reset complete!");
    console.log("\n🏢 Company: Cape Town Handyman Services");
    console.log("💰 Currency: ZAR (South African Rand)");
    console.log("🌍 Timezone: Africa/Johannesburg");
    console.log("📅 Data range: Dec 28, 2025 - Feb 28, 2026\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during reset:", error);
    process.exit(1);
  }
}

main();
