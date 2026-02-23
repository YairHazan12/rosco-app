#!/usr/bin/env tsx
/**
 * Script to convert Israeli data to South African data
 * Run with: npx tsx scripts/seed-sa-data.ts
 */

import { db } from "../lib/firebase-admin";

// South African names pool
const SA_NAMES = [
  "Sipho Ndlovu",
  "Thabo Mokoena",
  "Pieter van der Merwe",
  "Lebo Mthembu",
  "Johan Botha",
  "Nomsa Dlamini",
  "Andries Pretorius",
  "Thandiwe Khumalo",
  "Jaco Erasmus",
  "Zanele Nkosi",
  "Hendrik du Plessis",
  "Lindiwe Mahlangu",
  "Kobus Venter",
  "Nandi Zulu",
  "Francois Fourie",
];

// South African locations
const SA_LOCATIONS = [
  "Long Street 45, Cape Town",
  "Nelson Mandela Square, Sandton",
  "Florida Road 88, Durban",
  "Church Street 123, Pretoria",
  "Kloof Street 56, Gardens",
  "Bree Street 234, Cape Town CBD",
  "Jan Smuts Avenue 78, Rosebank",
  "Beachfront Promenade 12, Durban",
  "Hatfield Street 99, Pretoria",
  "Camps Bay Drive 67, Camps Bay",
  "William Nicol Drive 145, Fourways",
  "Marine Drive 23, Umhlanga",
  "Dorp Street 34, Stellenbosch",
  "Oxford Road 56, Johannesburg",
  "Sea Point Promenade 89, Sea Point",
];

// Generate SA phone number in format +27-XX-XXX-XXXX
function generateSAPhone(): string {
  const prefixes = ["82", "83", "84", "71", "72", "73", "74", "76", "78", "79"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const part1 = Math.floor(100 + Math.random() * 900); // 100-999
  const part2 = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `+27-${prefix}-${part1}-${part2}`;
}

// Random picker
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🇿🇦 Starting South African data conversion...\n");

  try {
    // 1. Update Settings
    console.log("📝 Updating settings to ZAR currency...");
    const settingsSnapshot = await db.collection("settings").get();
    
    if (!settingsSnapshot.empty) {
      for (const doc of settingsSnapshot.docs) {
        await doc.ref.update({
          currency: "ZAR",
        });
        console.log(`✅ Updated settings document: ${doc.id}`);
      }
    } else {
      // Create default settings if none exist
      await db.collection("settings").doc("default").set({
        currency: "ZAR",
        language: "en",
        timezone: "Africa/Johannesburg",
        notifications: {
          email: true,
          sms: true,
          push: false,
        },
      });
      console.log("✅ Created default ZAR settings");
    }

    // 2. Update Handymen
    console.log("\n👷 Updating handymen with South African names...");
    const handymenSnapshot = await db.collection("handymen").get();
    
    const usedNames = new Set<string>();
    for (const doc of handymenSnapshot.docs) {
      let newName: string;
      do {
        newName = randomItem(SA_NAMES);
      } while (usedNames.has(newName));
      usedNames.add(newName);

      await doc.ref.update({
        name: newName,
        phone: generateSAPhone(),
      });
      console.log(`✅ Updated handyman ${doc.id}: ${newName}`);
    }

    // 3. Update Jobs
    console.log("\n📋 Updating jobs with South African data...");
    const jobsSnapshot = await db.collection("jobs").get();
    
    for (const doc of jobsSnapshot.docs) {
      const updateData: any = {
        clientName: randomItem(SA_NAMES),
        clientPhone: generateSAPhone(),
        location: randomItem(SA_LOCATIONS),
      };
      
      // Keep email if it exists (or generate a generic one)
      const currentData = doc.data();
      if (currentData.clientEmail) {
        const emailName = updateData.clientName.toLowerCase().replace(/\s+/g, '.');
        updateData.clientEmail = `${emailName}@example.co.za`;
      }

      await doc.ref.update(updateData);
      console.log(`✅ Updated job ${doc.id}: ${updateData.clientName} at ${updateData.location}`);
    }

    // 4. Update Invoices
    console.log("\n🧾 Updating invoices with South African data...");
    const invoicesSnapshot = await db.collection("invoices").get();
    
    for (const doc of invoicesSnapshot.docs) {
      const updateData: any = {
        clientName: randomItem(SA_NAMES),
        clientPhone: generateSAPhone(),
        jobLocation: randomItem(SA_LOCATIONS),
      };
      
      // Keep email if it exists
      const currentData = doc.data();
      if (currentData.clientEmail) {
        const emailName = updateData.clientName.toLowerCase().replace(/\s+/g, '.');
        updateData.clientEmail = `${emailName}@example.co.za`;
      }

      await doc.ref.update(updateData);
      console.log(`✅ Updated invoice ${doc.id}: ${updateData.clientName}`);
    }

    console.log("\n✨ All data successfully converted to South African format!");
    console.log("\nSummary:");
    console.log(`  - Settings: Updated to ZAR`);
    console.log(`  - Handymen: ${handymenSnapshot.size} updated`);
    console.log(`  - Jobs: ${jobsSnapshot.size} updated`);
    console.log(`  - Invoices: ${invoicesSnapshot.size} updated`);

  } catch (error) {
    console.error("\n❌ Error during conversion:", error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
