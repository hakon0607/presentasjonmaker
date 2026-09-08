-- ============================================================
--  AiPresent – abonnement (Stripe) + admin
--  Kjør hele denne i Supabase → SQL Editor (én gang).
-- ============================================================

-- 1) Utvid profiles med abonnement- og admin-felt --------------
alter table public.profiles add column if not exists plan text not null default 'gratis';
alter table public.profiles add column if not exists tokens_daily int not null default 5;   -- daglig påfyll (settes etter nivå)
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists sub_status text;            -- active | trialing | past_due | canceled | null
alter table public.profiles add column if not exists sub_interval text;          -- month | year
alter table public.profiles add column if not exists sub_period_end timestamptz; -- når inneværende periode slutter
alter table public.profiles add column if not exists sub_cancel_at_period_end boolean not null default false; -- sagt opp, avsluttes ved periodeslutt

-- 2) plans: kvoter + Stripe price-id-er (du limer inn price-id-ene fra Stripe) --
create table if not exists public.plans (
  tier text primary key,               -- 'gratis' | 'pluss' | 'pro'
  name text not null,
  tokens_daily int not null,
  price_month_id text,                 -- Stripe price-id (månedlig)  price_...
  price_year_id text,                  -- Stripe price-id (årlig)     price_...
  price_month_nok int,                 -- visningspris (kr/mnd) – kun til visning
  price_year_nok int,                  -- visningspris (kr/år)  – kun til visning
  sort int not null default 0
);

insert into public.plans (tier, name, tokens_daily, price_month_nok, price_year_nok, sort) values
  ('gratis', 'Gratis', 5,   0,    0,   0),
  ('pluss',  'Pluss',  300, 79,   790, 1),
  ('pro',    'Pro',    1000, 199, 1990, 2)
on conflict (tier) do nothing;

-- 3) RLS ------------------------------------------------------
alter table public.plans enable row level security;
drop policy if exists plans_read_all on public.plans;
create policy plans_read_all on public.plans for select using (true);   -- alle kan lese prisene

-- profiles: la brukeren lese/oppdatere kun egen rad (behold ev. eksisterende policyer).
-- Admin-operasjoner går gjennom edge-funksjonen 'admin-api' med service-nøkkel (utenom RLS),
-- og funksjonen sjekker selv at den som kaller er admin. Ingen bred admin-policy trengs her.

-- 4) Hjelp: gjør deg selv til admin (bytt inn din e-post) ------
-- update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'hakon.solvik@hotmail.com');
