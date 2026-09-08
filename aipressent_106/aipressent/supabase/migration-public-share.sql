-- ===========================================================
--  Del som lenke: gjør presentasjoner offentlig lesbare når is_public = true
--  Kjør i Supabase → SQL Editor → Run
-- ===========================================================
alter table public.presentations add column if not exists is_public boolean not null default false;

drop policy if exists "pres public read" on public.presentations;
create policy "pres public read" on public.presentations
  for select using (is_public = true);
