# Testing Guide: Bank Details Prompt

## Quick Test Checklist

### Prerequisites
- Admin account already created (before bank details feature)
- Access to Firestore console
- ROSCO app running locally or in staging

### Test 1: Dashboard Banner
**Goal**: Verify banner shows for admins without subaccount

1. Open Firestore console
2. Find your company document in `companies` collection
3. Remove fields: `subaccountCode`, `settlementBank`, `accountNumber` (if they exist)
4. Login to ROSCO as admin
5. Navigate to dashboard

**Expected Result**:
- ✅ Banner appears at top: "Complete your payment setup to receive 95% of customer payments directly"
- ✅ Banner has orange/gradient styling with alert icon
- ✅ "Set Up Now" button is present

**Screenshot Location**: Dashboard should show banner before KPI cards

---

### Test 2: Settings Page - Bank Form
**Goal**: Verify bank details form works correctly

1. Click "Set Up Now" on dashboard banner (or navigate to `/admin/settings`)
2. Scroll to "Bank Details" section

**Expected Result**:
- ✅ Bank dropdown is populated with SA banks (ABSA, Standard Bank, FNB, Nedbank, Capitec)
- ✅ Account number field accepts only numbers
- ✅ Account holder name is pre-filled with company name (read-only)
- ✅ Info banner explains 95/5 split

3. Select a bank from dropdown
4. Enter account number: `12345678` (8 digits minimum)
5. Click "Save Bank Details"

**Expected Result**:
- ✅ Button shows "Saving..." during API call
- ✅ Success toast appears: "Bank details saved! Payment split configured."
- ✅ Page refreshes automatically
- ✅ Bank details section now shows "Payment Setup Complete" with green checkmark
- ✅ Configured bank and account (masked) are displayed

**Firestore Verification**:
Check company document:
```javascript
{
  settlementBank: "051001",  // Bank code
  accountNumber: "12345678",
  subaccountCode: "ACCT_xxxxxxxxxxxx"  // Added by Paystack
}
```

---

### Test 3: Dashboard Banner Disappears
**Goal**: Verify banner no longer shows after setup

1. Navigate back to dashboard

**Expected Result**:
- ✅ Banner no longer appears
- ✅ Dashboard shows normal KPI cards immediately

---

### Test 4: Invoice Payment Link Warning (Before Setup)
**Goal**: Verify warning shows when bank not configured

**Setup**: Remove `subaccountCode` from company document again

1. Navigate to any invoice detail page (`/admin/invoices/[id]`)
2. Scroll to "Actions" section

**Expected Result**:
- ✅ Warning banner appears above actions: "⚠️ Bank Details Not Configured"
- ✅ Warning explains payments won't be split
- ✅ "Set Up Now →" link navigates to settings

3. Click "Generate Payment Link"

**Expected Result**:
- ✅ Toast warning appears: "⚠️ Bank details not configured. Payments will go to platform account. Set up in Settings."
- ✅ Payment link is still generated (despite warning)

---

### Test 5: Invoice Payment Link (After Setup)
**Goal**: Verify warning disappears after bank setup

**Setup**: Ensure company has `subaccountCode` (complete Test 2 first)

1. Navigate to invoice detail page
2. Check "Actions" section

**Expected Result**:
- ✅ No warning banner appears
- ✅ "Generate Payment Link" works without toast warning

---

### Test 6: Edge Cases

#### Invalid Account Number
1. Go to Settings → Bank Details
2. Select a bank
3. Enter account number: `123` (less than 8 digits)
4. Click "Save Bank Details"

**Expected Result**:
- ✅ Toast error: "Account number must be at least 8 digits"
- ✅ No API call made

#### Network Error Simulation
1. Block network requests to `/api/companies/current` (browser DevTools)
2. Reload dashboard

**Expected Result**:
- ✅ Banner doesn't crash the page
- ✅ Console shows error but app continues to work

#### Paystack API Failure
**Setup**: Set invalid Paystack secret key in `.env`

1. Try to save bank details

**Expected Result**:
- ✅ Toast error: "Failed to create Paystack subaccount"
- ✅ Error details shown in console
- ✅ Form remains editable (user can retry)

---

## Automated Test Ideas

```typescript
// Example test cases for future implementation

describe('Bank Details Feature', () => {
  it('should show banner when subaccountCode is missing', async () => {
    // Setup: company without subaccountCode
    // Assert: banner is visible
  });

  it('should hide banner when subaccountCode exists', async () => {
    // Setup: company with subaccountCode
    // Assert: banner is not visible
  });

  it('should save bank details and create subaccount', async () => {
    // Act: submit bank details form
    // Assert: company document updated with subaccountCode
  });

  it('should show warning on payment link generation without bank', async () => {
    // Setup: company without subaccountCode
    // Act: click "Generate Payment Link"
    // Assert: warning toast appears
  });

  it('should validate account number length', async () => {
    // Act: enter 7-digit account number
    // Assert: error message shown
  });
});
```

---

## Rollback Plan

If issues arise:

1. **Remove banner** (comment out in `app/admin/page.tsx`):
   ```tsx
   {/* <BankSetupBanner /> */}
   ```

2. **Disable form** (comment out in `app/admin/settings/page.tsx`):
   ```tsx
   {/* company && <BankDetailsForm ... /> */}
   ```

3. **Revert commit**:
   ```bash
   git revert 540496d
   ```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Test all scenarios above in staging
- [ ] Verify Paystack API keys are correct in production `.env`
- [ ] Check Firestore security rules allow company updates
- [ ] Monitor error logs after deployment
- [ ] Prepare support team with documentation
- [ ] Add monitoring for bank setup completion rate
- [ ] Test with real bank account numbers (QA environment)

---

## Known Limitations

1. **No Edit Function**: Once bank details are saved, admins cannot edit them through UI
   - Workaround: Contact support or manually update Firestore
   - Future: Add "Edit Bank Details" feature

2. **No Bank Verification**: Account number is not verified with the bank
   - Paystack supports account verification API
   - Future: Add verification step before saving

3. **Single Currency**: Form assumes ZAR/South African banks
   - Future: Support multiple countries/currencies

---

## Support FAQ

**Q: What if admin enters wrong bank details?**
A: Currently requires manual Firestore edit. Future: Add edit functionality.

**Q: Can admin skip bank setup?**
A: Yes, banner is non-blocking. They can dismiss and continue using the app.

**Q: What happens to payments if bank not set up?**
A: Payments go to ROSCO platform account (100%). Admin receives warning toast.

**Q: How long does Paystack subaccount creation take?**
A: Usually instant (< 2 seconds). If it fails, error message shown immediately.

**Q: Can admin change bank details later?**
A: Not through UI currently. Requires creating new Paystack subaccount.
