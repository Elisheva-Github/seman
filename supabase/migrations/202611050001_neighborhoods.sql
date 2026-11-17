-- Seman: שכונות (דף שכונה עם כל העסקים שלה, סינון לפי קטגוריה ולוגו שכונה)
-- להריץ ב-Supabase → SQL Editor, אחרי 202611040001_site_content.sql.

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  logo_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.neighborhoods enable row level security;

-- הציבור רואה שכונות מפורסמות בלבד.
drop policy if exists "Public can read published neighborhoods" on public.neighborhoods;
create policy "Public can read published neighborhoods" on public.neighborhoods
  for select to anon, authenticated using (published = true);

-- בעלת סמן רואה ומנהלת הכול (כולל שכונות שלא פורסמו).
drop policy if exists "Seman owner can manage neighborhoods" on public.neighborhoods;
create policy "Seman owner can manage neighborhoods" on public.neighborhoods
  for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'elisheva92121@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'elisheva92121@gmail.com');

grant select on public.neighborhoods to anon, authenticated;
grant insert, update, delete on public.neighborhoods to authenticated;

-- שיוך עסק לשכונה. מחיקת שכונה לא מוחקת עסקים, רק מנתקת את השיוך.
alter table public.businesses
  add column if not exists neighborhood_id uuid references public.neighborhoods(id) on delete set null;
create index if not exists businesses_neighborhood_id_idx on public.businesses (neighborhood_id);
