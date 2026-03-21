-- ============================================================
-- Migration: Add join_mode to parties + extend memberships status
-- ============================================================

-- Add join_mode column to parties (open = anyone can join,
-- request = host must approve, invite_only = invite only)
ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS join_mode text NOT NULL DEFAULT 'open'
    CHECK (join_mode IN ('open', 'request', 'invite_only'));

-- Extend memberships status constraint to include 'left' and 'kicked'
-- Drop old constraint first, then re-add with extended values
ALTER TABLE public.memberships
  DROP CONSTRAINT IF EXISTS memberships_status_check;

ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_status_check
    CHECK (status IN ('approved', 'pending', 'rejected', 'left', 'kicked'));
