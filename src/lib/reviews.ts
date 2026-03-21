/**
 * Reviews / ratings repository – server-side Supabase operations for the `ratings` table.
 *
 * Column mapping:
 *   reviewer  → rater_id
 *   reviewee  → rated_id
 *   rating    → score  (1–5)
 */
import { createClient } from "@/lib/supabase/server"
import type { RatingRow } from "@/types/database"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateReviewInput {
  reviewer_id: string
  reviewee_id: string
  party_id:    string
  rating:      number   // 1–5
  comment?:    string
}

interface BasicUser {
  id:           string
  username:     string
  display_name: string | null
  avatar_url:   string | null
}

export type ReviewWithRater   = RatingRow & { rater?: BasicUser | null }
export type ReviewWithRatee   = RatingRow & { rated?: BasicUser | null }

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * All reviews received by a user (rated_id = revieweeId), newest first.
 * Includes the rater's basic profile.
 */
export async function getReviewsForUser(
  revieweeId: string,
): Promise<ReviewWithRater[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ratings")
    .select("*, rater:users!ratings_rater_id_fkey(id, username, display_name, avatar_url)")
    .eq("rated_id", revieweeId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getReviewsForUser]", error.message)
    return []
  }
  return (data ?? []) as unknown as ReviewWithRater[]
}

/**
 * All reviews given by a user (rater_id = reviewerId), newest first.
 * Includes the reviewee's basic profile.
 */
export async function getReviewsByUser(
  reviewerId: string,
): Promise<ReviewWithRatee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ratings")
    .select("*, rated:users!ratings_rated_id_fkey(id, username, display_name, avatar_url)")
    .eq("rater_id", reviewerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getReviewsByUser]", error.message)
    return []
  }
  return (data ?? []) as unknown as ReviewWithRatee[]
}

/**
 * Compute the average rating score for a user (1–5 scale).
 * Returns null if the user has no ratings yet.
 * Average is rounded to one decimal place.
 */
export async function getAverageRating(
  userId: string,
): Promise<number | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ratings")
    .select("score")
    .eq("rated_id", userId)

  if (error) {
    console.error("[getAverageRating]", error.message)
    return null
  }
  if (!data || data.length === 0) return null

  const sum = (data as Pick<RatingRow, "score">[]).reduce(
    (acc, row) => acc + row.score,
    0,
  )
  return Math.round((sum / data.length) * 10) / 10
}

/**
 * Return party members that `userId` has NOT yet reviewed in the given party.
 * Excludes the user themselves.
 */
export async function getPendingReviews(
  userId: string,
  partyId: string,
): Promise<BasicUser[]> {
  const supabase = await createClient()

  // 1. Approved members of the party (excluding the current user)
  const { data: members, error: membersErr } = await (supabase
    .from("memberships")
    .select("user_id, users(id, username, display_name, avatar_url)")
    .eq("party_id", partyId)
    .eq("status", "approved")
    .neq("user_id", userId) as unknown as Promise<{
      data: Array<{ user_id: string; users: BasicUser | null }> | null
      error: { message: string } | null
    }>)

  if (membersErr) {
    console.error("[getPendingReviews] members:", membersErr.message)
    return []
  }

  // 2. Ratings already submitted by userId in this party
  const { data: given, error: givenErr } = await supabase
    .from("ratings")
    .select("rated_id")
    .eq("rater_id", userId)
    .eq("party_id", partyId)

  if (givenErr) {
    console.error("[getPendingReviews] given:", givenErr.message)
    return []
  }

  const ratedSet = new Set(
    (given as Pick<RatingRow, "rated_id">[]).map((r) => r.rated_id),
  )

  // 3. Members not yet reviewed
  return (members ?? [])
    .filter((m) => !ratedSet.has(m.user_id))
    .map((m) => m.users)
    .filter((u): u is BasicUser => u !== null)
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Create or update a review.
 * Upserts on (rater_id, rated_id, party_id) — one review per pair per party.
 */
export async function createReview(
  input: CreateReviewInput,
): Promise<RatingRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from("ratings")
    .upsert(
      {
        rater_id: input.reviewer_id,
        rated_id: input.reviewee_id,
        party_id: input.party_id,
        score:    input.rating,
        comment:  input.comment ?? null,
      } as never,
      { onConflict: "rater_id,rated_id,party_id" },
    )
    .select()
    .single() as unknown as Promise<{
      data:  RatingRow | null
      error: { message: string } | null
    }>)

  if (error) {
    console.error("[createReview]", error.message)
    return null
  }
  return data
}
