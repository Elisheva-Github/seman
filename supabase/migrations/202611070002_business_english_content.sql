-- Optional English business content for bilingual public pages.
alter table public.businesses add column if not exists name_en text not null default '';
alter table public.businesses add column if not exists category_en text not null default '';
alter table public.businesses add column if not exists description_en text not null default '';
