-- ===========================================================
--  AiPressent – databaseoppsett. Kjør i Supabase → SQL Editor → Run.
-- ===========================================================

-- PROFILER -------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  ai_enabled boolean not null default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- lag profil automatisk ved registrering
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- PRESENTASJONER -------------------------------------------
create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text default 'Uten tittel',
  theme text default 'minimal',
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.presentations enable row level security;

drop policy if exists "pres owner all" on public.presentations;
create policy "pres owner all" on public.presentations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- LAGRING (bilder) -----------------------------------------
insert into storage.buckets (id, name, public)
values ('slides', 'slides', true)
on conflict (id) do nothing;

drop policy if exists "slides read" on storage.objects;
create policy "slides read" on storage.objects for select using (bucket_id = 'slides');

drop policy if exists "slides write" on storage.objects;
create policy "slides write" on storage.objects for insert to authenticated
  with check (bucket_id = 'slides');

drop policy if exists "slides update" on storage.objects;
create policy "slides update" on storage.objects for update to authenticated
  using (bucket_id = 'slides');
