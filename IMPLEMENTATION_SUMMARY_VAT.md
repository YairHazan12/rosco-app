# Location-Based VAT Calculation Implementation Summary

## Overview
Successfully implemented dynamic VAT calculation based on user's country setting in the ROSCO invoice system.

## Changes Made

### 1. Type Definitions (`lib/types.ts`)
- Added optional `country` field to `AppSettings` interface
- Type: `"IL" | "GB" | "DE" | "FR" | "US"`
- Used for determining VAT rate on invoices

### 2. VAT Rates Module (`lib/vat-rates.ts`) - NEW FILE
Created a centralized module for VAT rate management:

**Exports:**
- `VAT_RATES`: Object mapping country codes to decimal rates
  - IL: 0.17 (17%)
  - GB: 0.20 (20%)
  - DE: 0.19 (19%)
  - FR: 0.20 (20%)
  - US: 0.00 (0%)

- `COUNTRY_NAMES`: Display names for each country

- `getVatRate(countryCode?)`: Returns VAT rate for a country (defaults to IL)

- `getVatLabel(countryCode?)`: Returns formatted label like "VAT (GB 20%)" or "VAT (17%)"

- `getAvailableCountries()`: Returns array of {code, name, rate} for UI dropdowns

### 3. Database Defaults (`lib/db.ts`)
- Updated `DEFAULT_SETTINGS` to include `country: "IL"` as the default
- Ensures backward compatibility for existing installations

### 4. Settings UI (`app/admin/profile/_components/SettingsForm.tsx`)
Added country selection dropdown in the Regional Settings section:

```tsx
<div className="flex items-center justify-between py-3.5">
  <div>
    <p>Country</p>
    <p>For VAT/tax calculation on invoices</p>
  </div>
  <select value={settings.country || "IL"}>
    {COUNTRIES.map((c) => (
      <option value={c.code}>
        {c.name} ({Math.round(c.rate * 100)}%)
      </option>
    ))}
  </select>
</div>
```

Features:
- Shows country name with VAT rate percentage
- Saves to Firestore via existing `/api/settings` endpoint
- Integrates seamlessly with existing settings form

### 5. Invoice Editor Page (`app/admin/invoices/new/page.tsx`)
- Added `getSettings(companyId)` to data fetching
- Passes `settings` prop to `InvoiceEditor` component
- Runs in parallel with job and presets fetch (no performance impact)

### 6. Invoice Editor Component (`app/admin/invoices/_components/InvoiceEditor.tsx`)
Updated to use dynamic VAT:

**Changes:**
- Replaced hardcoded `VAT_RATE = 0.17` with `getVatRate(settings.country)`
- Added `vatLabel` using `getVatLabel(settings.country)`
- Updated VAT toggle subtitle to show current rate and country: `{Math.round(VAT_RATE * 100)}% — {settings.country || "IL"}`
- Updated VAT line in summary to use `vatLabel` instead of hardcoded "VAT (17%)"

**Calculations:**
```typescript
const VAT_RATE = getVatRate(settings.country);  // Dynamic based on country
const vatLabel = getVatLabel(settings.country);  // "VAT (GB 20%)" etc.
const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
const vatAmount = vatEnabled ? subtotal * VAT_RATE : 0;
const total = subtotal + vatAmount;
```

## Feature Highlights

### ✅ Backward Compatible
- Existing installations default to IL (17%) if no country is set
- No breaking changes to existing invoices

### ✅ Persistent
- Country setting is saved in Firestore `settings` collection
- Cached for 5 minutes via Next.js unstable_cache
- Revalidated immediately on settings update

### ✅ User-Friendly
- Country dropdown shows VAT rate preview: "United Kingdom (20%)"
- Invoice editor shows current VAT rate in toggle subtitle
- VAT summary line shows country-specific label

### ✅ Accurate Calculations
- VAT rate pulled from centralized `vat-rates.ts` module
- Invoice stores `vatRate` at creation time (preserves historical accuracy)
- Calculations update in real-time when country changes

### ✅ Extensible
- Easy to add new countries by updating `VAT_RATES` object
- Type-safe with TypeScript
- Centralized rate management

## Testing

### Build Status
✅ **Production build successful** with no TypeScript errors

### Manual Testing Checklist
See `TEST_VAT_CALCULATION.md` for complete test plan

**Quick Verification:**
1. Navigate to Admin → Profile → Settings
2. Verify "Country" dropdown appears in Regional section
3. Change country to different values
4. Create a new invoice and verify:
   - VAT toggle shows correct percentage and country
   - VAT calculations use the correct rate
   - VAT summary line shows country-specific label

## Files Changed

```
app/admin/invoices/_components/InvoiceEditor.tsx    (modified)
app/admin/invoices/new/page.tsx                     (modified)
app/admin/profile/_components/SettingsForm.tsx      (modified)
lib/db.ts                                            (modified)
lib/types.ts                                         (modified)
lib/vat-rates.ts                                     (NEW)
```

## Git Branch
`feature/dynamic-vat-by-location`

## Commit Message
```
feat: Add location-based VAT calculation

- Add country field to AppSettings type (IL, GB, DE, FR, US)
- Create lib/vat-rates.ts with VAT rates for multiple countries
- Update InvoiceEditor to use dynamic VAT rate based on user's country setting
- Display country-specific VAT label (e.g., 'VAT (GB 20%)' instead of 'VAT (17%)')
- Add country selection dropdown to settings page with VAT rate preview
- Default to Israel (17%) if no country is set
- Invoice calculations now update dynamically based on country setting
```

## Next Steps

### Optional Enhancements
1. **Add more countries**: Extend `VAT_RATES` with additional countries as needed
2. **Historical invoices**: Consider adding a migration to backfill `country` field on existing invoices
3. **Currency alignment**: Consider linking currency and country (e.g., GB → GBP, US → USD)
4. **Unit tests**: Add tests for `vat-rates.ts` utility functions
5. **Invoice display**: Show country/VAT rate on invoice detail and payment pages
6. **Multi-rate support**: Some countries have multiple VAT rates (standard, reduced, zero) - could be expanded

### Deployment Checklist
- [x] Code implemented
- [x] Types updated
- [x] Build passes
- [x] Committed to feature branch
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Test on live environment
- [ ] Update user documentation

## Notes

- VAT rates are accurate as of implementation date (2026-03-25)
- Rates may change over time - consider periodic review
- Currency symbol remains "R" (South African Rand) regardless of country
- The invoice stores both `vatRate` and `vatEnabled` at creation time, ensuring historical invoices remain accurate even if settings change later
