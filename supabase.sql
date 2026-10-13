-- StockLedger (multi-tenant). Safe to re-run.
create extension if not exists pgcrypto;

create table if not exists public.dc_workspaces (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,            -- stored lowercase; the login
  business_name text not null,
  pin_hash text not null,
  plan text not null default 'trial' check (plan in ('trial','active','suspended')),
  trial_ends_at timestamptz not null default now() + interval '14 days',
  paid_until timestamptz,
  role text not null default 'owner' check (role in ('owner', 'superadmin')),
  created_at timestamptz not null default now()
);

-- Existing installations can be upgraded safely with:
-- alter table public.dc_workspaces add column if not exists role text not null default 'owner' check (role in ('owner', 'superadmin'));

create table if not exists public.delite_cravings_state (
  id text primary key,                      -- = dc_workspaces.id (one row per business)
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS on with no policies: only the server's service-role key can read or write.
alter table public.dc_workspaces enable row level security;
alter table public.delite_cravings_state enable row level security;

create index if not exists delite_cravings_state_updated_at_idx on public.delite_cravings_state(updated_at);

-- Activate a paying customer (until Paystack/Stripe billing is wired in):
-- update public.dc_workspaces set plan='active', paid_until = now() + interval '1 month' where username='customer@example.com';

-- Staff users (billed at 1,500 NGN per user per month, owner included).
create table if not exists public.dc_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.dc_workspaces(id) on delete cascade,
  username text not null unique,            -- lowercase; must also be unique vs dc_workspaces.username (checked by the API)
  pin_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists dc_members_workspace_idx on public.dc_members(workspace_id);
alter table public.dc_members enable row level security;
