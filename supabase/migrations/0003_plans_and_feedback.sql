-- ACE Tracker — feedback quadrants + development plans
--
-- Feedback quadrants: page 4 of the ACE Report marks each of four feedback
-- situations as Easy or Hard. Stored as nullable columns on the report.
--
-- Development plans: the "Confidence Development Plan" (last page of the
-- Confidence Traits report). One plan per report — the plan written after
-- receiving that report — so the next comparison can open with "where you
-- started".

alter table public.reports
  add column if not exists feedback_giving_compliments text
    check (feedback_giving_compliments in ('easy', 'hard')),
  add column if not exists feedback_giving_criticism text
    check (feedback_giving_criticism in ('easy', 'hard')),
  add column if not exists feedback_receiving_compliments text
    check (feedback_receiving_compliments in ('easy', 'hard')),
  add column if not exists feedback_receiving_criticism text
    check (feedback_receiving_criticism in ('easy', 'hard'));

create table if not exists public.development_plans (
  id                 uuid primary key default gen_random_uuid(),
  report_id          uuid not null unique references public.reports (id) on delete cascade,
  user_id            uuid not null references auth.users (id) on delete cascade,
  -- Q1 / Q4: the great trait to leverage, in the person's own words, and next step
  great_trait        text,
  great_trait_words  text,
  great_next_step    text,
  -- Q2 / Q4: the growth trait to resolve, in their own words, and next step
  growth_trait       text,
  growth_trait_words text,
  growth_next_step   text,
  -- Q3: how they'll communicate their greatness and growth area
  communicating      text,
  -- Q5: how life changes / accountability / celebration
  life_change        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists development_plans_user_idx
  on public.development_plans (user_id);

alter table public.development_plans enable row level security;

drop policy if exists "development plans are owned" on public.development_plans;
create policy "development plans are owned"
  on public.development_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
