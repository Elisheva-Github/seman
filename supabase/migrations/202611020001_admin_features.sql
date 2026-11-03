-- Seman admin-managed content and visibility settings
-- Run this migration in Supabase SQL Editor.

alter table public.businesses
  add column if not exists show_in_examples boolean not null default true;

-- Public visitors may read only published businesses; RLS still filters rows.
grant select on public.businesses to anon, authenticated;
grant insert, update, delete on public.businesses to authenticated;

create table if not exists public.seman_settings (
  id boolean primary key default true check (id = true),
  send_visit_report_email boolean not null default false,
  show_recommendations_section boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.seman_settings (id) values (true) on conflict (id) do nothing;
alter table public.seman_settings enable row level security;
drop policy if exists "Public can read Seman display settings" on public.seman_settings;
create policy "Public can read Seman display settings" on public.seman_settings
  for select to anon, authenticated using (true);
drop policy if exists "Seman owner can manage settings" on public.seman_settings;
create policy "Seman owner can manage settings" on public.seman_settings
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');
grant select on public.seman_settings to anon, authenticated;
grant insert, update, delete on public.seman_settings to authenticated;

create table if not exists public.seman_recommendations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  content text not null,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.seman_recommendations enable row level security;
drop policy if exists "Public can read published recommendations" on public.seman_recommendations;
create policy "Public can read published recommendations" on public.seman_recommendations
  for select to anon, authenticated using (published = true);
drop policy if exists "Seman owner can manage recommendations" on public.seman_recommendations;
create policy "Seman owner can manage recommendations" on public.seman_recommendations
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');
grant select on public.seman_recommendations to anon, authenticated;
grant insert, update, delete on public.seman_recommendations to authenticated;

create table if not exists public.seman_audience_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon text not null default '📍',
  display_order integer not null default 0,
  published boolean not null default true
);
alter table public.seman_audience_categories enable row level security;
drop policy if exists "Public can read audience categories" on public.seman_audience_categories;
create policy "Public can read audience categories" on public.seman_audience_categories
  for select to anon, authenticated using (published = true);
drop policy if exists "Seman owner can manage audience categories" on public.seman_audience_categories;
create policy "Seman owner can manage audience categories" on public.seman_audience_categories
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');
grant select on public.seman_audience_categories to anon, authenticated;
grant insert, update, delete on public.seman_audience_categories to authenticated;
