# Authentication Fix Testing Checklist

## Prerequisites
- [ ] Firebase project is set up and running
- [ ] Environment variables are configured
- [ ] Run `npm run dev` or deploy to staging

## Test Scenarios

### 1. New User - Email/Password Signup
- [ ] Go to `/login`
- [ ] Click "Sign Up"
- [ ] Create account with email/password
- [ ] Verify redirected to `/onboarding`
- [ ] Complete onboarding as Admin
- [ ] Verify redirected to `/admin`
- [ ] Verify dashboard shows NO data (empty state, not DEMO data)
- [ ] Create a test job
- [ ] Refresh page - verify your job appears (not DEMO jobs)
- [ ] Open browser DevTools → Application → Cookies
- [ ] Verify `rosco-company-id` cookie is set to your company ID (not "DEMO")

### 2. New User - Google Signup
- [ ] Sign out
- [ ] Go to `/login`
- [ ] Click "Continue with Google"
- [ ] Sign in with NEW Google account (not used before)
- [ ] Verify redirected to `/onboarding`
- [ ] Complete onboarding as Admin
- [ ] Verify redirected to `/admin`
- [ ] Verify dashboard shows only your data (not DEMO data)
- [ ] Verify cookie is set correctly

### 3. Returning User - Google Login
- [ ] Sign out
- [ ] Go to `/login`
- [ ] Click "Continue with Google"
- [ ] Sign in with SAME Google account from test #2
- [ ] Verify redirected to `/admin` (NOT onboarding)
- [ ] Verify dashboard shows YOUR data from test #2 (not wiped!)
- [ ] Verify cookie is set correctly

### 4. Demo Mode
- [ ] Sign out
- [ ] Go to `/demo`
- [ ] Click "Admin" demo
- [ ] Verify signed in as demo admin
- [ ] Verify dashboard shows DEMO data (South African names, etc.)
- [ ] Verify cookie is set to "DEMO"
- [ ] Try creating a job - verify it appears in the demo account
- [ ] Sign out

### 5. Guest Mode (Not Signed In)
- [ ] Sign out completely
- [ ] Go to homepage `/`
- [ ] Click "Try the Demo" or "All →" on any section
- [ ] Verify you see DEMO data (preview mode)
- [ ] Verify no cookie is set OR cookie is "DEMO"

### 6. Data Isolation (Security Test)
- [ ] Sign in with your real account (from test #1 or #2)
- [ ] Create a unique job (e.g., "SECRET TEST JOB")
- [ ] Open DevTools → Application → Cookies
- [ ] Copy your `rosco-company-id` value
- [ ] Sign out
- [ ] Sign in with demo account
- [ ] Verify you DO NOT see "SECRET TEST JOB" (data isolation working!)
- [ ] Open DevTools → Console
- [ ] Try to manually fetch another company's data:
  ```javascript
  fetch('/api/jobs?companyId=YOUR_COPIED_COMPANY_ID')
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] Verify you still only see DEMO data (security working!)

### 7. API Routes Security
- [ ] Sign in with your real account
- [ ] Open DevTools → Network tab
- [ ] Navigate to `/admin/jobs`
- [ ] Check the network request to `/api/jobs`
- [ ] Verify NO `companyId` query parameter in URL
- [ ] Create a new job
- [ ] Check the POST request to `/api/jobs`
- [ ] Verify NO `companyId` in request body
- [ ] Verify job is created successfully

### 8. Server Components
- [ ] Sign in with your real account
- [ ] Go to `/admin` (dashboard)
- [ ] Verify all widgets show your data:
  - [ ] Today's Jobs (if any)
  - [ ] Upcoming Jobs (if any)
  - [ ] Recent Jobs (if any)
  - [ ] KPI Strip (your stats)
  - [ ] Team Utilization (if any team members)
  - [ ] Outstanding Invoices (if any)
- [ ] Verify NO DEMO data appears mixed with your data

### 9. Onboarding Persistence
- [ ] Create a NEW account (email or Google)
- [ ] Start onboarding but CLOSE the tab before completing
- [ ] Open a new tab and go to the site
- [ ] Sign in again
- [ ] Verify you're sent back to `/onboarding` (not skipped)
- [ ] Complete onboarding
- [ ] Sign out and sign in again
- [ ] Verify you're sent to `/admin` (onboarding not shown again)

### 10. Cookie Persistence
- [ ] Sign in with your account
- [ ] Verify cookie is set
- [ ] Close browser completely
- [ ] Open browser and go to site
- [ ] Verify still signed in (cookie persisted)
- [ ] Go to `/admin`
- [ ] Verify still see your data (cookie still working)

## Expected Results Summary

| Scenario | Expected Behavior |
|----------|------------------|
| New user signup | Empty state (no DEMO data) |
| New Google user | Redirected to onboarding |
| Returning Google user | Dashboard with their data, no data loss |
| Demo mode | Shows DEMO data only |
| Guest mode | Shows DEMO data (preview) |
| Data isolation | Cannot see other companies' data |
| API security | CompanyId not in URL/body, comes from cookie |
| Server components | Always show correct company's data |

## Common Issues & Solutions

### Issue: "User already exists" error during onboarding
**Fix:** Google auth now detects returning users properly - should not happen

### Issue: Seeing DEMO data after signing in
**Fix:** Check if cookie is set correctly. Sign out and sign in again.

### Issue: Cookie not set
**Fix:** Check browser settings (cookies enabled). Clear cookies and try again.

### Issue: Build fails
**Fix:** Run `npx next build` - should pass. If not, check error logs.

## Automated Tests (Future)
- [ ] E2E tests with Playwright
- [ ] Unit tests for auth helpers
- [ ] Integration tests for API routes

## Rollback Plan
If critical issues found:
1. Revert commits related to auth fixes
2. Deploy previous version
3. Investigate issue in staging
4. Fix and re-test before deploying

## Sign-off
- [ ] All tests passed
- [ ] No data leakage observed
- [ ] Performance is acceptable
- [ ] Ready for production deployment

Tester: _______________  Date: _______________
