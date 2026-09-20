-- ==============================================================================
-- Foreign Employment / Manpower Research - Nepal
-- Supabase PostgreSQL Relational Schema
-- Supports both authenticated researcher accounts and direct anon key access
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- STEP 0: DROP CONSTRAINTS & POLICIES DEPENDING ON user_id FIRST
-- Required by PostgreSQL: cannot drop or alter type of a column while foreign keys or policies depend on it.
-- ==============================================================================
do $$
declare
  pol record;
  c record;
begin
  -- 1. Drop all policies on public tables
  for pol in 
    select schemaname, tablename, policyname 
    from pg_policies 
    where schemaname = 'public' 
      and tablename in (
        'agencies', 
        'visits', 
        'opportunities', 
        'opportunity_costs', 
        'opportunity_documents', 
        'payment_terms', 
        'verification_items', 
        'follow_ups'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;

  -- 2. Drop all foreign key constraints on user_id columns
  for c in
    select tc.table_schema, tc.table_name, tc.constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
      and tc.table_schema = kcu.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and kcu.column_name = 'user_id'
  loop
    execute format('alter table %I.%I drop constraint if exists %I', c.table_schema, c.table_name, c.constraint_name);
  end loop;
end $$;

-- 1. AGENCIES TABLE
create table if not exists public.agencies (
  id uuid default gen_random_uuid() primary key,
  user_id text default 'default_user',
  name text not null,
  location text,
  phone text,
  contact_person text,
  license_number text,
  website text,
  social_link text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drop constraint FIRST before altering column type
alter table if exists public.agencies drop constraint if exists agencies_user_id_fkey;
alter table if exists public.agencies alter column user_id drop not null;
alter table if exists public.agencies alter column user_id type text using user_id::text;

alter table public.agencies enable row level security;

-- Policy: Allow read & write with anon/publishable key and authenticated accounts
drop policy if exists "Allow all access to agencies" on public.agencies;
create policy "Allow all access to agencies"
  on public.agencies for all
  using (true)
  with check (true);

create index if not exists idx_agencies_user_id on public.agencies(user_id);
create index if not exists idx_agencies_name on public.agencies(name);

-- 2. VISITS TABLE
create table if not exists public.visits (
  id uuid default gen_random_uuid() primary key,
  user_id text default 'default_user',
  agency_id uuid references public.agencies(id) on delete cascade not null,
  visit_date date default current_date not null,
  discovery_channel text,
  general_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.visits drop constraint if exists visits_user_id_fkey;
alter table if exists public.visits alter column user_id drop not null;
alter table if exists public.visits alter column user_id type text using user_id::text;

alter table public.visits enable row level security;

drop policy if exists "Allow all access to visits" on public.visits;
create policy "Allow all access to visits"
  on public.visits for all
  using (true)
  with check (true);

create index if not exists idx_visits_user_id on public.visits(user_id);
create index if not exists idx_visits_agency_id on public.visits(agency_id);
create index if not exists idx_visits_date on public.visits(visit_date desc);

-- 3. OPPORTUNITIES TABLE
create table if not exists public.opportunities (
  id uuid default gen_random_uuid() primary key,
  user_id text default 'default_user',
  agency_id uuid references public.agencies(id) on delete cascade not null,
  visit_id uuid references public.visits(id) on delete cascade not null,
  country text not null,
  job_title text not null,
  job_sector text,
  employer_name text,
  employer_city text,
  employer_identified text default 'Not Clear',
  intermediary_type text default 'Not Clear',
  advertised_salary numeric,
  salary_currency text default 'EUR',
  salary_type text default 'Unclear',
  expected_net_salary numeric,
  net_salary_currency text default 'EUR',
  working_hours numeric,
  working_days numeric,
  overtime_status text default 'Unknown',
  overtime_rate text,
  contract_length text,
  probation text,
  accommodation_type text default 'Unclear',
  accommodation_cost numeric,
  food_arrangement text default 'Unclear',
  transportation text default 'Not Clear',
  work_permit_status text default 'Unknown',
  estimated_total_processing_time text,
  timeline_basis text default 'Unknown',
  evidence_status text default 'Needs Verification',
  pressure_flags text[] default '{}',
  general_notes text,
  is_demo boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.opportunities drop constraint if exists opportunities_user_id_fkey;
alter table if exists public.opportunities alter column user_id drop not null;
alter table if exists public.opportunities alter column user_id type text using user_id::text;

alter table public.opportunities enable row level security;

drop policy if exists "Allow all access to opportunities" on public.opportunities;
create policy "Allow all access to opportunities"
  on public.opportunities for all
  using (true)
  with check (true);

create index if not exists idx_opportunities_user_id on public.opportunities(user_id);
create index if not exists idx_opportunities_agency_id on public.opportunities(agency_id);
create index if not exists idx_opportunities_visit_id on public.opportunities(visit_id);
create index if not exists idx_opportunities_country on public.opportunities(country);
create index if not exists idx_opportunities_job_sector on public.opportunities(job_sector);
create index if not exists idx_opportunities_evidence_status on public.opportunities(evidence_status);

-- 4. OPPORTUNITY_COSTS TABLE
create table if not exists public.opportunity_costs (
  id uuid default gen_random_uuid() primary key,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null unique,
  agency_service_charge numeric default 0,
  government_processing_fee numeric default 0,
  medical_exam numeric default 0,
  insurance numeric default 0,
  visa_fee numeric default 0,
  documentation numeric default 0,
  translation numeric default 0,
  training numeric default 0,
  air_ticket numeric default 0,
  miscellaneous numeric default 0,
  total_quoted_cost numeric default 0,
  written_cost boolean default false,
  cost_breakdown_status text default 'Partial',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.opportunity_costs enable row level security;

drop policy if exists "Allow all access to opportunity_costs" on public.opportunity_costs;
create policy "Allow all access to opportunity_costs"
  on public.opportunity_costs for all
  using (true)
  with check (true);

create index if not exists idx_opportunity_costs_opp_id on public.opportunity_costs(opportunity_id);

-- 5. OPPORTUNITY_DOCUMENTS TABLE
create table if not exists public.opportunity_documents (
  id uuid default gen_random_uuid() primary key,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  document_type text not null,
  shown boolean default false,
  photo_allowed text default 'Not Asked',
  file_url text,
  notes text,
  created_at timestamptz default now()
);

alter table public.opportunity_documents enable row level security;

drop policy if exists "Allow all access to opportunity_documents" on public.opportunity_documents;
create policy "Allow all access to opportunity_documents"
  on public.opportunity_documents for all
  using (true)
  with check (true);

create index if not exists idx_opportunity_docs_opp_id on public.opportunity_documents(opportunity_id);

-- 6. PAYMENT_TERMS TABLE
create table if not exists public.payment_terms (
  id uuid default gen_random_uuid() primary key,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  payment_stage text not null,
  payment_method text default 'Unknown',
  receipt_status text default 'Not Asked',
  refund_policy text default 'Unknown',
  refund_notes text,
  created_at timestamptz default now()
);

alter table public.payment_terms enable row level security;

drop policy if exists "Allow all access to payment_terms" on public.payment_terms;
create policy "Allow all access to payment_terms"
  on public.payment_terms for all
  using (true)
  with check (true);

create index if not exists idx_payment_terms_opp_id on public.payment_terms(opportunity_id);

-- 7. VERIFICATION_ITEMS TABLE
create table if not exists public.verification_items (
  id uuid default gen_random_uuid() primary key,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  item text not null,
  status text default 'Needs Verification',
  notes text,
  source text,
  verified_date date,
  created_at timestamptz default now()
);

alter table public.verification_items enable row level security;

drop policy if exists "Allow all access to verification_items" on public.verification_items;
create policy "Allow all access to verification_items"
  on public.verification_items for all
  using (true)
  with check (true);

create index if not exists idx_verification_items_opp_id on public.verification_items(opportunity_id);
create index if not exists idx_verification_items_status on public.verification_items(status);

-- 8. FOLLOW_UPS TABLE
create table if not exists public.follow_ups (
  id uuid default gen_random_uuid() primary key,
  user_id text default 'default_user',
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  follow_up_date date not null,
  action text not null,
  status text default 'Pending',
  notes text,
  created_at timestamptz default now()
);

alter table if exists public.follow_ups drop constraint if exists follow_ups_user_id_fkey;
alter table if exists public.follow_ups alter column user_id drop not null;
alter table if exists public.follow_ups alter column user_id type text using user_id::text;

alter table public.follow_ups enable row level security;

drop policy if exists "Allow all access to follow_ups" on public.follow_ups;
create policy "Allow all access to follow_ups"
  on public.follow_ups for all
  using (true)
  with check (true);

create index if not exists idx_follow_ups_user_id on public.follow_ups(user_id);
create index if not exists idx_follow_ups_opp_id on public.follow_ups(opportunity_id);
create index if not exists idx_follow_ups_status on public.follow_ups(status);
create index if not exists idx_follow_ups_date on public.follow_ups(follow_up_date);

-- Auto-update timestamp triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_agencies_modtime on public.agencies;
create trigger update_agencies_modtime before update on public.agencies for each row execute function public.set_updated_at();

drop trigger if exists update_visits_modtime on public.visits;
create trigger update_visits_modtime before update on public.visits for each row execute function public.set_updated_at();

drop trigger if exists update_opportunities_modtime on public.opportunities;
create trigger update_opportunities_modtime before update on public.opportunities for each row execute function public.set_updated_at();

drop trigger if exists update_opportunity_costs_modtime on public.opportunity_costs;
create trigger update_opportunity_costs_modtime before update on public.opportunity_costs for each row execute function public.set_updated_at();
