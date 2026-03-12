# ROSCO — Handyman Business Management App

A full-stack MVP for managing a handyman/maintenance business. Built with Next.js 15, Firebase, and Paystack.

---

## Features

### 🛡️ Admin Panel (`/admin`)
- **Dashboard** — Today's job count, outstanding invoices, total revenue
- **Job Management** — Full CRUD: client info, title, description, date/time, location, status, assigned handyman
- **Invoice Management** — Create invoices from completed jobs, preset service items, VAT toggle (17%), status tracking (Draft → Sent → Paid), Paystack payment link generation

### 🔧 Handyman App (`/handyman`)
- **Daily/weekly schedule** — Jobs for the next 7 days grouped by day
- **Job Details** — Full info, client contact, Waze deep-link for navigation
- **Status Updates** — "Start Job" and "Mark as Done" buttons

### 💳 Customer Payment (`/pay/[invoiceId]`)
- Clean invoice view with services, VAT breakdown, total
- Paystack Checkout (Card, Mobile Money)
- Payment confirmation page

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Firebase Firestore |
| Payments | Paystack Checkout |

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"

# Paystack Configuration
PAYSTACK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up Firebase
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Download your service account key and add credentials to `.env`

### 4. Seed the database (optional)
```bash
npm run reset-data
```

### 5. Run the app
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

## Paystack Setup

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your API keys from the [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
3. Add your secret key to `.env`
4. The app generates payment initialization requests per invoice
5. Payments are processed in ZAR (South African Rand)
6. Webhook endpoint (for production): `/api/webhooks/paystack`

> **No Paystack?** The app runs in demo mode — payment links point to the internal `/pay/` page instead of Paystack.

---

## Seed Data

The seed includes:
- **2 handymen**: Yosef Cohen, Avi Mizrahi
- **5 jobs** across multiple clients and statuses
- **10 service presets** (Plumbing, Electrical, Tiling, Painting, HVAC, General)
- **1 invoice** (Sent, with VAT)

---

## Roadmap (post-MVP)

- [ ] Split payments with Paystack subaccounts
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
│       └── webhooks/
│           └── paystack/   # Paystack webhook handler
├── components/ui/          # shadcn/ui components
├── lib/
│   ├── db.ts               # Firebase Firestore access
│   ├── types.ts            # TypeScript interfaces
│   └── firebase-admin.ts   # Firebase admin SDK
└── scripts/
    └── reset-data.ts       # Database seed script
```
