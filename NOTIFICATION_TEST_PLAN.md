# Notification Messages Test Plan

## Overview
This test plan covers verification of the new specific and informative notification messages implemented in the ROSCO app.

## Prerequisites
1. Build and deploy the app with the `feature/specific-notification-messages` branch
2. Have at least 2 test accounts ready:
   - Admin account (to create/assign jobs, manage invoices)
   - Handyman account (to receive notifications)
3. Ensure FCM (Firebase Cloud Messaging) is properly configured
4. Test device should have notifications enabled for the ROSCO app

---

## Test Cases

### 1. Job Assignment Notification

#### Test 1.1: New Job Assignment
**Steps:**
1. Log in as Admin
2. Create a new job with the following details:
   - Title: "Plumbing Repair"
   - Location: "123 Main Street, Tel Aviv"
   - Date: Tomorrow at 10:00 AM
   - Assign to: Test Handyman
3. Save the job

**Expected Result:**
- Handyman receives notification:
  - **Title:** "New Job Assigned"
  - **Body:** "Plumbing Repair at 123 Main Street, Tel Aviv • Mar 25, 10:00 AM"
- Tapping notification opens the specific job detail page
- Notification shows job location and formatted date/time

**Pass Criteria:** ✅ Notification shows location and formatted date, links to job detail page

---

#### Test 1.2: Job Reassignment
**Steps:**
1. Log in as Admin
2. Edit an existing job
3. Change the assigned handyman to a different handyman
4. Save changes

**Expected Result:**
- New handyman receives assignment notification with location and date
- Old handyman does NOT receive a notification (job removed from their list)

**Pass Criteria:** ✅ New handyman gets notification, old handyman doesn't

---

### 2. Job Status Change Notification

#### Test 2.1: Status Change (Pending → In Progress)
**Steps:**
1. Log in as Admin (or Handyman)
2. Open an assigned job
3. Change status from "Pending" to "In Progress"
4. Save changes

**Expected Result:**
- Handyman receives notification:
  - **Title:** "Job Status Updated"
  - **Body:** "Job #a1b2c3d4 (Plumbing Repair) is now In Progress"
- Notification includes first 8 characters of job ID
- Tapping notification opens the specific job detail page

**Pass Criteria:** ✅ Notification shows job ID and new status, links to job detail page

---

#### Test 2.2: Multiple Status Changes
**Steps:**
1. Change job status from "In Progress" to "Completed"
2. Wait for notification
3. Change same job status from "Completed" to "Pending" (reopen)

**Expected Result:**
- Handyman receives 2 separate notifications, each with the correct new status
- Job ID remains consistent in both notifications

**Pass Criteria:** ✅ Each status change triggers a notification with correct status

---

### 3. Invoice Paid Notification

#### Test 3.1: Invoice Payment via Paystack
**Steps:**
1. Log in as Admin
2. Create an invoice for a completed job assigned to Test Handyman
3. Send invoice to customer (get payment link)
4. Complete payment using Paystack test card
5. Wait for webhook to process

**Expected Result:**
- Handyman receives notification:
  - **Title:** "Invoice Paid"
  - **Body:** "Invoice #e5f6g7h8 paid by John Doe (₪1,500)"
- Shows invoice ID (first 8 chars)
- Shows customer name from invoice
- Shows payment amount in local currency (₪)
- Tapping notification opens the specific invoice detail page

**Pass Criteria:** ✅ Notification shows invoice ID, customer name, amount, and links to invoice page

---

#### Test 3.2: Invoice Without Assigned Handyman
**Steps:**
1. Create an invoice for a job without an assigned handyman
2. Complete payment via Paystack
3. Check notification behavior

**Expected Result:**
- No notification sent (since there's no handyman to notify)
- Payment still processes successfully
- No errors in server logs

**Pass Criteria:** ✅ No notification sent, no errors logged

---

### 4. Notification Deep Linking

#### Test 4.1: Job Notification Deep Link
**Steps:**
1. Receive a job assignment or status change notification
2. Tap the notification

**Expected Result:**
- App opens directly to the specific job detail page (e.g., `/handyman/jobs/abc123`)
- Job details are immediately visible
- No need to navigate from home screen

**Pass Criteria:** ✅ Notification opens specific job page directly

---

#### Test 4.2: Invoice Notification Deep Link
**Steps:**
1. Receive an invoice paid notification
2. Tap the notification

**Expected Result:**
- App opens directly to the specific invoice detail page (e.g., `/handyman/invoices/xyz789`)
- Invoice details and payment status are immediately visible

**Pass Criteria:** ✅ Notification opens specific invoice page directly

---

### 5. Notification Formatting

#### Test 5.1: Date/Time Formatting
**Steps:**
1. Create jobs with various date/times:
   - Today at 2:30 PM
   - Tomorrow at 9:00 AM
   - Next week at 4:45 PM
2. Assign each job to handyman

**Expected Result:**
- Each notification shows readable date/time format:
  - "Mar 24, 02:30 PM"
  - "Mar 25, 09:00 AM"
  - "Mar 31, 04:45 PM"

**Pass Criteria:** ✅ All dates formatted consistently and readably

---

#### Test 5.2: Long Text Handling
**Steps:**
1. Create a job with:
   - Very long title (50+ characters)
   - Very long location address (100+ characters)
2. Assign to handyman

**Expected Result:**
- Notification body is truncated gracefully if too long
- Key information (location start, date) still visible
- No text overflow or formatting issues

**Pass Criteria:** ✅ Long text handled gracefully without breaking notification

---

#### Test 5.3: Currency Formatting
**Steps:**
1. Create invoices with different amounts:
   - ₪100
   - ₪1,500
   - ₪10,500.50
2. Mark each as paid

**Expected Result:**
- Each notification shows amount with proper currency symbol and formatting:
  - "₪100"
  - "₪1,500"
  - "₪10,500.50"

**Pass Criteria:** ✅ Currency formatted with commas and decimals where appropriate

---

### 6. Edge Cases

#### Test 6.1: Missing Job Details
**Steps:**
1. Create a job with minimal required fields only (no location, no description)
2. Assign to handyman

**Expected Result:**
- Notification still sent successfully
- Missing fields handled gracefully (e.g., "Location not specified" or empty string)
- No app crashes or errors

**Pass Criteria:** ✅ Notification sent successfully even with minimal data

---

#### Test 6.2: Offline Notification Delivery
**Steps:**
1. Turn off handyman device WiFi/data
2. Assign a job to that handyman
3. Wait 1-2 minutes
4. Turn device connectivity back on

**Expected Result:**
- Notification is delivered once device comes back online
- Notification content is correct and matches what was sent

**Pass Criteria:** ✅ Notification delivered after device reconnects

---

#### Test 6.3: Multiple Rapid Notifications
**Steps:**
1. Assign 5 jobs to handyman within 30 seconds
2. Immediately change status of 3 existing jobs

**Expected Result:**
- All 8 notifications are delivered
- Each notification is distinct and correct
- No duplicate or merged notifications
- Notifications appear in correct chronological order

**Pass Criteria:** ✅ All notifications delivered correctly without conflicts

---

### 7. Regression Testing

#### Test 7.1: Existing Notification Preferences
**Steps:**
1. Handyman has push notifications enabled in settings
2. Complete tests 1-3 above
3. Handyman disables push notifications
4. Assign new job

**Expected Result:**
- When enabled: notifications received
- When disabled: no notifications sent
- Notification preferences still work as expected

**Pass Criteria:** ✅ Notification preferences respected

---

#### Test 7.2: In-App Notifications
**Steps:**
1. While logged in as handyman, have admin assign a job
2. Check if in-app notification appears (if implemented)
3. Check notification center/bell icon

**Expected Result:**
- In-app notification uses same specific message format
- Notification appears in app's notification list
- Read/unread status tracked correctly

**Pass Criteria:** ✅ In-app notifications also use new format

---

## Test Environment Setup

### Test Accounts Needed
```
Admin Account:
- Email: admin-test@rosco.app
- Role: Admin
- Company: Test Company

Handyman Account 1:
- Email: handyman1-test@rosco.app
- Role: Handyman
- Company: Test Company
- FCM Token: Registered

Handyman Account 2:
- Email: handyman2-test@rosco.app
- Role: Handyman
- Company: Test Company
- FCM Token: Registered
```

### Test Data Setup
Create test jobs and customers ahead of time:
- 3 test customers (John Doe, Sarah Cohen, Michael Smith)
- 5 test jobs in various statuses
- 2 test invoices (1 paid, 1 unpaid)

---

## Success Criteria

### Must Pass (Critical)
- ✅ Job assignment shows location and date
- ✅ Status change shows job ID and status
- ✅ Invoice paid shows customer and amount
- ✅ All notifications link to correct detail pages
- ✅ No crashes or errors during notification sending

### Should Pass (Important)
- ✅ Date/time formatted readably
- ✅ Currency formatted correctly
- ✅ Long text handled gracefully
- ✅ Notifications work when device offline then reconnects

### Nice to Have
- ✅ Multiple rapid notifications don't conflict
- ✅ Notification preferences still respected
- ✅ In-app notifications also improved

---

## Sign-Off

| Role | Name | Date | Pass/Fail |
|------|------|------|-----------|
| Developer | | | |
| QA Tester | | | |
| Product Owner | | | |

---

## Notes Section
Use this space to document any issues found during testing:

```
Issue 1: [Description]
Severity: Critical/High/Medium/Low
Steps to reproduce:
Expected:
Actual:

Issue 2: [Description]
...
```
