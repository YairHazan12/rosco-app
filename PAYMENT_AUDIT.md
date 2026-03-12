# Payment System Audit Report - ROSCO
**Date:** March 12, 2026
**Auditor:** Jarvis

## Executive Summary
✅ **Paystack is properly configured as the single payment provider**
⚠️ **Old seed invoices lack Paystack references**
✅ **No legacy payment providers found**

---

## 1. Current Implementation Status

### ✅ Paystack Integration (COMPLETE)

**API Endpoints:**
- `/api/invoices/[id]/payment-link` - Initialize Paystack transaction
- `/api/webhooks/paystack` - Handle Paystack webhooks (charge.success)

**Payment Flow:**
1. Customer visits `/pay/[invoiceId]`
2. Clicks "Pay" → Calls payment-link API
3. Redirected to Paystack checkout
4. After payment:
   - **Primary:** Webhook updates invoice to "Paid" (async)
   - **Fallback:** Success page verifies transaction if webhook fails
5. Success page displays confirmation

**Security:**
- Webhook signature verification (HMAC SHA512)
- Server-side transaction verification
- Double-write protection (checks if already paid)

**Database Fields (Invoice):**
```typescript
paystackReference?: string;        // Unique transaction ref
paystackAccessCode?: string;       // Paystack access code
paystackAuthorizationUrl?: string; // Checkout URL
paidAt?: string;                   // Payment timestamp
```

---

## 2. Issues Found

### ⚠️ Issue #1: Seed Data Invoices Missing Paystack References

**Problem:**
The `seedDatabase()` function in `lib/db.ts` creates one invoice for the completed demo job, but it doesn't include Paystack fields:

```typescript
await createInvoice({
  companyId: DEMO_COMPANY_ID,
  jobId: completedJob.id,
  // ... other fields ...
  status: "Sent", // ❌ "Sent" but no paystackReference/authorizationUrl
});
```

**Impact:**
- Seed invoice appears as "Sent" but has no payment link
- Admin can't share payment link (it will regenerate on demand, but should be pre-populated)
- Historical data doesn't reflect real-world state

**Severity:** LOW (demo data only, but should be corrected for realism)

---

### ⚠️ Issue #2: CompanyId Handling in Webhook

**Code:**
```typescript
// app/api/webhooks/paystack/route.ts
await updateInvoice(
  invoiceId,
  {
    status: "Paid",
    paidAt: new Date().toISOString(),
  },
  undefined // ❌ No companyId validation
);
```

**Problem:**
- Webhook doesn't validate `companyId` (passes `undefined`)
- This is necessary because webhook doesn't have auth context
- However, `updateInvoice` will use companyId from invoice data if present

**Current Safety:**
- `updateInvoice` tries to use `data.companyId` if provided
- Falls back to `companyId || "DEMO"` if not
- Invoice lookup uses cached collection

**Recommendation:**
Add `companyId` to Paystack metadata so webhook can validate:
```typescript
metadata: {
  invoiceId: invoice.id,
  companyId: invoice.companyId, // ✅ Add this
  // ...
}
```

Then in webhook:
```typescript
const { reference, metadata } = event.data;
const invoiceId = metadata?.invoiceId;
const companyId = metadata?.companyId || "DEMO";
await updateInvoice(invoiceId, { status: "Paid", paidAt: ... }, companyId);
```

**Severity:** MEDIUM (security hardening)

---

### ✅ No Legacy Payment Providers

**Verified:**
- ✅ No Stripe dependencies
- ✅ No PayPal dependencies
- ✅ No Square dependencies
- ✅ Only `paystack-node` package installed
- ✅ All payment code references Paystack

**Note:** PayPal references in `package-lock.json` are just donation links from dependency maintainers, not actual integrations.

---

## 3. Recommended Actions

### Priority 1: Fix CompanyId in Webhook (MEDIUM PRIORITY)

**File:** `app/api/invoices/[id]/payment-link/route.ts`

**Change:**
```typescript
metadata: {
  invoiceId: invoice.id,
  companyId: invoice.companyId, // ✅ ADD THIS LINE
  clientName: invoice.clientName,
  // ...
}
```

**File:** `app/api/webhooks/paystack/route.ts`

**Change:**
```typescript
const { reference, metadata } = event.data;
const invoiceId = metadata?.invoiceId;
const companyId = metadata?.companyId || "DEMO"; // ✅ ADD THIS LINE

if (!invoiceId) {
  console.error("No invoice ID in webhook metadata");
  return NextResponse.json({ error: "No invoice ID" }, { status: 400 });
}

await updateInvoice(invoiceId, {
  status: "Paid",
  paidAt: new Date().toISOString(),
}, companyId); // ✅ PASS companyId
```

---

### Priority 2: Update Seed Data (LOW PRIORITY)

**Option A: Generate Real Payment Links During Seed**
Modify `seedDatabase()` to call Paystack API and generate real test links.

**Option B: Leave as "Draft" Status**
Change seed invoice status from "Sent" to "Draft" since it has no payment link.

**Recommended:** Option B (simpler, more realistic)

**File:** `lib/db.ts`

**Change:**
```typescript
await createInvoice({
  companyId: DEMO_COMPANY_ID,
  jobId: completedJob.id,
  // ...
  status: "Draft", // ✅ Changed from "Sent"
});
```

---

### Priority 3: Sync Old Invoices Script (OPTIONAL)

If you have real production invoices created before Paystack integration, create a migration script:

**File:** `scripts/sync-old-invoices.ts`

```typescript
import { getInvoices, updateInvoice } from "@/lib/db";

async function syncOldInvoices() {
  const invoices = await getInvoices("DEMO"); // or your real companyId
  
  for (const invoice of invoices) {
    // If invoice is "Sent" but has no Paystack reference
    if (invoice.status === "Sent" && !invoice.paystackReference) {
      console.log(`⚠️ Invoice ${invoice.id} marked "Sent" but missing payment link`);
      
      // Option A: Regenerate payment link
      // (call payment-link API)
      
      // Option B: Mark as "Draft" to force manual regeneration
      await updateInvoice(invoice.id, { status: "Draft" }, invoice.companyId);
      console.log(`✅ Updated ${invoice.id} to Draft`);
    }
    
    // If invoice is "Paid" but has no paidAt timestamp
    if (invoice.status === "Paid" && !invoice.paidAt) {
      console.log(`⚠️ Invoice ${invoice.id} is Paid but missing paidAt`);
      await updateInvoice(
        invoice.id,
        { paidAt: invoice.updatedAt || new Date().toISOString() },
        invoice.companyId
      );
      console.log(`✅ Added paidAt to ${invoice.id}`);
    }
  }
  
  console.log("✅ Sync complete");
}

syncOldInvoices().catch(console.error);
```

**Usage:**
```bash
npx tsx scripts/sync-old-invoices.ts
```

---

## 4. Payment Logic Verification

### ✅ Payment Verification Logic (SOUND)

**Double verification approach:**
1. **Webhook** (primary): Updates invoice immediately when Paystack confirms
2. **Success page** (fallback): Verifies transaction if webhook didn't fire

**Success Page Logic:**
```typescript
// If not paid AND has reference → verify with Paystack API
if (invoice.status !== "Paid" && transactionReference) {
  const isVerified = await verifyPaystackTransaction(transactionReference);
  if (isVerified) {
    await updateInvoice(invoiceId, { status: "Paid", paidAt: ... });
  } else {
    redirect(`/pay/${invoiceId}?error=verification_failed`);
  }
}
```

**Why this is good:**
- Webhook is instant (customer sees confirmation immediately)
- Success page is safety net (if webhook fails due to network/timing)
- Prevents double-charging (checks `status !== "Paid"` first)
- Validates with Paystack API (not trusting query params)

---

## 5. Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Webhook signature verification | ✅ | HMAC SHA512 validated |
| Server-side transaction verification | ✅ | API call to Paystack |
| Amount validation | ⚠️ | Not currently checked |
| Reference uniqueness | ✅ | `ROSCO-{id}-{timestamp}` |
| CompanyId validation | ⚠️ | Should be in webhook metadata |
| Double-payment prevention | ✅ | Checks `status !== "Paid"` |
| HTTPS only | ✅ | Webhook requires HTTPS in prod |

**Recommendation: Add amount validation in webhook:**
```typescript
const paidAmount = event.data.amount / 100; // Convert from kobo
const invoice = await getInvoice(invoiceId, companyId);

if (Math.abs(paidAmount - invoice.total) > 0.01) {
  console.error(`Amount mismatch: expected ${invoice.total}, got ${paidAmount}`);
  return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
}
```

---

## 6. Summary & Action Items

### ✅ What's Working Well
- Single payment provider (Paystack)
- Proper webhook handling with signature verification
- Fallback verification on success page
- Clean separation of concerns (API routes, components, db layer)
- Proper cache invalidation after payment

### 🔧 Recommended Fixes

**High Priority:**
1. ✅ Add `companyId` to Paystack metadata (webhook security)

**Medium Priority:**
2. ⚠️ Add amount validation in webhook
3. ⚠️ Change seed invoice status to "Draft" (more realistic)

**Low Priority:**
4. 📝 Create sync script for old invoices (if needed for production data)

---

## 7. Testing Checklist

Before deploying payment changes, test:

- [ ] Create invoice → Generate payment link
- [ ] Pay with test card → Webhook updates invoice to "Paid"
- [ ] Pay with test card → Success page shows confirmation
- [ ] Pay with failing card → Shows error, invoice stays unpaid
- [ ] Access success page without paying → Redirects to payment page
- [ ] Pay twice for same invoice → Second attempt rejected
- [ ] Verify webhook with wrong signature → Rejected (401)
- [ ] Verify with CompanyId mismatch → Handled gracefully

**Paystack Test Cards:**
```
✅ Success: 4084 0840 8408 4081
❌ Decline: 5061 4607 0840 8408 5060
```

---

## Conclusion

**Overall Grade: A-**

The payment system is well-architected with Paystack as the sole provider. The main improvements needed are:
1. Security hardening (companyId validation)
2. Seed data cleanup
3. Optional migration for old invoices

No legacy payment providers were found - Paystack is correctly implemented throughout.
