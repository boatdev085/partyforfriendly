/**
 * Badges repository – server-side Supabase operations for the
 * `badges` and `user_badges` tables. Issue #22.
 */
import { createClient } from "@/lib/supabase/server"
import type { BadgeRow, UserBadgeRow } from "@/types/database"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserBadgeWithDetails extends UserBadgeRow {
  badge: BadgeRow
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * List all available badges.
 */
export async function getAllBadges(): Promise<BadgeRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[getAllBadges]", error.message)
    return []
  }
  return (data ?? []) as BadgeRow[]
}

/**
 * Get all badges earned by a user, including badge details.
 */
export async function getUserBadges(userId: string): Promise<UserBadgeWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badge:badges(*)")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false })

  if (error) {
    console.error("[getUserBadges]", error.message)
    return []
  }
  return (data ?? []) as unknown as UserBadgeWithDetails[]
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Award a badge to a user by badge slug. Idempotent — safe to call multiple times.
 * Returns the user_badge row (existing or newly created), or null on error.
 */
export async function awardBadge(
  userId: string,
  badgeSlug: string,
): Promise<UserBadgeRow | null> {
  const supabase = await createClient()

  // Resolve badge id from slug — cast to avoid supabase-js generic inference issues
  const { data: badge, error: badgeErr } = await (supabase
    .from("badges")
    .select("id")
    .eq("slug", badgeSlug)
    .single() as unknown as Promise<{
      data: { id: string } | null
      error: { message: string } | null
    }>)

  if (badgeErr || !badge) {
    console.error("[awardBadge] badge not found:", badgeSlug, badgeErr?.message)
    return null
  }

  const { data: row, error } = await (supabase
    .from("user_badges")
    .upsert(
      { user_id: userId, badge_id: badge.id } as never,
      { onConflict: "user_id,badge_id", ignoreDuplicates: true },
    )
    .select()
    .single() as unknown as Promise<{
      data: UserBadgeRow | null
      error: { message: string } | null
    }>)

  if (error) {
    console.error("[awardBadge]", error.message)
    return null
  }
  return row
}
