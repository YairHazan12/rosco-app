# VAT Calculation Test Plan

## Overview
This document outlines test cases for the location-based VAT calculation feature.

## Test Cases

### 1. Default Settings (Israel)
**Steps:**
1. Open the app without any country set in settings
2. Create a new invoice
3. Add an item with price R100

**Expected Results:**
- VAT toggle shows "17% — IL"
- VAT amount should be R17.00
- Total should be R117.00
- VAT label in summary shows "VAT (17%)"

### 2. Change Country to United Kingdom
**Steps:**
1. Navigate to Admin Profile → Settings
2. Change Country dropdown to "United Kingdom (20%)"
3. Save settings
4. Create a new invoice
5. Add an item with price R100

**Expected Results:**
- VAT toggle shows "20% — GB"
- VAT amount should be R20.00
- Total should be R120.00
- VAT label in summary shows "VAT (GB 20%)"

### 3. Change Country to Germany
**Steps:**
1. Navigate to Admin Profile → Settings
2. Change Country dropdown to "Germany (19%)"
3. Save settings
4. Create a new invoice
5. Add an item with price R100

**Expected Results:**
- VAT toggle shows "19% — DE"
- VAT amount should be R19.00
- Total should be R119.00
- VAT label in summary shows "VAT (DE 19%)"

### 4. Change Country to United States (No VAT)
**Steps:**
1. Navigate to Admin Profile → Settings
2. Change Country dropdown to "United States (0%)"
3. Save settings
4. Create a new invoice
5. Add an item with price R100

**Expected Results:**
- VAT toggle shows "0% — US"
- VAT amount should be R0.00
- Total should be R100.00
- VAT label in summary shows "VAT (US 0%)"

### 5. VAT Toggle Off
**Steps:**
1. Set country to any value (e.g., France)
2. Create a new invoice
3. Add an item with price R100
4. Toggle VAT off

**Expected Results:**
- VAT amount should be R0.00
- Total should be R100.00
- VAT line should not appear in summary

### 6. Multiple Items with Different Countries
**Steps:**
1. Set country to UK (20%)
2. Create invoice with:
   - Item 1: R50 × 2 = R100
   - Item 2: R30 × 1 = R30
3. Subtotal should be R130

**Expected Results:**
- Subtotal: R130.00
- VAT (20%): R26.00
- Total: R156.00

### 7. Settings Persistence
**Steps:**
1. Set country to Germany
2. Save settings
3. Refresh the page
4. Create a new invoice

**Expected Results:**
- Country setting should still be Germany
- VAT rate should still be 19%

## Manual Testing Checklist

- [ ] Default country (IL) shows 17% VAT
- [ ] Country dropdown appears in settings page
- [ ] Country dropdown shows all 5 countries (IL, GB, DE, FR, US)
- [ ] Each country shows correct VAT rate in dropdown
- [ ] Settings save successfully
- [ ] Invoice editor picks up country from settings
- [ ] VAT rate updates when country changes
- [ ] VAT label displays country code correctly
- [ ] Calculations are accurate for all countries
- [ ] VAT toggle works correctly
- [ ] Multiple items calculate correctly
- [ ] Settings persist across page refreshes

## Automated Test Ideas (Future)

```typescript
// Example unit tests for vat-rates.ts
describe('getVatRate', () => {
  it('should return 0.17 for Israel', () => {
    expect(getVatRate('IL')).toBe(0.17);
  });
  
  it('should return 0.20 for UK', () => {
    expect(getVatRate('GB')).toBe(0.20);
  });
  
  it('should default to Israel when no country provided', () => {
    expect(getVatRate()).toBe(0.17);
  });
});

describe('getVatLabel', () => {
  it('should format label with country code for non-default countries', () => {
    expect(getVatLabel('GB')).toBe('VAT (GB 20%)');
  });
  
  it('should format label without country code for default', () => {
    expect(getVatLabel('IL')).toBe('VAT (17%)');
  });
});
```

## Notes

- All VAT calculations are based on the country setting in AppSettings
- VAT rates are centralized in `lib/vat-rates.ts`
- The invoice stores the `vatRate` at creation time, so historical invoices preserve their original rate
- Currency symbol remains "R" regardless of country (this is expected for South African Rand)
