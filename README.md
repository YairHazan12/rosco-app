# ROSCO — Handyman Business Management App

A full-stack MVP for managing a handyman/maintenance business. Built with Next.js 15, Prisma, SQLite, and Stripe.

---

## Features

### 🛡️ Admin Panel (`/admin`)
- **Dashboard** — Today's job count, outstanding invoices, total revenue
- **Job Management** — Full CRUD: client info, title, description, date/time, location, status, assigned handyman
- **Invoice Management** — Create invoices from completed jobs, preset service items, VAT toggle (17%), status tracking (Draft → Sent → Paid), Stripe payment link generation

### 🔧 Handyman App (`/handyman`)
- **Daily/weekly schedule** — Jobs for the next 7 days grouped by day
- **Job Details** — Full info, client contact, Waze deep-link for navigation
- **Status Updates** — "Start Job" and "Mark as Done" buttons

### 💳 Customer Payment (`/pay/[invoiceId]`)
- Clean invoice view with services, VAT breakdown, total
- Stripe Checkout (Card, Apple Pay, Google Pay)
- Payment confirmation page

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Prisma + SQLite |
| Payments | Stripe Checkout |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env` and fill in your Stripe keys:
```env
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 3. Set up the database
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — links to all 3 interfaces |
| `/admin` | Admin dashboard |
| `/admin/jobs` | Job list + management |
| `/admin/jobs/new` | Create new job |
| `/admin/jobs/[id]` | Job details |
| `/admin/jobs/[id]/edit` | Edit job |
| `/admin/invoices` | Invoice list |
| `/admin/invoices/new?jobId=X` | Create invoice for job |
| `/admin/invoices/[id]` | Invoice detail + actions |
| `/handyman` | Handyman schedule (next 7 days) |
| `/handyman/jobs` | All jobs list |
| `/handyman/jobs/[id]` | Job detail + Mark as Done |
| `/pay/[invoiceId]` | Customer payment page |
| `/pay/[invoiceId]/success` | Post-payment confirmation |

---

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Add your secret key to `.env`
3. The app generates Checkout Sessions per invoice
4. Payments are processed in ILS (Israeli Shekel)
5. Webhook endpoint (for production): `/api/webhooks/stripe`

> **No Stripe?** The app runs in demo mode — payment links point to the internal `/pay/` page instead of Stripe.

---

## Seed Data

The seed includes:
- **2 handymen**: Yosef Cohen, Avi Mizrahi
- **5 jobs** across multiple clients and statuses
- **10 service presets** (Plumbing, Electrical, Tiling, Painting, HVAC, General)
- **1 invoice** (Sent, with VAT)

---

## Roadmap (post-MVP)

- [ ] Authentication (NextAuth or Clerk)
- [ ] Per-handyman login for `/handyman`
- [ ] SMS/WhatsApp notifications to clients
- [ ] PDF invoice export
- [ ] Recurring jobs / job templates
- [ ] Analytics dashboard
- [ ] Multi-tenant (multiple businesses)
- [ ] Mobile app (React Native)

---

## Project Structure

```
rosco-app/
├── app/
│   ├── admin/              # Admin panel
│   │   ├── jobs/           # Job management
│   │   └── invoices/       # Invoice management
│   ├── handyman/           # Handyman interface
│   ├── pay/                # Customer payment
│   └── api/                # REST API routes
├── components/ui/          # shadcn/ui components
├── lib/
│   └── prisma.ts           # Prisma client
└── prisma/
    ├── schema.prisma        # DB schema
    ├── seed.ts              # Seed data
    └── migrations/         # SQL migrations
```
