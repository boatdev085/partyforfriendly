-- Migration: Add slug to badges + seed badge data
-- Badges table already exists from initial schema; add the slug column.

alter table public.badges
  add column if not exists slug text;

-- Backfill slug from name for any existing rows
update public.badges
  set slug = lower(regexp_replace(name, '\s+', '_', 'g'))
  where slug is null;

-- Now add the unique constraint (after backfill)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'badges_slug_key' and conrelid = 'public.badges'::regclass
  ) then
    alter table public.badges add constraint badges_slug_key unique (slug);
  end if;
end;
$$;

-- Make slug not null
alter table public.badges alter column slug set not null;

-- Enable RLS on badges (was missing from initial schema)
alter table public.badges enable row level security;

-- Policies
create policy if not exists "Badges are viewable by everyone"
  on public.badges for select using (true);

create policy if not exists "User badges are viewable by everyone"
  on public.user_badges for select using (true);

create policy if not exists "Users can earn badges"
  on public.user_badges for insert with check (auth.uid() = user_id);

-- Seed badge data
insert into public.badges (slug, name, description, condition_type, condition_value) values
  ('first_party',  'Party Starter', 'Created your first party',       'parties_hosted', 1),
  ('team_player',  'Team Player',   'Joined 10 parties',              'parties_joined', 10),
  ('top_rated',    'Top Rated',     'Received 5-star rating 5 times', 'five_star_ratings', 5),
  ('veteran',      'Veteran',       'Played for 30 days',             'days_active', 30)
on conflict (slug) do nothing;
