-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  discord_id text unique not null,
  username text not null,
  discriminator text,
  avatar_url text,
  email text,
  is_premium boolean default false,
  premium_expires_at timestamptz,
  stripe_customer_id text,
  locale text default 'th',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GAMES
-- ============================================================
create table public.games (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  cover_url text,
  genre text[],
  created_at timestamptz default now()
);

-- ============================================================
-- PARTIES
-- ============================================================
create table public.parties (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  game_id uuid references public.games(id) on delete set null,
  host_id uuid references public.users(id) on delete cascade not null,
  max_members int not null default 4,
  current_members int not null default 1,
  status text not null default 'open' check (status in ('open', 'full', 'closed', 'in_progress')),
  required_rank text,
  language text not null default 'th' check (language in ('th', 'en', 'both')),
  discord_channel_id text,
  discord_voice_channel_id text,
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MEMBERSHIPS
-- ============================================================
create table public.memberships (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid references public.parties(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('host', 'member')),
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),
  joined_at timestamptz default now(),
  unique (party_id, user_id)
);

-- ============================================================
-- WAITLIST
-- ============================================================
create table public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  party_id uuid references public.parties(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  position int not null,
  created_at timestamptz default now(),
  unique (party_id, user_id)
);

-- ============================================================
-- RATINGS
-- ============================================================
create table public.ratings (
  id uuid primary key default uuid_generate_v4(),
  rater_id uuid references public.users(id) on delete cascade not null,
  rated_id uuid references public.users(id) on delete cascade not null,
  party_id uuid references public.parties(id) on delete cascade not null,
  score int not null check (score between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (rater_id, rated_id, party_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- BADGES
-- ============================================================
create table public.badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  icon_url text,
  condition_type text not null,
  condition_value int not null,
  created_at timestamptz default now()
);

create table public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  awarded_at timestamptz default now(),
  unique (user_id, badge_id)
);

-- ============================================================
-- GAME PROFILES
-- ============================================================
create table public.game_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  in_game_name text,
  rank text,
  role text,
  updated_at timestamptz default now(),
  unique (user_id, game_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.parties enable row level security;
alter table public.memberships enable row level security;
alter table public.waitlist enable row level security;
alter table public.ratings enable row level security;
alter table public.notifications enable row level security;
alter table public.user_badges enable row level security;
alter table public.game_profiles enable row level security;

-- Users: anyone can read, only self can update
create policy "users_read_all" on public.users for select using (true);
create policy "users_update_self" on public.users for update using (auth.uid() = id);

-- Parties: anyone can read open parties, host can modify
create policy "parties_read_all" on public.parties for select using (true);
create policy "parties_insert_auth" on public.parties for insert with check (auth.uid() = host_id);
create policy "parties_update_host" on public.parties for update using (auth.uid() = host_id);
create policy "parties_delete_host" on public.parties for delete using (auth.uid() = host_id);

-- Memberships: members of party can read, approved members only
create policy "memberships_read" on public.memberships for select using (
  auth.uid() = user_id or
  auth.uid() in (select host_id from public.parties where id = party_id)
);
create policy "memberships_insert" on public.memberships for insert with check (auth.uid() = user_id);
create policy "memberships_update_host" on public.memberships for update using (
  auth.uid() in (select host_id from public.parties where id = party_id)
);

-- Notifications: only owner can read/update
create policy "notifications_owner" on public.notifications for all using (auth.uid() = user_id);

-- Ratings: anyone can read, only rater can insert
create policy "ratings_read_all" on public.ratings for select using (true);
create policy "ratings_insert_auth" on public.ratings for insert with check (auth.uid() = rater_id);

-- Game profiles: anyone can read, only owner can modify
create policy "game_profiles_read_all" on public.game_profiles for select using (true);
create policy "game_profiles_owner" on public.game_profiles for all using (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger parties_updated_at before update on public.parties
  for each row execute function public.handle_updated_at();
