-- Seman: business pages and public image storage
create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default '',
  description text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  address text not null default '',
  hours text not null default '',
  image_url text not null default '',
  logo_url text not null default '',
  favicon_url text not null default '',
  gallery_urls text[] not null default '{}',
  whatsapp text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses add column if not exists logo_url text not null default '';
alter table public.businesses add column if not exists favicon_url text not null default '';
alter table public.businesses add column if not exists gallery_urls text[] not null default '{}';

create index if not exists businesses_published_idx on public.businesses (published);
create index if not exists businesses_slug_idx on public.businesses (slug);

alter table public.businesses enable row level security;

drop policy if exists "Public can read published businesses" on public.businesses;
create policy "Public can read published businesses"
  on public.businesses for select to anon, authenticated
  using (published = true);

drop policy if exists "Seman owner can manage businesses" on public.businesses;
create policy "Seman owner can manage businesses"
  on public.businesses for all to authenticated
  using ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');

-- Public read for published business images; only the Seman owner can upload/change/delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-images', 'business-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/gif'];

drop policy if exists "Public can view business images" on storage.objects;
create policy "Public can view business images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'business-images');

drop policy if exists "Seman owner can upload business images" on storage.objects;
create policy "Seman owner can upload business images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'business-images' and (auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');

drop policy if exists "Seman owner can update business images" on storage.objects;
create policy "Seman owner can update business images"
  on storage.objects for update to authenticated
  using (bucket_id = 'business-images' and (auth.jwt() ->> 'email') = 'elisheva92121@gmail.com')
  with check (bucket_id = 'business-images' and (auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');

drop policy if exists "Seman owner can delete business images" on storage.objects;
create policy "Seman owner can delete business images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'business-images' and (auth.jwt() ->> 'email') = 'elisheva92121@gmail.com');
