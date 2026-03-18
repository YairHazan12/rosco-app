# Bank Details Prompt Implementation

## Overview
This implementation adds a bank details collection flow for existing ROSCO admin accounts that were created before the Paystack subaccount feature was added.

## Changes Made

### 1. Dashboard Banner Alert (`app/admin/_components/bank-setup-banner.tsx`)
- **Purpose**: Prominently alerts admins who haven't set up bank details
- **Location**: Top of admin dashboard
- **Behavior**: 
  - Fetches company data from `/api/companies/current`
  - Shows banner only if `subaccountCode` is missing
  - Provides CTA button linking to Settings page
- **Message**: "Complete your payment setup to receive 95% of customer payments directly"

### 2. Settings Page - Bank Details Section (`app/admin/settings/_components/BankDetailsForm.tsx`)
- **Purpose**: Allows admins to add bank details after account creation
- **Features**:
  - **Bank selection dropdown**: Fetches banks from Paystack API (with fallback to major SA banks)
  - **Account number field**: Numeric input with validation (min 8 digits)
  - **Account holder name**: Pre-filled with company name (read-only)
  - **Status display**: Shows different UI when bank details are already configured
- **API Integration**: 
  - Uses existing `PUT /api/companies/{id}` endpoint
  - Automatically creates Paystack subaccount when bank details are saved
  - Shows success message with confirmation

### 3. Payment Link Warning (`app/admin/invoices/_components/InvoiceActions.tsx`)
- **Purpose**: Warns admins when generating payment links without bank setup
- **Implementation**:
  - Checks company `subaccountCode` on component mount
  - Shows warning banner above invoice actions if not configured
  - Displays toast notification when "Generate Payment Link" is clicked without bank setup
- **Warning Message**: "⚠️ You haven't set up your bank details yet. Payments will not be split. Add your details in Settings."

### 4. API Endpoint (`app/api/companies/current/route.ts`)
- **Purpose**: Provides current company data to client components
- **Endpoint**: `GET /api/companies/current`
- **Response**: Returns company object including `subaccountCode`, `settlementBank`, `accountNumber`
- **Security**: Uses server-side cookie authentication (`getCompanyIdFromCookie`)

### 5. Firebase Admin Helper (`lib/firebase-admin.ts`)
- **Purpose**: Export `adminDb` helper for consistency with existing codebase
- **Change**: Added `adminDb` export wrapping Firestore collection access

## User Flow

### For Existing Admins (No Bank Details)
1. **Login** → See dashboard banner: "Complete your payment setup"
2. **Click "Set Up Now"** → Navigate to Settings page
3. **Fill bank form**:
   - Select bank from dropdown
   - Enter account number
   - Review pre-filled account holder name
4. **Click "Save Bank Details"** → Paystack subaccount created automatically
5. **Success** → Banner disappears, settings page shows "Payment Setup Complete" status

### When Generating Payment Links (Without Bank Setup)
1. **Navigate to invoice detail page**
2. **See warning banner**: "⚠️ Bank Details Not Configured"
3. **Click "Generate Payment Link"** → Toast warning displays
4. **Payment link still generated** (but goes to platform account, not company account)

## Technical Details

### Paystack Subaccount Creation
- Triggered automatically when bank details are saved via `PUT /api/companies/{id}`
- Creates subaccount with 95/5 split (95% to company, 5% to ROSCO platform)
- Stores `subaccountCode` in company document

### Form Validation
- Bank name: Required (dropdown selection)
- Account number: Required, min 8 digits, numeric only
- Account holder name: Auto-filled, read-only

### Error Handling
- Network errors: Shows toast error message
- Paystack API failures: Returns 400/500 with error details
- Graceful fallback: Uses hardcoded SA banks if Paystack banks API fails

## Testing Recommendations

### Manual Testing
1. **Test with existing account**:
   - Manually remove `subaccountCode` from a company document in Firestore
   - Login as admin → Should see dashboard banner
   - Navigate to Settings → Should see bank details form
   - Fill and submit → Verify subaccount created in Paystack dashboard

2. **Test payment link generation**:
   - Without bank setup: Verify warning banner and toast notification appear
   - With bank setup: Verify no warning, payment link includes subaccount split

3. **Test edge cases**:
   - Invalid account numbers (< 8 digits)
   - Network failures during save
   - Paystack API errors

### Database Check
```javascript
// Check company document structure
{
  id: "company123",
  name: "My Company",
  settlementBank: "051001",  // Bank code
  accountNumber: "1234567890",
  subaccountCode: "ACCT_xxx", // Added after bank setup
  ...
}
```

## Files Modified

### New Files
- `app/admin/_components/bank-setup-banner.tsx`
- `app/admin/settings/_components/BankDetailsForm.tsx`
- `app/api/companies/current/route.ts`

### Modified Files
- `app/admin/page.tsx` (added banner import and component)
- `app/admin/settings/page.tsx` (added bank details form)
- `app/admin/invoices/_components/InvoiceActions.tsx` (added warning)
- `lib/firebase-admin.ts` (exported adminDb helper)

## Notes

- **Backward Compatible**: Existing admins with bank details see no changes
- **Non-Blocking**: Admins can still generate payment links without bank setup (with warning)
- **Reuses Existing Logic**: Uses the same Paystack subaccount creation flow as signup
- **Mobile-First UI**: iOS-style components matching existing ROSCO design system
- **Production Ready**: Includes error handling, loading states, and validation

## Future Enhancements

1. **Email Notifications**: Remind admins to set up bank details after X days
2. **Bank Verification**: Add account verification step (Paystack supports this)
3. **Edit Bank Details**: Allow admins to update bank details (requires new Paystack subaccount)
4. **Analytics**: Track how many admins complete bank setup after seeing banner
