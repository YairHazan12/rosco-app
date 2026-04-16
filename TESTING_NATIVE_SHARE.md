# Testing Native PDF Sharing

This guide helps you test the new native PDF sharing feature on both desktop and mobile.

## Quick Start

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to an invoice or quote:**
   - Go to `/admin/billing/invoices/[id]`
   - Or `/admin/billing/quotes/[id]`

3. **Click the "More" (⋯) menu**

## Test Scenarios

### 📧 Email Sharing (Desktop/Mobile)

**Steps:**
1. Click "Share via Email" from the More menu
2. Observe:
   - Toast: "Generating PDF..."
   - PDF downloads to browser
   - Toast: "PDF downloaded. Opening email..."
   - Default email client opens with pre-filled content

**Expected mailto: link:**
```
mailto:client@example.com
?subject=Invoice%20%23INV-001%20from%20Business%20Name
&body=Please%20find%20attached%20invoice%20%23INV-001.%20Total%3A%20R1%2C234.00
```

**Verify:**
- ✅ Recipient email is correct
- ✅ Subject includes document number and business name
- ✅ Body includes document number and total amount
- ✅ PDF downloaded to Downloads folder
- ✅ Can manually attach PDF and send

---

### 💬 WhatsApp Sharing (Mobile with Web Share API)

**Device:** iOS Safari, Chrome Android

**Steps:**
1. Click "Share via WhatsApp" from the More menu
2. Observe:
   - Toast: "Generating PDF..."
   - Native share sheet appears
   - PDF is pre-attached
   - WhatsApp appears in share options

**Expected:**
3. Select WhatsApp from share sheet
4. WhatsApp opens with:
   - PDF pre-attached
   - Message pre-filled: "Hi Client Name, here's your invoice #XXX. Total: R1,234.00"

**Verify:**
- ✅ Share sheet includes WhatsApp option
- ✅ PDF is attached automatically
- ✅ Message is pre-filled correctly
- ✅ Can send directly from WhatsApp

---

### 💬 WhatsApp Sharing (Desktop Fallback)

**Device:** Desktop Chrome, Safari, Firefox

**Steps:**
1. Click "Share via WhatsApp" from the More menu
2. Observe:
   - Toast: "Generating PDF..."
   - PDF downloads to browser
   - Toast: "PDF downloaded. Opening WhatsApp..."
   - WhatsApp Web opens in new tab

**Expected WhatsApp Web URL:**
```
https://wa.me/27821234567?text=Hi%20Client%20Name%2C%0A%0AHere's%20your%20invoice%20%23INV-001.%20Total%3A%20R1%2C234.00
```

**Verify:**
- ✅ WhatsApp Web opens with correct phone number
- ✅ Message is pre-filled
- ✅ PDF is downloaded separately
- ✅ User can manually attach PDF and send

---

## Edge Cases to Test

### Missing Client Email
1. Create invoice without client email
2. Click "Share via Email"
3. **Expected:** Opens mailto: with blank recipient (user can type it)

### Missing Client Phone
1. Create invoice without client phone
2. Click "Share via WhatsApp"
3. **Expected:** Opens WhatsApp without phone number (user can select contact)

### Payment Link Included
1. Generate payment link for invoice
2. Share via email or WhatsApp
3. **Expected:** Message includes payment link

### Quote vs Invoice
1. Test with quote document
2. **Expected:**
   - Subject: "Quote #RQ-001 from Business Name"
   - Message includes quote details (not invoice)

---

## Browser Compatibility Testing

### Desktop Browsers
- [ ] Chrome (latest) - WhatsApp Web fallback
- [ ] Safari (latest) - WhatsApp Web fallback
- [ ] Firefox (latest) - WhatsApp Web fallback
- [ ] Edge (latest) - WhatsApp Web fallback

### Mobile Browsers
- [ ] iOS Safari - Web Share API ✅
- [ ] Chrome Android - Web Share API ✅
- [ ] Samsung Internet - Web Share API (check)
- [ ] Firefox Mobile - WhatsApp Web fallback (no Web Share)

---

## Debugging

### Web Share API Not Working
**Check in browser console:**
```javascript
// Test if Web Share API is available
if (navigator.share) {
  console.log('✅ Web Share API supported');
  
  // Test if files can be shared
  if (navigator.canShare && navigator.canShare({ files: [new File([], 'test.pdf')] })) {
    console.log('✅ Can share files');
  } else {
    console.log('❌ Cannot share files');
  }
} else {
  console.log('❌ Web Share API not supported');
}
```

### PDF Not Downloading
**Check:**
- Browser download permissions
- Popup blocker settings
- Console for errors
- Network tab for failed requests

### Mailto Not Opening
**Possible causes:**
- No default email client set (Desktop)
- Email app not installed (Mobile)
- Browser blocking mailto: links

**Solution:**
- Desktop: Configure default email client in OS
- Mobile: Install Gmail, Outlook, or Apple Mail

---

## Success Criteria

✅ **Email sharing:**
- PDF downloads correctly
- Mailto link opens with correct data
- Works on all browsers

✅ **WhatsApp sharing (mobile):**
- Web Share API works on iOS/Android
- PDF is pre-attached
- Message is pre-filled

✅ **WhatsApp sharing (desktop):**
- WhatsApp Web opens
- Message is pre-filled
- PDF downloads separately

✅ **No errors:**
- No console errors
- No TypeScript errors
- Build passes (`npm run build`)

---

## Manual End-to-End Test

1. **Create test invoice:**
   - Go to `/admin/billing/invoices/new`
   - Fill in all fields (client email, phone)
   - Add line items
   - Save invoice

2. **Test email flow:**
   - Open invoice detail page
   - Click More → Share via Email
   - Verify PDF downloads
   - Check mailto link opens correctly
   - Manually attach PDF in email client
   - Send to yourself
   - Verify you receive email with PDF

3. **Test WhatsApp flow (mobile):**
   - Open same invoice on mobile device
   - Click More → Share via WhatsApp
   - Verify native share sheet
   - Select WhatsApp
   - Verify PDF is attached
   - Send to yourself
   - Verify you receive WhatsApp with PDF

4. **Test quote flow:**
   - Repeat steps 1-3 with a quote
   - Verify quote-specific messaging

---

## Rollback Plan

If issues arise in production:

1. **Revert commit:**
   ```bash
   git revert 90c3638
   ```

2. **Or restore old behavior:**
   - Re-add `resend` and `@vercel/blob` dependencies
   - Restore `/api/billing/send-email` route
   - Update invoice/quote actions to use old API calls
   - Add back environment variables

---

**Last Updated:** 2026-04-16  
**Commit:** 90c3638  
**Status:** Ready for testing
