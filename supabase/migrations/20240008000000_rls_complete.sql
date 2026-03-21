-- Migration: Comprehensive RLS policy audit
-- Ensures all tables have RLS enabled and fills in any missing policies.

-- ============================================================
-- Ensure RLS is enabled on all tables
-- ============================================================
alter table public.users          enable row level security;
alter table public.games          enable row level security;
alter table public.parties        enable row level security;
alter table public.memberships    enable row level security;
alter table public.waitlist       enable row level security;
alter table public.ratings        enable row level security;
alter table public.notifications  enable row level security;
alter table public.badges         enable row level security;
alter table public.user_badges    enable row level security;
alter table public.game_profiles  enable row level security;

-- ============================================================
-- games: publicly readable (was missing policies)
-- ============================================================
create policy if not exists "Games are viewable by everyone"
  on public.games for select using (true);

-- ============================================================
-- memberships: extend visibility — party members can see all
-- memberships in their party; initial policy was restrictive.
-- ============================================================
create policy if not exists "Memberships visible to party members"
  on public.memberships for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.memberships m2
      where m2.party_id = memberships.party_id
        and m2.user_id = auth.uid()
        and m2.status = 'approved'
    )
  );

create policy if not exists "Members can leave parties"
  on public.memberships for delete using (auth.uid() = user_id);

-- ============================================================
-- waitlist: users can manage their own waitlist entry
-- ============================================================
create policy if not exists "Waitlist visible to party members"
  on public.waitlist for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.memberships m
      where m.party_id = waitlist.party_id
        and m.user_id = auth.uid()
        and m.status = 'approved'
    )
  );

create policy if not exists "Users can join waitlist"
  on public.waitlist for insert with check (auth.uid() = user_id);

create policy if not exists "Users can leave waitlist"
  on public.waitlist for delete using (auth.uid() = user_id);

-- ============================================================
-- ratings: authenticated users can create (insert)
-- ============================================================
create policy if not exists "Authenticated users can update own ratings"
  on public.ratings for update using (auth.uid() = rater_id);

create policy if not exists "Authenticated users can delete own ratings"
  on public.ratings for delete using (auth.uid() = rater_id);

-- ============================================================
-- notifications: ensure owner-only policy covers all ops
-- ============================================================
create policy if not exists "Users can insert own notifications"
  on public.notifications for insert with check (auth.uid() = user_id);

-- ============================================================
-- user_badges: admins award badges (service role); users read own
-- ============================================================
create policy if not exists "Users can view own badges"
  on public.user_badges for select using (auth.uid() = user_id);
