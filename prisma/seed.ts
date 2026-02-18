import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create service presets
  await prisma.servicePreset.createMany({
    data: [
      { name: 'Basic Plumbing Repair', description: 'Fix leaks, replace fittings', price: 250, category: 'Plumbing' },
      { name: 'Pipe Installation', description: 'Install new pipes or replace old ones', price: 450, category: 'Plumbing' },
      { name: 'Electrical Outlet Fix', description: 'Replace or repair electrical outlets', price: 180, category: 'Electrical' },
      { name: 'Light Fixture Installation', description: 'Install ceiling or wall lights', price: 220, category: 'Electrical' },
      { name: 'Tile Repair', description: 'Repair broken or cracked tiles', price: 300, category: 'Tiling' },
      { name: 'Tile Installation (per sqm)', description: 'Full tile installation per square meter', price: 120, category: 'Tiling' },
      { name: 'Painting - Room', description: 'Paint a single room (walls only)', price: 800, category: 'Painting' },
      { name: 'Door Lock Replacement', description: 'Replace door lock and keys', price: 350, category: 'General' },
      { name: 'AC Unit Service', description: 'Clean and service air conditioning unit', price: 280, category: 'HVAC' },
      { name: 'General Handyman (per hour)', description: 'Hourly rate for general handyman work', price: 150, category: 'General' },
    ],
  })

  // Create handymen
  const yosef = await prisma.handyman.create({
    data: {
      name: 'Yosef Cohen',
      phone: '+972-50-1234567',
      email: 'yosef@rosco.co.il',
    },
  })

  const avi = await prisma.handyman.create({
    data: {
      name: 'Avi Mizrahi',
      phone: '+972-52-9876543',
      email: 'avi@rosco.co.il',
    },
  })

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      clientName: 'David Levy',
      clientPhone: '+972-54-1112223',
      clientEmail: 'david.levy@email.com',
      title: 'Kitchen Sink Repair',
      description: 'The kitchen sink has a slow drain and a small leak under the cabinet. Need to fix both.',
      date: new Date('2026-02-18T10:00:00'),
      location: 'Rothschild Blvd 45, Tel Aviv',
      status: 'In Progress',
      handymanId: yosef.id,
    },
  })

  const job2 = await prisma.job.create({
    data: {
      clientName: 'Rachel Shapiro',
      clientPhone: '+972-58-3334445',
      clientEmail: 'rachel.s@gmail.com',
      title: 'Bathroom Tile Repair',
      description: 'Three bathroom tiles are cracked and need to be replaced. Tiles are 30x30 white ceramic.',
      date: new Date('2026-02-18T14:00:00'),
      location: 'Ben Yehuda St 12, Tel Aviv',
      status: 'Pending',
      handymanId: yosef.id,
    },
  })

  const job3 = await prisma.job.create({
    data: {
      clientName: 'Moshe Katz',
      clientPhone: '+972-50-5556667',
      clientEmail: 'mkatz@business.com',
      title: 'Office Electrical Work',
      description: 'Install 4 new power outlets in the office. Need surge protectors installed.',
      date: new Date('2026-02-19T09:00:00'),
      location: 'Azrieli Center, Tower 1, Haifa',
      status: 'Pending',
      handymanId: avi.id,
    },
  })

  const job4 = await prisma.job.create({
    data: {
      clientName: 'Noa Ben-David',
      clientPhone: '+972-52-7778889',
      clientEmail: 'noa.bd@hotmail.com',
      title: 'Bedroom Door Lock Replacement',
      description: 'Door lock is broken, need full replacement with new keys.',
      date: new Date('2026-02-17T11:00:00'),
      location: 'Herzl St 88, Jerusalem',
      status: 'Completed',
      handymanId: avi.id,
    },
  })

  const job5 = await prisma.job.create({
    data: {
      clientName: 'Ilan Peretz',
      clientPhone: '+972-54-9990001',
      clientEmail: 'ilan.p@company.co.il',
      title: 'AC Unit Service & Repair',
      description: 'Two AC units need servicing. One is making noise, the other needs cleaning.',
      date: new Date('2026-02-20T13:00:00'),
      location: 'Dizengoff St 100, Tel Aviv',
      status: 'Pending',
      handymanId: yosef.id,
    },
  })

  // Create invoice for completed job
  const invoice = await prisma.invoice.create({
    data: {
      jobId: job4.id,
      status: 'Sent',
      vatEnabled: true,
      vatRate: 0.17,
      items: {
        create: [
          {
            description: 'Door Lock Replacement',
            quantity: 1,
            unitPrice: 350,
            total: 350,
          },
          {
            description: 'General Handyman (per hour)',
            quantity: 2,
            unitPrice: 150,
            total: 300,
          },
        ],
      },
    },
  })

  // Calculate and update invoice totals
  const subtotal = 350 + 300
  const vatAmount = subtotal * 0.17
  const total = subtotal + vatAmount

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      subtotal,
      vatAmount,
      total,
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log(`   - ${2} handymen`)
  console.log(`   - ${5} jobs`)
  console.log(`   - ${10} service presets`)
  console.log(`   - ${1} invoice`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
