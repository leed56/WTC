-- WTC Gem Lab — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- 1. Gemstone Certificates Table
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  report_number text unique not null,
  issue_date text not null,
  stone_type text not null check (stone_type in ('Natural', 'Heated', 'Synthetic', 'Treated')),
  species text not null,
  variety text not null,
  security_hash text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_certificates_report_number
  on public.certificates (report_number);

-- 2. Client Stone Submission Vouchers (/submission)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  voucher_code text unique not null,
  client_name text not null,
  company_name text,
  phone text not null,
  email text not null,
  stone_count integer not null default 1,
  service_tier text not null,
  shipping_method text not null,
  notes text,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- 3. Public Contact Inquiries (/contact)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.certificates enable row level security;
alter table public.submissions enable row level security;
alter table public.contact_messages enable row level security;

-- Public read-only access for online report verification (/verify)
drop policy if exists "Public can read certificates" on public.certificates;
create policy "Public can read certificates"
  on public.certificates
  for select
  to anon, authenticated
  using (true);
