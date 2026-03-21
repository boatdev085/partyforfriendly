-- Migration: Add tags, discord_voice_link, scheduled_at to parties table
alter table public.parties
  add column if not exists tags text[] default '{}',
  add column if not exists discord_voice_link text,
  add column if not exists scheduled_at timestamptz;
