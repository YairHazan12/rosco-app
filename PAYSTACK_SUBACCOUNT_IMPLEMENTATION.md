# Paystack Subaccount Implementation - Platform Revenue Split

## Overview

Implemented automatic Paystack subaccount creation for companies to enable split payments:
- **95% to company** (business)
- **5% to ROSCO platform** (revenue)

Companies provide bank details during signup (optional) or can add them later. When an invoice is paid, Paystack automatically splits the payment according to the configured percentages.

---

## Architecture

### Revenue Model
- **NOT** a handyman payment mechanism
- **IS** a platform fee for using ROSCO
- Companies pay their handymen separately (outside the platform)
- Platform earns 5% on all transactions processed through Paystack

### Data Model

#### Company (in `lib/auth-types.ts`)
```typescript
export interface Company {
  id: string;
  name: string;
  companyNameLower: string;
  companyCode: string;
  adminUid: string;
  settings?: { ... };
  // Paystack subaccount fields
  settlementBank?: string;      // Bank code (e.g., "044")
  accountNumber?: string;        // Company bank account
  subaccountCode?: string;       // Paystack subaccount (ACCT_xxx)
  createdAt: string;
}
```

#### OnboardingData (in `lib/auth-types.ts`)
```typescript
export interface OnboardingData {
  // ... existing fields
  // Bank details (optional during signup)
  settlementBank?: string;
  accountNumber?: string;
}
```

---

## Files Created

### 1. `lib/paystack.ts`
Server-side Paystack API helpers:
- `createPaystackSubaccount()` - Creates subaccount with 95% split
- `getPaystackBanks()` - Fetches list of supported banks

### 2. `app/api/paystack/subaccounts/route.ts`
API endpoints for subaccount management:
- `POST /api/paystack/subaccounts` - Create subaccount
- `GET /api/paystack/subaccounts` - Get bank list

### 3. `app/api/companies/[id]/route.ts`
Company management endpoints:
- `PUT /api/companies/[id]` - Update company (creates subaccount if bank details provided)
- `GET /api/companies/[id]` - Fetch company details

---

## Files Modified

### 1. `lib/auth-types.ts`
- Added bank fields to `Company` interface
- Added bank fields to `OnboardingData` interface

### 2. `lib/auth-helpers.ts`
**Function: `completeAdminOnboarding()`**
- Added logic to create Paystack subaccount if bank details provided during signup
- Stores `subaccountCode` in company document
- Graceful fallback if Paystack creation fails

### 3. `app/api/invoices/[id]/payment-link/route.ts`
**Function: `POST /api/invoices/[id]/payment-link`**
- Fetches company subaccount code
- Includes `subaccount` in Paystack transaction initialization
- Automatic 95/5 split based on subaccount configuration
- Logs split status for debugging

---

## How It Works

### 1. Company Signup (with bank details)
```
Admin creates account
  → Provides company name + bank details
  → `completeAdminOnboarding()` called
  → Calls POST /api/paystack/subaccounts
  → Paystack creates subaccount (95% split)
  → subaccountCode stored in company record
```

### 2. Company Signup (without bank details)
```
Admin creates account
  → Provides company name only
  → Company created without subaccount
  → Can add bank details later via PUT /api/companies/[id]
```

### 3. Adding Bank Details Later
```
Admin updates company settings
  → Provides settlement_bank + account_number
  → PUT /api/companies/[id]
  → Checks if subaccount exists
  → Creates subaccount if missing
  → Updates company record
```

### 4. Invoice Payment with Split
```
Customer pays invoice
  → POST /api/invoices/[id]/payment-link
  → Fetches company subaccount code
  → Initializes Paystack transaction with { subaccount: "ACCT_xxx" }
  → Paystack processes payment:
      • 95% → Company bank account
      • 5% → ROSCO platform account
  → Customer redirected to Paystack checkout
```

---

## Environment Variables Required

```env
# Paystack Configuration (required for split payments)
PAYSTACK_SECRET_KEY="sk_test_..." or "sk_live_..."
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..." or "pk_live_..."
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

---

## API Endpoints

### Create Subaccount
```http
POST /api/paystack/subaccounts
Content-Type: application/json

{
  "businessName": "ABC Handyman Services",
  "settlementBank": "044",
  "accountNumber": "0123456789"
}

Response:
{
  "success": true,
  "subaccountCode": "ACCT_xxxxxxxxxx",
  "data": { ... }
}
```

### Get Bank List
```http
GET /api/paystack/subaccounts

Response:
{
  "success": true,
  "banks": [
    { "name": "Access Bank", "code": "044" },
    { "name": "GTBank", "code": "058" },
    ...
  ]
}
```

### Update Company
```http
PUT /api/companies/{companyId}
Content-Type: application/json

{
  "settlementBank": "044",
  "accountNumber": "0123456789"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "subaccountCode": "ACCT_xxxxxxxxxx",
    ...
  }
}
```

---

## Testing

### 1. Test Subaccount Creation
```bash
curl -X POST http://localhost:3000/api/paystack/subaccounts \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Company",
    "settlementBank": "044",
    "accountNumber": "0123456789"
  }'
```

### 2. Test Company Update
```bash
curl -X PUT http://localhost:3000/api/companies/DEMO \
  -H "Content-Type: application/json" \
  -d '{
    "settlementBank": "044",
    "accountNumber": "0123456789"
  }'
```

### 3. Test Invoice Payment Flow
1. Create an invoice via admin panel
2. Generate payment link
3. Check server logs for split payment confirmation:
   ```
   💰 Split payment enabled: 95% → Company Name, 5% → ROSCO Platform
   ```
4. Complete payment on Paystack
5. Verify settlement:
   - Company receives 95% in their bank account
   - Platform receives 5% in main Paystack account

---

## Error Handling

### Graceful Degradation
- If Paystack API fails during signup → company created without subaccount
- If bank details invalid → error returned, company not updated
- If subaccount doesn't exist during payment → full amount goes to platform

### Logging
- `✅ Paystack subaccount created: ACCT_xxx` - Success
- `⚠️  No subaccount found for company X` - Missing subaccount
- `❌ Paystack subaccount creation failed` - API error

---

## Next Steps (Optional Enhancements)

### 1. Admin Dashboard
- Show subaccount status (active, pending, missing)
- Bank details form in settings
- Test connection button

### 2. Subaccount Verification
- Check if bank account is valid before creating subaccount
- Display verification status to admin

### 3. Revenue Dashboard
- Show total platform earnings (5% from all transactions)
- Per-company revenue breakdown
- Settlement history

### 4. Webhooks
- Listen for `charge.success` event
- Verify split settlement
- Update analytics

---

## Security Considerations

1. **Server-side only**: Paystack secret key never exposed to client
2. **Bank details**: Stored in Firestore (consider encryption for production)
3. **Admin-only**: Only company admin can update bank details
4. **Validation**: Bank code and account number validated before API call

---

## Production Checklist

- [ ] Replace test Paystack keys with live keys
- [ ] Test with real bank accounts
- [ ] Set up Paystack webhook for payment confirmations
- [ ] Monitor split settlements in Paystack dashboard
- [ ] Add bank detail encryption (optional)
- [ ] Add audit logging for bank detail changes
- [ ] Test edge cases (missing subaccount, invalid bank details)
- [ ] Document for users (how to add bank details, what 5% fee means)

---

## Summary

**What was implemented:**
✅ Company bank fields in data model  
✅ Paystack subaccount creation on signup  
✅ API endpoint to add bank details later  
✅ Automatic split payment (95/5) on invoices  
✅ Graceful error handling  
✅ Server-side security  

**What was NOT changed:**
❌ Handyman model (remains unchanged)  
❌ Handyman payment flow (companies pay handymen outside platform)  
❌ UI (no forms yet for bank details - API ready)  

The backend is complete. Frontend forms can be added to collect bank details during onboarding or in company settings.
