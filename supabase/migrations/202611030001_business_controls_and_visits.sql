-- Seman: per-business activation, display preferences and visit reporting
alter table public.businesses
  add column if not exists send_visit_report_email boolean not null default false,
  add column if not exists show_recommendations boolean not null default true;

create table if not exists public.business_visits (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  visited_at timestamptz not null default now()
);
create index if not exists business_visits_visited_at_idx on public.business_visits(visited_at);
create index if not exists business_visits_business_date_idx on public.business_visits(business_id, visited_at);

alter table public.business_visits enable row level security;
revoke all on public.business_visits from anon, authenticated;
-- Inserts are performed only by the track-visit Edge Function using the service role.
-- Reads are performed only by the send-daily-reports Edge Function using the service role.

alter table public.seman_recommendations
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;
create index if not exists seman_recommendations_business_idx on public.seman_recommendations(business_id, published);
