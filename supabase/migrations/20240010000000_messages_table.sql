-- ============================================================
-- Migration: Add messages table for party chat
-- ============================================================

create table if not exists public.messages (
  id          uuid primary key default uuid_generate_v4(),
  party_id    uuid references public.parties(id) on delete cascade not null,
  user_id     uuid references public.users(id)   on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now()
);

-- Index for fast per-party queries ordered by time
create index if not exists messages_party_created_idx
  on public.messages (party_id, created_at desc);

-- RLS
alter table public.messages enable row level security;

-- Party members can read messages in their party
create policy "messages_read_members" on public.messages
  for select using (
    auth.uid() in (
      select user_id from public.memberships
      where party_id = messages.party_id
        and status = 'approved'
    )
    or
    auth.uid() in (
      select host_id from public.parties where id = messages.party_id
    )
  );

-- Authenticated approved members can insert
create policy "messages_insert_members" on public.messages
  for insert with check (
    auth.uid() = user_id
    and (
      auth.uid() in (
        select user_id from public.memberships
        where party_id = messages.party_id
          and status = 'approved'
      )
      or
      auth.uid() in (
        select host_id from public.parties where id = messages.party_id
      )
    )
  );
