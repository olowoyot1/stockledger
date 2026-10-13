# StockLedger — multi-tenant SaaS

Sales, stock, credit-sales and debtor tracking. Each business signs up, gets its own isolated workspace and a 14-day free trial.

## How it works
- **Workspaces:** `dc_workspaces` holds one row per business (login, scrypt-hashed password, plan, trial/paid dates). Its data lives in `delite_cravings_state`, keyed by the workspace id, so businesses never share records.
- **Auth:** sign up / sign in via `/api/cloud`. Passwords are 8+ characters, hashed with salted scrypt; 5 failed logins lock a login for 15 minutes (best effort on serverless).
- **Plans:** `trial` → writes allowed for 14 days; `active` → allowed until `paid_until`; expired or `suspended` → read-only (402 on save). Data stays viewable and exportable.
- **Shared devices:** switching to a different business or logging out clears local data from the browser.

## Pricing
**₦1,500 per user per month**, owner included (set by `PRICE_PER_USER` in `api/cloud.js`). The 14-day trial is free. The owner adds or removes staff logins under Settings → Team & billing; the monthly total is computed from the live user count. Staff can sign in, record sales and change their own password but cannot manage users.

## Setup
1. Create a Supabase project and run all of `supabase.sql` in the SQL Editor.
2. In Vercel add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-side only), then redeploy.
3. Open the site and use **Start free trial**.

## Activating a paying customer (manual, until billing is automated)
```sql
update public.dc_workspaces set plan='active', paid_until = now() + interval '1 month' where username='customer@example.com';
```

## Moving the existing Delite Cravings data
Open the old app on the device holding the records, then create the new account **in the same browser** (don't log out first). The first sync seeds the new workspace from that browser's data.

## Not built yet
Automated payments (Paystack/Stripe + webhook to set `paid_until` from the monthly total), password reset by email, and a landing page.
