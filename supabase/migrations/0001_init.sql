-- ACE Tracker — initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
-- It creates the tables, row-level security, a storage bucket for the raw PDFs,
-- and a trigger that provisions a profile row when a user signs up.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are self-service" on public.profiles;
create policy "profiles are self-service"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- reports: one row per uploaded assessment
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  report_date        date not null,
  headline_archetype text,
  narrative          text,
  pdf_path           text,
  status             text not null default 'complete',
  created_at         timestamptz not null default now()
);

create index if not exists reports_user_date_idx
  on public.reports (user_id, report_date);

alter table public.reports enable row level security;

drop policy if exists "reports are owned" on public.reports;
create policy "reports are owned"
  on public.reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- report_scores: tidy long-format, one row per trait per report
-- ---------------------------------------------------------------------------
create table if not exists public.report_scores (
  id              bigint generated always as identity primary key,
  report_id       uuid not null references public.reports (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  archetype_key   text not null,
  archetype_name  text not null,
  confidence_type text not null check (confidence_type in ('AC', 'OC', 'UC')),
  trait           text not null,
  score           numeric(5, 2),
  unique (report_id, trait)
);

create index if not exists report_scores_user_trait_idx
  on public.report_scores (user_id, trait);

create index if not exists report_scores_report_idx
  on public.report_scores (report_id);

alter table public.report_scores enable row level security;

drop policy if exists "report scores are owned" on public.report_scores;
create policy "report scores are owned"
  on public.report_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile row on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage bucket for the raw PDF uploads (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- Users may only read/write objects under a folder named after their user id:
--   reports/<user_id>/<file>.pdf
drop policy if exists "own report files - select" on storage.objects;
create policy "own report files - select"
  on storage.objects for select
  using (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own report files - insert" on storage.objects;
create policy "own report files - insert"
  on storage.objects for insert
  with check (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own report files - delete" on storage.objects;
create policy "own report files - delete"
  on storage.objects for delete
  using (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);
