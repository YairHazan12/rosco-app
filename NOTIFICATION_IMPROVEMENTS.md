# Notification Improvements - Specific & Informative Messages

## Problem
Previously, all notifications showed generic messages like "you have a new update in rosco", making it impossible for users to know what happened without opening the app.

## Solution
Implemented specific, informative notification messages for each notification type, including relevant details like job IDs, customer names, statuses, and amounts.

## Changes Made

### 1. Enhanced Notification Functions (`lib/notifications.ts`)

#### Job Assigned Notification
**Before:**
```
"New Job Assigned"
"Plumbing Repair for John Doe on 3/24/2026"
```

**After:**
```
"New Job Assigned"
"Plumbing Repair at 123 Main St • Mar 24, 10:00 AM"
```
- Added location to show job address
- Formatted date/time for readability
- Links directly to the job detail page

#### Job Status Changed Notification
**Before:**
```
"Job Status Updated"
"Plumbing Repair is now Completed"
```

**After:**
```
"Job Status Updated"
"Job #a1b2c3d4 (Plumbing Repair) is now Completed"
```
- Added job ID (first 8 chars) for reference
- Links directly to the job detail page

#### New: Invoice Paid Notification
```
"Invoice Paid"
"Invoice #e5f6g7h8 paid by John Doe (₪1,500)"
```
- Shows invoice ID for reference
- Shows customer name
- Shows payment amount in local currency
- Links directly to the invoice detail page

#### New: Team Member Joined Notification
```
"New Team Member"
"Sarah Cohen joined your team as Handyman"
```
- Shows new member's name
- Shows their role
- Links to team management page

### 2. Updated API Routes

#### `/app/api/jobs/route.ts` (POST - Create Job)
- Updated to pass job ID, location to notification function
- Now sends: `notifyJobAssigned(handymanId, jobId, title, location, clientName, date)`

#### `/app/api/jobs/[id]/route.ts` (PUT - Update Job)
- Updated job assignment notification to include location
- Updated status change notification to include job ID
- Both now link to specific job page

#### `/app/api/webhooks/paystack/route.ts` (POST - Payment Webhook)
- Added invoice paid notification when payment succeeds
- Fetches job to get handyman ID
- Sends notification with invoice details and amount

### 3. Notification Types Defined

All notifications now have proper `notificationType` values:
- `job_assigned` - New job assigned to handyman
- `job_status` - Job status changed
- `invoice_paid` - Invoice payment received
- `team_joined` - New team member added
- `general` - Fallback for other notifications

## Benefits

1. **Users know exactly what happened** without opening the app
2. **Quick reference** with job IDs and invoice IDs
3. **Better UX** with formatted dates, amounts, and locations
4. **Direct navigation** - notifications link to the specific detail page
5. **Consistent format** - all notifications follow similar structure

## Testing Recommendations

1. **Job Assignment:**
   - Create a new job and assign a handyman
   - Verify notification shows: title, location, formatted date/time
   - Tap notification → should open specific job page

2. **Job Status Change:**
   - Change a job's status (e.g., Pending → In Progress)
   - Verify notification shows: Job #[id], title, new status
   - Tap notification → should open specific job page

3. **Invoice Payment:**
   - Complete a payment via Paystack
   - Verify notification shows: Invoice #[id], customer name, amount
   - Tap notification → should open specific invoice page

4. **Team Member (when implemented):**
   - Add a new team member
   - Verify notification shows: member name, role
   - Tap notification → should open team page

## Future Enhancements

- Add notification preferences per type (allow users to mute specific notification types)
- Add notification history/inbox in the app
- Add rich push notifications with actions (e.g., "Accept Job", "View Invoice")
- Add SMS fallback for critical notifications when push fails
- Group related notifications (e.g., multiple status changes for same job)

## Files Modified

- `lib/notifications.ts` - Added/updated notification functions
- `app/api/jobs/route.ts` - Updated job creation notification
- `app/api/jobs/[id]/route.ts` - Updated job update notifications
- `app/api/webhooks/paystack/route.ts` - Added invoice paid notification

## Branch

Feature implemented on branch: `feature/specific-notifications`
Ready to merge to `main` after testing.
