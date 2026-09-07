-- Run once in the Supabase SQL Editor. The table remains private: only the
-- Vercel API route, using the service-role key, can read or write it.
create table if not exists public.shared_quotes (
  id uuid primary key default gen_random_uuid(),
  share_token text not null unique,
  quote jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.shared_quotes enable row level security;

-- Do not add anonymous policies. Public visitors receive a quote only through
-- the Vercel API after presenting its unguessable share token.
