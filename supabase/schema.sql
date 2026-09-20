-- ==============================================================================
-- Foreign Employment / Manpower Research - Nepal
-- Supabase PostgreSQL Relational Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Profile trigger on auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. AGENCIES TABLE
create table if not exists public.agencies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
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

alter table public.agencies enable row level security;

create policy "Users can CRUD own agencies"
  on public.agencies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_agencies_user_id on public.agencies(user_id);
create index if not exists idx_agencies_name on public.agencies(name);

-- 3. VISITS TABLE
create table if not exists public.visits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  visit_date date default current_date not null,
  discovery_channel text,
  general_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.visits enable row level security;

create policy "Users can CRUD own visits"
  on public.visits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_visits_user_id on public.visits(user_id);
create index if not exists idx_visits_agency_id on public.visits(agency_id);
create index if not exists idx_visits_date on public.visits(visit_date desc);

-- 4. OPPORTUNITIES TABLE
create table if not exists public.opportunities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
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

alter table public.opportunities enable row level security;

create policy "Users can CRUD own opportunities"
  on public.opportunities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_opportunities_user_id on public.opportunities(user_id);
create index if not exists idx_opportunities_agency_id on public.opportunities(agency_id);
create index if not exists idx_opportunities_visit_id on public.opportunities(visit_id);
create index if not exists idx_opportunities_country on public.opportunities(country);
create index if not exists idx_opportunities_job_sector on public.opportunities(job_sector);
create index if not exists idx_opportunities_evidence_status on public.opportunities(evidence_status);

-- 5. OPPORTUNITY_COSTS TABLE
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

create policy "Users can CRUD own opportunity costs"
  on public.opportunity_costs for all
  using (
    exists (
      select 1 from public.opportunities opp
      where opp.id = opportunity_costs.opportunity_id
      and opp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.opportunities opp
      where opp.id = opportunity_costs.opportunity_id
      and opp.user_id = auth.uid()
    )
  );

create index if not exists idx_opportunity_costs_opp_id on public.opportunity_costs(opportunity_id);

-- 6. OPPORTUNITY_DOCUMENTS TABLE
create table if not exists public.opportunity_documents (
  id uuid default gen_random_uuid() primary key,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  document_type text not null,
  shown boolean default true,
  photo_allowed text default 'Not Asked',
  file_url text,
  notes text,
  created_at timestamptz default now()
);

alter table public.opportunity_documents enable row level security;

create policy "Users can CRUD own opportunity documents"
  on public.opportunity_documents for all
  using (
    exists (
      select 1 from public.opportunities opp
      where opp.id = opportunity_documents.opportunity_id
      and opp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.opportunities opp
      where opp.id = opportunity_documents.opportunity_id
      and opp.user_id = auth.uid()
    )
  );

create index if not exists idx_opportunity_docs_opp_id on public.opportunity_documents(opportunity_id);

-- 7. PAYMENT_TERMS TABLE
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

create policy "Users can CRUD own payment terms"
  on public.payment_terms for all
  using (
    exists (
      select 1 from public.opportunities opp
      where opp.id = payment_terms.opportunity_id
      and opp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.opportunities opp
      where opp.id = payment_terms.opportunity_id
      and opp.user_id = auth.uid()
    )
  );

create index if not exists idx_payment_terms_opp_id on public.payment_terms(opportunity_id);

-- 8. VERIFICATION_ITEMS TABLE
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

create policy "Users can CRUD own verification items"
  on public.verification_items for all
  using (
    exists (
      select 1 from public.opportunities opp
      where opp.id = verification_items.opportunity_id
      and opp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.opportunities opp
      where opp.id = verification_items.opportunity_id
      and opp.user_id = auth.uid()
    )
  );

create index if not exists idx_verification_items_opp_id on public.verification_items(opportunity_id);
create index if not exists idx_verification_items_status on public.verification_items(status);

-- 9. FOLLOW_UPS TABLE
create table if not exists public.follow_ups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  follow_up_date date not null,
  action text not null,
  status text default 'Pending',
  notes text,
  created_at timestamptz default now()
);

alter table public.follow_ups enable row level security;

create policy "Users can CRUD own follow ups"
  on public.follow_ups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_follow_ups_user_id on public.follow_ups(user_id);
create index if not exists idx_follow_ups_opp_id on public.follow_ups(opportunity_id);
create index if not exists idx_follow_ups_status on public.follow_ups(status);
create index if not exists idx_follow_ups_date on public.follow_ups(follow_up_date);

-- Auto-update timestamp function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_agencies_modtime before update on public.agencies for each row execute function public.set_updated_at();
create trigger update_visits_modtime before update on public.visits for each row execute function public.set_updated_at();
create trigger update_opportunities_modtime before update on public.opportunities for each row execute function public.set_updated_at();
create trigger update_opportunity_costs_modtime before update on public.opportunity_costs for each row execute function public.set_updated_at();
