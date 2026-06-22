-- ===========================================================
--  AI-TILGANG PER BRUKER
--  Styr hvem som får bruke AI fra: Supabase → Table editor → profiles → ai_enabled
--  (huk av = true for de som skal ha tilgang, false for resten)
--  Kjør denne i Supabase → SQL Editor → Run.
-- ===========================================================

alter table public.profiles
  add column if not exists ai_enabled boolean not null default false;

-- Gi alle EKSISTERENDE brukere tilgang nå (så du ikke låser deg selv ute).
-- Nye brukere får default false, og du skrur dem på manuelt i Table editor.
update public.profiles set ai_enabled = true;
