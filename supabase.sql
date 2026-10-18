-- StockLedger (multi-tenant). Safe to re-run.
-- Table names keep their original "dc_" / "delite_cravings_" prefixes so existing installs upgrade in place.
create extension if not exists pgcrypto;

create table if not exists public.dc_workspaces (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,            -- stored lowercase; the owner's login
  business_name text not null,
  pin_hash text not null,                   -- salted scrypt hash of the password (column name is historical)
  plan text not null default 'trial' check (plan in ('trial','active','suspended')),
  trial_ends_at timestamptz not null default now() + interval '14 days',
  paid_until timestamptz,
  role text not null default 'owner' check (role in ('owner', 'superadmin')),
  created_at timestamptz not null default now(),
  constraint dc_workspaces_username_len check (char_length(username) between 3 and 100)
);

-- Upgrading an older installation:
-- alter table public.dc_workspaces add column if not exists role text not null default 'owner' check (role in ('owner', 'superadmin'));

create table if not exists public.delite_cravings_state (
  id text primary key,                      -- = dc_workspaces.id (one row per business)
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.dc_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.dc_workspaces(id) on delete cascade,
  username text not null unique,            -- lowercase; also checked against dc_workspaces.username by the API
  pin_hash text not null,
  created_at timestamptz not null default now(),
  constraint dc_members_username_len check (char_length(username) between 3 and 100)
);
create index if not exists dc_members_workspace_idx on public.dc_members(workspace_id);
create index if not exists delite_cravings_state_updated_at_idx on public.delite_cravings_state(updated_at);

-- Row Level Security on with NO policies: only the server's service-role key can read or write.
alter table public.dc_workspaces enable row level security;
alter table public.delite_cravings_state enable row level security;
alter table public.dc_members enable row level security;

-- Defence in depth: the public API roles get no table privileges at all.
revoke all on public.dc_workspaces, public.delite_cravings_state, public.dc_members from anon, authenticated;

-- Remove a business's cloud data automatically when the workspace is deleted.
create or replace function public.dc_delete_workspace_state() returns trigger language plpgsql as $$
begin delete from public.delite_cravings_state where id = old.id::text; return old; end $$;
drop trigger if exists dc_workspace_cleanup on public.dc_workspaces;
create trigger dc_workspace_cleanup after delete on public.dc_workspaces for each row execute function public.dc_delete_workspace_state();

-- Activate a paying customer (until Paystack/Stripe billing is wired in):
-- update public.dc_workspaces set plan='active', paid_until = now() + interval '1 month' where username='customer@example.com';

-- Make an account a superadmin (unlocks the Companies tab; never expires):
-- update public.dc_workspaces set role='superadmin' where username='you@example.com';
