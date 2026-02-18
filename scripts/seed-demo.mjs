import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { homedir } from "os";
import { resolve } from "path";

const keyPath = resolve(homedir(), "Downloads/rosco-app-prod-firebase-adminsdk-fbsvc-11d579e950.json");
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const db = getFirestore();

// ─── Data pools ────────────────────────────────────────────────────────────────

const HANDYMEN = [
  { name: "Yosef Cohen",   phone: "+972-50-1234567", email: "yosef@rosco.co.il" },
  { name: "Avi Mizrahi",   phone: "+972-52-9876543", email: "avi@rosco.co.il"   },
  { name: "Danny Levi",    phone: "+972-54-4445556", email: "danny@rosco.co.il" },
  { name: "Ronen Peretz",  phone: "+972-58-7778889", email: "ronen@rosco.co.il" },
];

const CLIENTS = [
  { name: "David Levy",       phone: "+972-54-1112223", email: "david.levy@gmail.com"      },
  { name: "Rachel Shapiro",   phone: "+972-58-3334445", email: "rachel.shapiro@gmail.com"  },
  { name: "Moshe Katz",       phone: "+972-50-5556667", email: "mkatz@business.com"        },
  { name: "Ilan Peretz",      phone: "+972-54-9990001", email: "ilan.p@company.co.il"      },
  { name: "Noa Ben-David",    phone: "+972-52-7778889", email: "noa.bd@hotmail.com"        },
  { name: "Eitan Goldstein",  phone: "+972-50-2223334", email: "eitan.g@gmail.com"         },
  { name: "Tamar Cohen",      phone: "+972-54-6667778", email: "tamar.cohen@walla.co.il"   },
  { name: "Gal Mizrahi",      phone: "+972-52-1112223", email: "gal.mizrahi@gmail.com"     },
  { name: "Yael Friedman",    phone: "+972-58-9990001", email: "yael.f@gmail.com"          },
  { name: "Amir Schwartz",    phone: "+972-50-4445556", email: "amir.s@company.co.il"      },
  { name: "Shira Hazan",      phone: "+972-54-3334445", email: "shira.h@gmail.com"         },
  { name: "Roi Dayan",        phone: "+972-52-2223334", email: "roi.dayan@outlook.com"     },
  { name: "Liron Bar",        phone: "+972-50-8889990", email: "liron.bar@gmail.com"       },
  { name: "Ofer Nachmani",    phone: "+972-54-5556667", email: "ofer.n@business.co.il"     },
  { name: "Dana Shapira",     phone: "+972-58-1112223", email: "dana.shapira@gmail.com"    },
  { name: "Barak Eliyahu",    phone: "+972-52-4445556", email: "barak.e@gmail.com"         },
  { name: "Michal Avraham",   phone: "+972-50-7778889", email: "michal.a@walla.co.il"      },
  { name: "Ofir Ben-Ami",     phone: "+972-54-0001112", email: "ofir.ba@gmail.com"         },
  { name: "Tali Rosenberg",   phone: "+972-58-2223334", email: "tali.r@hotmail.com"        },
  { name: "Guy Nachum",       phone: "+972-52-6667778", email: "guy.n@company.co.il"       },
  { name: "Inbar Zohar",      phone: "+972-50-3334445", email: "inbar.z@gmail.com"         },
  { name: "Matan Levy",       phone: "+972-54-8889990", email: "matan.levy@gmail.com"      },
  { name: "Hila Cohen",       phone: "+972-52-0001112", email: "hila.cohen@gmail.com"      },
  { name: "Shai Avrahami",    phone: "+972-58-5556667", email: "shai.a@business.com"       },
  { name: "Keren Malka",      phone: "+972-50-9990001", email: "keren.m@gmail.com"         },
];

const LOCATIONS = [
  "Rothschild Blvd 45, Tel Aviv",
  "Ben Yehuda St 12, Tel Aviv",
  "Dizengoff St 100, Tel Aviv",
  "Allenby St 55, Tel Aviv",
  "Ibn Gabirol St 33, Tel Aviv",
  "Herzl St 88, Jerusalem",
  "Jaffa Rd 120, Jerusalem",
  "Emek Refaim St 20, Jerusalem",
  "HaNassi Ave 15, Haifa",
  "Moriah Blvd 30, Haifa",
  "Weizmann St 8, Rehovot",
  "Herzl St 44, Rishon LeZion",
  "Begin Rd 90, Tel Aviv",
  "Yigal Alon St 78, Tel Aviv",
  "HaYarkon St 200, Tel Aviv",
  "Kaufmann St 5, Tel Aviv",
  "Namir Rd 249, Tel Aviv",
  "Petah Tikva Rd 77, Tel Aviv",
  "Azrieli Center Tower 1, Tel Aviv",
  "Sarona Market Area, Tel Aviv",
  "HaMasger St 40, Tel Aviv",
  "Neve Tzedek, Tel Aviv",
  "Florentin St 15, Tel Aviv",
  "Shenkin St 22, Tel Aviv",
  "King George St 34, Tel Aviv",
];

const JOB_TYPES = [
  { title: "Kitchen Sink Repair",        desc: "Slow drain and leak under cabinet",            basePrice: 300,  hours: 1.5, cat: "Plumbing"    },
  { title: "Bathroom Faucet Replacement",desc: "Replace old leaking faucet with new fixture",   basePrice: 350,  hours: 1,   cat: "Plumbing"    },
  { title: "Pipe Leak Repair",           desc: "Burst pipe under kitchen sink",                 basePrice: 500,  hours: 2,   cat: "Plumbing"    },
  { title: "Toilet Repair",              desc: "Toilet not flushing properly, internal fix",    basePrice: 280,  hours: 1,   cat: "Plumbing"    },
  { title: "Water Heater Service",       desc: "Annual service and inspection",                 basePrice: 450,  hours: 2,   cat: "Plumbing"    },
  { title: "Bathroom Tile Repair",       desc: "Replace cracked tiles, 3-5 pieces",            basePrice: 650,  hours: 3,   cat: "Tiling"      },
  { title: "Kitchen Tile Installation",  desc: "New backsplash tiles, full installation",       basePrice: 1200, hours: 5,   cat: "Tiling"      },
  { title: "Bathroom Floor Retiling",    desc: "Remove and replace bathroom floor tiles",       basePrice: 2400, hours: 8,   cat: "Tiling"      },
  { title: "Electrical Outlet Fix",      desc: "Non-functioning outlet, replace socket",        basePrice: 180,  hours: 0.5, cat: "Electrical"  },
  { title: "Light Fixture Installation", desc: "Install new ceiling light, run wiring",         basePrice: 350,  hours: 1.5, cat: "Electrical"  },
  { title: "Circuit Breaker Fix",        desc: "Breaker tripping repeatedly, inspect and fix",  basePrice: 400,  hours: 2,   cat: "Electrical"  },
  { title: "Office Electrical Work",     desc: "Install 4 new power outlets with surge prot",  basePrice: 800,  hours: 3,   cat: "Electrical"  },
  { title: "AC Unit Service",            desc: "Annual cleaning and gas check",                 basePrice: 280,  hours: 1.5, cat: "HVAC"        },
  { title: "AC Unit Repair",             desc: "Unit not cooling, compressor inspection",       basePrice: 550,  hours: 2.5, cat: "HVAC"        },
  { title: "Door Lock Replacement",      desc: "Replace broken lock, 3 new keys",              basePrice: 400,  hours: 1,   cat: "General"     },
  { title: "Door Frame Repair",          desc: "Warped door frame, realign and seal",           basePrice: 350,  hours: 2,   cat: "General"     },
  { title: "Window Seal Replacement",    desc: "Drafty window, replace rubber seal",            basePrice: 250,  hours: 1,   cat: "General"     },
  { title: "Painting - Bedroom",         desc: "Paint 1 bedroom, 2 coats, all walls",          basePrice: 900,  hours: 6,   cat: "Painting"    },
  { title: "Painting - Living Room",     desc: "Paint living room, 2 coats",                   basePrice: 1400, hours: 8,   cat: "Painting"    },
  { title: "Touch-up Painting",          desc: "Spot painting, scuffs and marks",              basePrice: 350,  hours: 2,   cat: "Painting"    },
  { title: "Furniture Assembly",         desc: "Assemble flat-pack wardrobe and desk",         basePrice: 400,  hours: 3,   cat: "General"     },
  { title: "TV Wall Mount Installation", desc: "Mount 65\" TV, route cables through wall",     basePrice: 300,  hours: 1.5, cat: "General"     },
  { title: "Shelf Installation",         desc: "Install 4 floating shelves with anchors",      basePrice: 250,  hours: 1.5, cat: "General"     },
  { title: "General Maintenance Visit",  desc: "General inspection and minor fixes",           basePrice: 350,  hours: 2,   cat: "General"     },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);

function jobsPerDay(daysAgo) {
  // Business grows over time: 1-2 jobs/day early, 3-5 jobs/day recently
  if (daysAgo > 300) return randInt(1, 2);
  if (daysAgo > 200) return randInt(1, 3);
  if (daysAgo > 100) return randInt(2, 4);
  if (daysAgo > 30)  return randInt(2, 5);
  return randInt(3, 5);
}

function randomTimeOnDay(dateObj) {
  const d = new Date(dateObj);
  d.setHours(randInt(8, 17), randInt(0, 59), 0, 0);
  return d.toISOString();
}

function statusForAge(daysAgo) {
  if (daysAgo > 2)  return "Completed";
  if (daysAgo === 1) return Math.random() < 0.8 ? "Completed" : "In Progress";
  if (daysAgo === 0) return Math.random() < 0.4 ? "Completed" : Math.random() < 0.5 ? "In Progress" : "Pending";
  return "Pending"; // future
}

function invoiceStatusForAge(daysAgo) {
  if (daysAgo > 60) return Math.random() < 0.93 ? "Paid" : "Outstanding";
  if (daysAgo > 30) return Math.random() < 0.80 ? "Paid" : "Outstanding";
  if (daysAgo > 14) return Math.random() < 0.60 ? "Paid" : "Sent";
  if (daysAgo > 3)  return Math.random() < 0.30 ? "Paid" : "Sent";
  return "Draft";
}

const now = () => new Date().toISOString();

// ─── Wipe existing data ───────────────────────────────────────────────────────

async function wipeCollection(name) {
  const snap = await db.collection(name).get();
  const batches = [];
  let batch = db.batch();
  let count = 0;
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    count++;
    if (count === 400) { batches.push(batch.commit()); batch = db.batch(); count = 0; }
  }
  if (count > 0) batches.push(batch.commit());
  await Promise.all(batches);
  console.log(`  Wiped ${snap.docs.length} docs from ${name}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧹 Wiping existing data...");
  await wipeCollection("jobs");
  await wipeCollection("invoices");
  await wipeCollection("handymen");
  await wipeCollection("servicePresets");

  // ── Service presets
  console.log("🌱 Seeding service presets...");
  const presetBatch = db.batch();
  for (const jt of JOB_TYPES) {
    const ref = db.collection("servicePresets").doc();
    presetBatch.set(ref, { id: ref.id, name: jt.title, description: jt.desc, price: jt.basePrice, category: jt.cat });
  }
  await presetBatch.commit();

  // ── Handymen
  console.log("👷 Seeding handymen...");
  const handymenIds = [];
  for (const h of HANDYMEN) {
    const ref = db.collection("handymen").doc();
    await ref.set({ ...h, id: ref.id, createdAt: now() });
    handymenIds.push({ id: ref.id, name: h.name });
  }

  // ── Jobs + Invoices (past 365 days + 14 days ahead)
  console.log("📋 Generating jobs and invoices...");

  let totalJobs = 0;
  let totalInvoices = 0;
  const DAYS_BACK = 365;
  const DAYS_AHEAD = 14;

  for (let daysFromToday = -DAYS_BACK; daysFromToday <= DAYS_AHEAD; daysFromToday++) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + daysFromToday);
    const dow = dayDate.getDay(); // 0=Sun, 6=Sat
    if (dow === 6) continue; // skip Saturdays (Shabbat)

    const daysAgo = -daysFromToday;
    const count = daysFromToday > 0 ? randInt(1, 3) : jobsPerDay(daysAgo);

    const jobBatch = db.batch();
    const invBatch = db.batch();
    let batchHasInv = false;

    for (let i = 0; i < count; i++) {
      const client  = rand(CLIENTS);
      const jobType = rand(JOB_TYPES);
      const handyman = rand(handymenIds);
      const location = rand(LOCATIONS);
      const jobStatus = daysFromToday > 0 ? "Pending" : statusForAge(daysAgo);
      const jobDate = randomTimeOnDay(dayDate);

      const jobRef = db.collection("jobs").doc();
      const jobId = jobRef.id;

      // Price variation ±20%
      const variation = randFloat(0.85, 1.20);
      const baseSubtotal = Math.round(jobType.basePrice * variation / 10) * 10;

      const job = {
        id: jobId,
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email,
        title: jobType.title,
        description: jobType.desc,
        date: jobDate,
        location,
        status: jobStatus,
        handymanId: handyman.id,
        handymanName: handyman.name,
        createdAt: jobDate,
        updatedAt: jobDate,
      };

      // Create invoice for completed jobs (95% chance)
      if (jobStatus === "Completed" && Math.random() < 0.95) {
        const invStatus = invoiceStatusForAge(daysAgo);
        const vatEnabled = Math.random() < 0.75;
        const vatAmount = vatEnabled ? +(baseSubtotal * 0.17).toFixed(2) : 0;
        const total = +(baseSubtotal + vatAmount).toFixed(2);

        const items = [
          {
            id: "1",
            description: jobType.title,
            quantity: 1,
            unitPrice: baseSubtotal,
            total: baseSubtotal,
          },
        ];

        // Sometimes add labor cost
        if (jobType.hours > 1 && Math.random() < 0.4) {
          const laborCost = Math.round(jobType.hours * 150);
          items.push({ id: "2", description: "Labor", quantity: Math.round(jobType.hours), unitPrice: 150, total: laborCost });
          const newSub = baseSubtotal + laborCost;
          items[0].total = baseSubtotal;
          const newVat = vatEnabled ? +(newSub * 0.17).toFixed(2) : 0;
          const invRef = db.collection("invoices").doc();
          const inv = {
            id: invRef.id, jobId,
            clientName: client.name, clientEmail: client.email, clientPhone: client.phone,
            jobTitle: jobType.title, jobDate, jobLocation: location, handymanName: handyman.name,
            items,
            subtotal: newSub, vatEnabled, vatRate: 0.17, vatAmount: newVat, total: +(newSub + newVat).toFixed(2),
            status: invStatus,
            createdAt: jobDate, updatedAt: jobDate,
            ...(invStatus === "Paid" ? { paidAt: new Date(new Date(jobDate).getTime() + randInt(1, 5) * 86400000).toISOString() } : {}),
          };
          invBatch.set(invRef, inv);
          job.invoiceId = invRef.id;
          batchHasInv = true;
          totalInvoices++;
        } else {
          const invRef = db.collection("invoices").doc();
          const inv = {
            id: invRef.id, jobId,
            clientName: client.name, clientEmail: client.email, clientPhone: client.phone,
            jobTitle: jobType.title, jobDate, jobLocation: location, handymanName: handyman.name,
            items,
            subtotal: baseSubtotal, vatEnabled, vatRate: 0.17, vatAmount, total,
            status: invStatus,
            createdAt: jobDate, updatedAt: jobDate,
            ...(invStatus === "Paid" ? { paidAt: new Date(new Date(jobDate).getTime() + randInt(1, 5) * 86400000).toISOString() } : {}),
          };
          invBatch.set(invRef, inv);
          job.invoiceId = invRef.id;
          batchHasInv = true;
          totalInvoices++;
        }
      }

      jobBatch.set(jobRef, job);
      totalJobs++;
    }

    await jobBatch.commit();
    if (batchHasInv) await invBatch.commit();

    if (Math.abs(daysFromToday) % 30 === 0) {
      console.log(`  Day ${daysFromToday > 0 ? "+" : ""}${daysFromToday}: ${totalJobs} jobs, ${totalInvoices} invoices so far...`);
    }
  }

  // ─── Summary stats
  const jobsSnap = await db.collection("jobs").get();
  const invsSnap = await db.collection("invoices").get();
  const allInv = invsSnap.docs.map(d => d.data());
  const paid = allInv.filter(i => i.status === "Paid");
  const outstanding = allInv.filter(i => ["Sent","Outstanding"].includes(i.status));
  const revenue = paid.reduce((s, i) => s + (i.total || 0), 0);
  const outstandingTotal = outstanding.reduce((s, i) => s + (i.total || 0), 0);

  console.log("\n✅ Done!");
  console.log(`   Jobs:        ${jobsSnap.size}`);
  console.log(`   Invoices:    ${invsSnap.size}`);
  console.log(`   Paid:        ${paid.length} invoices — ₪${revenue.toFixed(0)}`);
  console.log(`   Outstanding: ${outstanding.length} invoices — ₪${outstandingTotal.toFixed(0)}`);
  console.log(`   Handymen:    ${handymenIds.length}`);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
