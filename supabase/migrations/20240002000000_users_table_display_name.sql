-- Migration: Add display_name to users table and create indexes
-- Issue #16: [DB] Supabase schema – users table

-- Add display_name column (Discord's shown name, distinct from @username handle)
alter table public.users
  add column if not exists display_name text;

-- Indexes for common query patterns
create index if not exists users_discord_id_idx on public.users (discord_id);
create index if not exists users_username_idx   on public.users (username);

-- Allow upsert from server-side (service role inserts on first OAuth login)
create policy "users_insert_service" on public.users
  for insert with check (true);
