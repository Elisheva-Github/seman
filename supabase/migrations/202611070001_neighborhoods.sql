-- Directory pages for local neighborhoods. A business can belong to multiple neighborhoods.
create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  category text not null default '',
  business_ids uuid[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.neighborhoods enable row level security;

-- Public visitors can only read published neighborhood pages.
drop policy if exists "Public can view published neighborhoods" on public.neighborhoods;
create policy "Public can view published neighborhoods" on public.neighborhoods
  for select using (published = true);

-- Authenticated admin operations are restricted by Supabase project policies / owner session.
drop policy if exists "Authenticated users manage neighborhoods" on public.neighborhoods;
create policy "Authenticated users manage neighborhoods" on public.neighborhoods
  for all to authenticated using ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com') with check ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');

create index if not exists neighborhoods_slug_idx on public.neighborhoods(slug);
