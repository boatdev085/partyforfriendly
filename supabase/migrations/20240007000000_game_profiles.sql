-- Migration: Extend game_profiles with play_style and notes columns
-- game_profiles table already exists from initial schema.

alter table public.game_profiles
  add column if not exists play_style text,
  add column if not exists notes text;

-- Add created_at if missing (initial schema only had updated_at)
alter table public.game_profiles
  add column if not exists created_at timestamptz default now();

-- Index on user_id for fast profile lookups
create index if not exists idx_game_profiles_user
  on public.game_profiles(user_id);

create index if not exists idx_game_profiles_game
  on public.game_profiles(game_id);

-- Ensure updated_at trigger exists (reuse handle_updated_at from initial schema)
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'game_profiles_updated_at'
      and tgrelid = 'public.game_profiles'::regclass
  ) then
    create trigger game_profiles_updated_at
      before update on public.game_profiles
      for each row execute function public.handle_updated_at();
  end if;
end;
$$;
