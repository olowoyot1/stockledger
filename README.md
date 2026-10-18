# StockLedger — multi-tenant SaaS

Sales, stock, credit-sales and debtor tracking. Each business signs up, gets an isolated workspace and a 14-day free trial. Works offline (installable PWA) and syncs to the cloud when online.

**Languages:** English, Igbo, Yorùbá, Hausa and Naijá (Nigerian Pidgin). Pick one on the sign-in screen, in the top bar, or under Settings. The choice is remembered, survives logout, and defaults to the browser language when it is one of these.

## How it works
- **Workspaces:** `dc_workspaces` holds one row per business (login, salted-scrypt password hash, plan, trial/paid dates). Its data lives in `delite_cravings_state`, keyed by workspace id. (Table and browser-storage names keep their original `dc_` / `delite_` prefixes so existing installs upgrade in place.)
- **Auth:** sign-up / sign-in return a signed session token (30 days). The browser stores only the token, never the password; it is sent as `Authorization: Bearer …`. Changing a password invalidates all older tokens. Five failed sign-ins lock a login for 15 minutes (per-IP limits too; best effort on serverless).
- **Plans:** `trial` → writes allowed for 14 days; `active` → allowed until `paid_until`; expired/`suspended` → read-only (the app shows a banner and disables editing; the API answers 402). Data stays viewable and exportable.
- **Roles:** `owner` (manages staff, can reset data), `staff` (record sales, change own password), `superadmin` (Companies tab, never expires).
- **Sync:** merges are per-record and server-side. Deleted days/products are tombstoned so they cannot be resurrected by a stale device; concurrent saves are detected with optimistic locking and re-merged; "Reset App Data" is a real cloud-wide reset that other devices pick up.
- **Shared devices:** logging out, or signing in as a different business, clears local data.

## Pricing
**₦1,500 per user per month**, owner included (`PRICE_PER_USER` in `api/cloud.js`). Staff can sign in, record sales and change their own password but cannot manage users.

## Setup
1. Create a Supabase project and run all of `supabase.sql` in the SQL Editor (safe to re-run; upgrades older installs).
2. In Vercel add environment variables (see `.env.example`): `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) and, recommended, `SESSION_SECRET` (32+ random characters). Redeploy.
3. Open the site and use **Start free trial**.
4. Optional — make yourself superadmin: `update public.dc_workspaces set role='superadmin' where username='you@example.com';`

Rotating `SESSION_SECRET` signs everyone out. Pushing a new version of the app updates installed copies automatically (the service worker is network-first).

## Activating a paying customer (manual, until billing is automated)
```sql
update public.dc_workspaces set plan='active', paid_until = now() + interval '1 month' where username='customer@example.com';
```

## Development
```bash
npm test        # Node 22+, no dependencies
```
- `tests/cloud.test.js` — API logic plus full request flows against an in-memory Supabase fake.
- `tests/i18n.test.js` — every language has every key with matching placeholders; no missing/unused keys; HTML structure; security invariants (no inline scripts, strict CSP, no stored passwords).

### Adding or editing a translation
All text lives in `i18n.js`. Static markup uses `data-i18n="key"`; scripts use `t('key', {vars})`. Add the key to English first, then to every other language; the tests fail until all five match. Product names, categories and customer names are user data and are never translated. CSV exports keep English headers so they open identically everywhere.

> **Translation review:** the Igbo, Yorùbá, Hausa and Pidgin text was written carefully but should be proof-read by native speakers (especially tone marks) before a public launch.

## Security notes
- Strict Content-Security-Policy (no inline scripts/styles); the Excel reader is self-hosted in `vendor/` and loaded only when an `.xlsx` is imported.
- **SheetJS 0.18.5** (the last version published to npm) has known advisories for maliciously crafted files. Uploads are limited to 5 MB / 5,000 rows and parsed only in the importing user's own browser; for stricter handling, import CSV, or replace `vendor/xlsx.full.min.js` with a current build from cdn.sheetjs.com.
- Server input is whitelisted and size-limited, because a staff login can push data that the owner's browser later renders.
- Credit records are append-only (like a paper ledger): correct a mistake with a new entry.

## Not built yet
Automated payments (Paystack/Stripe + webhook to set `paid_until`), password reset by email, and a landing page.
