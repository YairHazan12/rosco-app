# Deployment Guide

## Prerequisites

1. **Firebase Project** set up
2. **Firestore Database** created
3. **Firebase Authentication** enabled (Email/Password + Google)
4. **Environment variables** configured (`.env.local`)

---

## Step 1: Deploy Firestore Security Rules

```bash
cd /Users/yairhazan/.openclaw/workspace/rosco-app

# Deploy security rules
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules get
```

**Expected output:**
```
✔ firestore: released rules firestore.rules to cloud.firestore
```

---

## Step 2: Seed Demo Data

Run the seed script to create the DEMO company and sample data:

```bash
# If you have a seed script set up
npm run seed

# Or manually via Firebase console or a one-time script
# The seedDatabase() function in /lib/db.ts will:
# - Create company "ROSCO Demo Company" with ID "DEMO"
# - Create 10 service presets
# - Create 2 handymen (Yosef Cohen, Avi Mizrahi)
# - Create 5 sample jobs
# - Create 1 completed job with invoice
```

### Manual Seed (via Node script)

Create a temporary seed script:

```bash
# Create seed script
cat > scripts/seed-once.mjs << 'EOF'
import { seedDatabase } from "../lib/db.ts";

async function main() {
  console.log("Seeding database...");
  await seedDatabase();
  console.log("✅ Seed complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
EOF

# Run it
npx tsx scripts/seed-once.mjs

# Clean up
rm scripts/seed-once.mjs
```

---

## Step 3: Build & Test Locally

```bash
# Build production bundle
npm run build

# Test production build locally
npm start

# Open http://localhost:3000
```

### Test Checklist
- [ ] Home page loads with demo mode banner
- [ ] Click "Admin Panel" → see demo dashboard with sample jobs
- [ ] Click "Handyman App" → see demo schedule
- [ ] Click "Sign In" → see login page
- [ ] Sign up with email → redirects to onboarding
- [ ] Complete onboarding as admin → creates company, shows dashboard
- [ ] Sign out → back to demo mode
- [ ] Sign up as handyman → can search companies and send join request

---

## Step 4: Deploy to Vercel

### Option A: CLI Deployment

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod

# Follow prompts to link to your Vercel project
```

### Option B: Git Integration

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add Firebase Auth + Multi-tenancy"
   git push origin main
   ```

2. Connect repo to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Add environment variables (see below)
   - Deploy

---

## Step 5: Environment Variables (Vercel)

Add these in Vercel dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Server-side (for firebase-admin)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** Make sure `FIREBASE_PRIVATE_KEY` has the `\n` newlines properly escaped.

---

## Step 6: Post-Deployment Verification

### Test Production Site

1. **Demo Mode** (unauthenticated):
   - [ ] Visit https://your-app.vercel.app
   - [ ] See "Demo Mode" banner
   - [ ] Browse demo jobs/invoices
   - [ ] All data visible without login

2. **Admin Flow**:
   - [ ] Click "Sign In" → Sign up as admin
   - [ ] Complete onboarding (create company)
   - [ ] See company code displayed
   - [ ] Create a job
   - [ ] Create an invoice
   - [ ] Visit `/admin/team` → see "No pending requests"

3. **Handyman Flow**:
   - [ ] Sign up as handyman (different email)
   - [ ] Search for admin's company
   - [ ] Send join request
   - [ ] See "Waiting for Approval" page
   - [ ] Go back to admin account → approve request
   - [ ] Refresh handyman account → redirected to dashboard

4. **Multi-Tenancy** (currently uses DEMO data for all):
   - [ ] Create jobs in Company A
   - [ ] Sign in as Company B admin
   - [ ] Should NOT see Company A's jobs ⚠️ (needs page updates)

---

## Step 7: Firebase Console Checks

### Firestore
Check in Firebase Console → Firestore Database:

```
/companies
  /DEMO                    ← Demo company
  /{companyId}             ← Real companies

/users
  /{uid}                   ← User documents
    - email
    - role: "admin" | "handyman"
    - companyId
    - onboardingComplete: true/false
    - status: "active" | "pending"

/joinRequests
  /{requestId}             ← Join requests
    - handymanUid
    - companyId
    - status: "pending" | "approved" | "rejected"

/jobs
  /{jobId}
    - companyId: "DEMO" or real company ID
    - ...

/invoices
  /{invoiceId}
    - companyId: "DEMO" or real company ID
    - ...

/handymen
  /{handymanId}
    - companyId
    - ...

/servicePresets
  /{presetId}
    - companyId
    - ...

/settings
  /DEMO                    ← Demo settings
  /{companyId}             ← Company settings
```

### Authentication
Check Firebase Console → Authentication:
- [ ] Email/Password provider enabled
- [ ] Google provider enabled and configured
- [ ] Users created successfully
- [ ] User metadata populated

### Security Rules
Check Firebase Console → Firestore → Rules:
- [ ] Rules deployed successfully
- [ ] Rules version matches `firestore.rules` file
- [ ] Test rules simulator with sample queries

---

## Troubleshooting

### Build Errors

**Error:** `Module not found: Can't resolve 'firebase/auth'`
```bash
npm install firebase
```

**Error:** `Property 'companyId' does not exist`
```bash
# Make sure all types are updated in /lib/types.ts
# Rebuild
npm run build
```

### Auth Errors

**Error:** `auth/configuration-not-found`
- Check Firebase Console → Authentication → Sign-in method
- Enable Email/Password and Google providers

**Error:** `auth/unauthorized-domain`
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel domain (e.g., `your-app.vercel.app`)

### Firestore Errors

**Error:** `PERMISSION_DENIED: Missing or insufficient permissions`
- Deploy firestore rules: `firebase deploy --only firestore:rules`
- Check rules are correctly referencing `companyId`

**Error:** `collection().where() requires an index`
- Click the link in the error message to create the index
- Or go to Firebase Console → Firestore → Indexes

### Demo Data Not Showing

**Check:**
1. Seed script ran successfully
2. Documents exist in Firestore (check Firebase Console)
3. `companyId: "DEMO"` is set on all demo documents
4. Firestore rules allow public read for DEMO data

---

## Monitoring

### Firebase Console
- **Authentication → Users:** Monitor user signups
- **Firestore → Data:** Check data creation
- **Firestore → Usage:** Monitor read/write counts
- **Authentication → Usage:** Monitor auth requests

### Vercel Analytics
- **Functions:** Check API route performance
- **Logs:** Monitor for errors
- **Speed Insights:** Page load performance

### Recommended Alerts
1. Firestore read/write quota approaching limit
2. Authentication error rate > 5%
3. API route error rate > 1%

---

## Rollback Plan

If issues arise:

### Rollback Firestore Rules
```bash
# Restore previous rules
firebase deploy --only firestore:rules --force
```

### Rollback Vercel Deployment
```bash
# Via Vercel CLI
vercel rollback

# Or via Vercel dashboard
# Deployments → Previous deployment → Promote to Production
```

### Revert Code
```bash
git revert HEAD
git push origin main
```

---

## Success Criteria

✅ Build completes without errors
✅ Demo mode works for unauthenticated users
✅ Email/password signup works
✅ Google signup works
✅ Admin onboarding creates company
✅ Handyman onboarding sends join request
✅ Admin can approve/reject join requests
✅ Firestore rules deployed
✅ Demo data seeded
✅ Production site accessible
✅ No console errors

---

## Next Steps After Deployment

1. **Update remaining pages** to use authenticated user's `companyId` (see `EXAMPLE_PAGE_UPDATE.md`)
2. **Test multi-tenancy** with multiple companies
3. **Add monitoring** and alerts
4. **Optimize performance** (caching, lazy loading)
5. **Add analytics** (track user signups, job creation, etc.)
6. **Add email notifications** for join requests
7. **Add user profile** page
8. **Add company settings** page

---

## Support

If you encounter issues:
1. Check [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) for architecture details
2. Check [EXAMPLE_PAGE_UPDATE.md](./EXAMPLE_PAGE_UPDATE.md) for migration examples
3. Review Firebase Console logs
4. Review Vercel deployment logs
5. Check browser console for client-side errors
