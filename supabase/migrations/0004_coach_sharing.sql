-- ACE Tracker — coach/client sharing and coach review notes
--
-- A client invites a coach by email. When someone signed in with that email
-- accepts, they get READ-ONLY access to the client's reports, scores,
-- development plans and PDFs. The client can revoke at any time; the coach can
-- step away. Coaches write review notes (focus, summary, reflection questions)
-- per comparison and choose when to share them with the client.

-- ---------------------------------------------------------------------------
-- coach_links
-- ---------------------------------------------------------------------------
create table if not exists public.coach_links (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references auth.users (id) on delete cascade,
  client_name  text,
  client_email text,
  coach_email  text not null,
  coach_id     uuid references auth.users (id) on delete cascade,
  status       text not null default 'pending'
    check (status in ('pending', 'active', 'revoked')),
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz,
  unique (client_id, coach_email)
);

create index if not exists coach_links_coach_idx on public.coach_links (coach_id);
create index if not exists coach_links_coach_email_idx
  on public.coach_links (lower(coach_email));

alter table public.coach_links enable row level security;

-- Clients manage their own invitations.
drop policy if exists "clients manage their coach links" on public.coach_links;
create policy "clients manage their coach links"
  on public.coach_links for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

-- Coaches can see invitations addressed to them and links they hold.
drop policy if exists "coaches see their links" on public.coach_links;
create policy "coaches see their links"
  on public.coach_links for select
  using (
    coach_id = auth.uid()
    or lower(coach_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Coaches can't update rows directly; they go through these functions.
create or replace function public.accept_coach_invite(link_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.coach_links
  set coach_id = auth.uid(), status = 'active', accepted_at = now()
  where id = link_id
    and status = 'pending'
    and lower(coach_email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  if not found then
    raise exception 'Invitation not found';
  end if;
end;
$$;

create or replace function public.leave_client(link_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.coach_links
  set status = 'revoked'
  where id = link_id
    and (
      coach_id = auth.uid()
      or (status = 'pending'
          and lower(coach_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
    );
end;
$$;

revoke all on function public.accept_coach_invite(uuid) from public, anon;
revoke all on function public.leave_client(uuid) from public, anon;
grant execute on function public.accept_coach_invite(uuid) to authenticated;
grant execute on function public.leave_client(uuid) to authenticated;

-- True when the current user is an active coach of the given client.
create or replace function public.is_coach_of(client uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.coach_links
    where client_id = client and coach_id = auth.uid() and status = 'active'
  );
$$;

-- Same check keyed by a storage folder name (text), so a malformed folder
-- name can never raise a cast error inside a storage policy.
create or replace function public.is_coach_of_folder(folder text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.coach_links
    where client_id::text = folder and coach_id = auth.uid() and status = 'active'
  );
$$;

grant execute on function public.is_coach_of(uuid) to authenticated;
grant execute on function public.is_coach_of_folder(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Read-only coach access to client data
-- ---------------------------------------------------------------------------
drop policy if exists "coaches read client reports" on public.reports;
create policy "coaches read client reports"
  on public.reports for select
  using (public.is_coach_of(user_id));

drop policy if exists "coaches read client scores" on public.report_scores;
create policy "coaches read client scores"
  on public.report_scores for select
  using (public.is_coach_of(user_id));

drop policy if exists "coaches read client plans" on public.development_plans;
create policy "coaches read client plans"
  on public.development_plans for select
  using (public.is_coach_of(user_id));

drop policy if exists "coaches read client report files" on storage.objects;
create policy "coaches read client report files"
  on storage.objects for select
  using (
    bucket_id = 'reports'
    and public.is_coach_of_folder((storage.foldername(name))[1])
  );

-- ---------------------------------------------------------------------------
-- review_notes: a coach's write-up for one comparison (before → after)
-- ---------------------------------------------------------------------------
create table if not exists public.review_notes (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references auth.users (id) on delete cascade,
  coach_id       uuid not null references auth.users (id) on delete cascade,
  from_report_id uuid not null references public.reports (id) on delete cascade,
  to_report_id   uuid not null references public.reports (id) on delete cascade,
  summary        text,
  focus_trait    text,
  focus_note     text,
  questions      jsonb not null default '[]'::jsonb,
  shared         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (coach_id, from_report_id, to_report_id)
);

create index if not exists review_notes_client_idx on public.review_notes (client_id);

alter table public.review_notes enable row level security;

drop policy if exists "coaches manage their review notes" on public.review_notes;
create policy "coaches manage their review notes"
  on public.review_notes for all
  using (coach_id = auth.uid() and public.is_coach_of(client_id))
  with check (coach_id = auth.uid() and public.is_coach_of(client_id));

drop policy if exists "clients read shared review notes" on public.review_notes;
create policy "clients read shared review notes"
  on public.review_notes for select
  using (client_id = auth.uid() and shared);
