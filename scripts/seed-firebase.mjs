import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";

const keyPath = resolve(homedir(), "Downloads/rosco-app-prod-firebase-adminsdk-fbsvc-11d579e950.json");
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const now = () => new Date().toISOString();

async function seed() {
  console.log("🌱 Seeding Firebase...");

  // Service Presets
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

  const batch1 = db.batch();
  for (const p of presets) {
    const ref = db.collection("servicePresets").doc();
    batch1.set(ref, { ...p, id: ref.id });
  }
  await batch1.commit();
  console.log("✓ Service presets");

  // Handymen
  const yosefRef = db.collection("handymen").doc();
  const aviRef = db.collection("handymen").doc();
  const batch2 = db.batch();
  batch2.set(yosefRef, { id: yosefRef.id, name: "Yosef Cohen", phone: "+972-50-1234567", email: "yosef@rosco.co.il", createdAt: now() });
  batch2.set(aviRef, { id: aviRef.id, name: "Avi Mizrahi", phone: "+972-52-9876543", email: "avi@rosco.co.il", createdAt: now() });
  await batch2.commit();
  console.log("✓ Handymen");

  // Jobs
  const jobsData = [
    { clientName: "David Levy", clientPhone: "+972-54-1112223", clientEmail: "david.levy@email.com", title: "Kitchen Sink Repair", description: "Slow drain and small leak under cabinet.", date: new Date(Date.now() + 2 * 3600000).toISOString(), location: "Rothschild Blvd 45, Tel Aviv", status: "In Progress", handymanId: yosefRef.id, handymanName: "Yosef Cohen" },
    { clientName: "Rachel Shapiro", clientPhone: "+972-58-3334445", clientEmail: "rachel.s@gmail.com", title: "Bathroom Tile Repair", description: "Three cracked tiles need replacing.", date: new Date(Date.now() + 5 * 3600000).toISOString(), location: "Ben Yehuda St 12, Tel Aviv", status: "Pending", handymanId: yosefRef.id, handymanName: "Yosef Cohen" },
    { clientName: "Moshe Katz", clientPhone: "+972-50-5556667", clientEmail: "mkatz@business.com", title: "Office Electrical Work", description: "Install 4 new power outlets.", date: new Date(Date.now() + 26 * 3600000).toISOString(), location: "Azrieli Center Tower 1, Tel Aviv", status: "Pending", handymanId: aviRef.id, handymanName: "Avi Mizrahi" },
    { clientName: "Ilan Peretz", clientPhone: "+972-54-9990001", clientEmail: "ilan.p@company.co.il", title: "AC Unit Service & Repair", description: "Two AC units — one noisy, one needs cleaning.", date: new Date(Date.now() + 50 * 3600000).toISOString(), location: "Dizengoff St 100, Tel Aviv", status: "Pending", handymanId: yosefRef.id, handymanName: "Yosef Cohen" },
  ];

  for (const j of jobsData) {
    const ref = db.collection("jobs").doc();
    await ref.set({ ...j, id: ref.id, createdAt: now(), updatedAt: now() });
  }
  console.log("✓ Jobs");

  // Completed job with invoice
  const completedRef = db.collection("jobs").doc();
  const completedJob = { id: completedRef.id, clientName: "Noa Ben-David", clientPhone: "+972-52-7778889", clientEmail: "noa.bd@hotmail.com", title: "Bedroom Door Lock Replacement", description: "Door lock broken, full replacement.", date: new Date(Date.now() - 24 * 3600000).toISOString(), location: "Herzl St 88, Jerusalem", status: "Completed", handymanId: aviRef.id, handymanName: "Avi Mizrahi", createdAt: now(), updatedAt: now() };
  await completedRef.set(completedJob);

  const items = [
    { id: "1", description: "Door Lock Replacement", quantity: 1, unitPrice: 350, total: 350 },
    { id: "2", description: "General Handyman (per hour)", quantity: 2, unitPrice: 150, total: 300 },
  ];
  const subtotal = 650;
  const vatAmount = +(subtotal * 0.17).toFixed(2);
  const total = +(subtotal + vatAmount).toFixed(2);

  const invRef = db.collection("invoices").doc();
  await invRef.set({
    id: invRef.id, jobId: completedJob.id,
    clientName: completedJob.clientName, clientEmail: completedJob.clientEmail, clientPhone: completedJob.clientPhone,
    jobTitle: completedJob.title, jobDate: completedJob.date, jobLocation: completedJob.location, handymanName: completedJob.handymanName,
    items, subtotal, vatEnabled: true, vatRate: 0.17, vatAmount, total, status: "Sent",
    createdAt: now(), updatedAt: now(),
  });

  // Link invoice to job
  await completedRef.update({ invoiceId: invRef.id, updatedAt: now() });

  console.log("✓ Completed job + invoice");
  console.log("\n🎉 Seed complete!");
  console.log(`\nInvoice ID (for testing /pay): ${invRef.id}`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
