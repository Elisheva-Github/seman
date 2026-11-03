-- Seman: עריכת תוכן אתר סמן (CMS)
-- להריץ ב-Supabase → SQL Editor, אחרי המיגרציות הקודמות.
--
-- מה נשמר כאן: רק שינויים שהמנהלת ערכה. הטקסטים המקוריים נשארים בקוד האתר,
-- ולכן פריסת גרסה חדשה של האתר לא מוחקת עריכות, ו"שחזור מקור" = ניקוי השינויים.

create table if not exists public.seman_site_content (
  section_key text primary key
    check (section_key in ('header','hero','audience','why','how','examples','contact','recommendations','footer')),
  -- רק השדות ששונו ביחס לטקסט המקורי
  content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(content) = 'object' and octet_length(content::text) < 60000),
  -- הגרסה שהייתה לפני השמירה האחרונה (לכפתור "חזרה לגרסה הקודמת")
  previous_content jsonb
    check (previous_content is null or (jsonb_typeof(previous_content) = 'object' and octet_length(previous_content::text) < 60000)),
  -- הסתרת אזור בלי למחוק את התוכן שלו
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.seman_site_content enable row level security;

-- הציבור קורא את התוכן כדי להציג את האתר.
drop policy if exists "Public can read site content" on public.seman_site_content;
create policy "Public can read site content" on public.seman_site_content
  for select to anon, authenticated using (true);

-- כתיבה: בעלת סמן בלבד. אותה כתובת מייל כמו בשאר המדיניות במערכת.
-- אם משנים כתובת בעלים, יש לעדכן את כל המדיניות (businesses, seman_settings וכו׳) יחד.
drop policy if exists "Seman owner can manage site content" on public.seman_site_content;
create policy "Seman owner can manage site content" on public.seman_site_content
  for all to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'elisheva92121@gmail.com')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'elisheva92121@gmail.com');

grant select on public.seman_site_content to anon, authenticated;
grant insert, update, delete on public.seman_site_content to authenticated;
