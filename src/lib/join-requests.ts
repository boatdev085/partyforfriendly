/**
 * Join-request repository – server-side Supabase operations.
 *
 * "Join requests" are rows in the `memberships` table with status = 'pending'.
 * Approving flips status → 'approved'; rejecting → 'rejected'.
 * A user can cancel (delete) their own pending row.
 */
import { createClient } from "@/lib/supabase/server"
import type { MembershipRow } from "@/types/database"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JoinRequestUser {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type JoinRequestRow = MembershipRow & {
  users?: JoinRequestUser | null
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Return all pending join requests for a party, with basic user info.
 * Ordered oldest-first so the host can process FIFO.
 */
export async function getPendingRequests(
  partyId: string,
): Promise<JoinRequestRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memberships")
    .select("*, users(id, username, display_name, avatar_url)")
    .eq("party_id", partyId)
    .eq("status", "pending")
    .order("joined_at", { ascending: true })

  if (error) {
    console.error("[getPendingRequests]", error.message)
    return []
  }
  return (data ?? []) as unknown as JoinRequestRow[]
}

/**
 * Get the requesting user's own membership row for a party.
 * Returns null if no request/membership exists yet.
 */
export async function getUserRequest(
  partyId: string,
  userId: string,
): Promise<MembershipRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("party_id", partyId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[getUserRequest]", error.message)
    return null
  }
  return data as MembershipRow | null
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Create a pending join request for a user.
 * Fails silently (returns null) if a membership row already exists
 * for the party+user pair (unique constraint violation).
 *
 * @param _message - reserved for future use; not stored in the current schema
 */
export async function createJoinRequest(
  partyId: string,
  userId: string,
  _message?: string,
): Promise<MembershipRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from("memberships")
    .insert({
      party_id: partyId,
      user_id:  userId,
      role:     "member",
      status:   "pending",
    } as never)
    .select()
    .single() as unknown as Promise<{
      data:  MembershipRow | null
      error: { message: string; code: string } | null
    }>)

  if (error) {
    console.error("[createJoinRequest]", error.message)
    return null
  }
  return data
}

/**
 * Approve a pending request: set status → 'approved'.
 * The caller is responsible for also incrementing current_members on the party.
 */
export async function approveRequest(
  requestId: string,
): Promise<MembershipRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from("memberships")
    .update({ status: "approved" } as never)
    .eq("id", requestId)
    .select()
    .single() as unknown as Promise<{
      data:  MembershipRow | null
      error: { message: string } | null
    }>)

  if (error) {
    console.error("[approveRequest]", error.message)
    return null
  }
  return data
}

/**
 * Reject a pending request: set status → 'rejected'.
 */
export async function rejectRequest(
  requestId: string,
): Promise<MembershipRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from("memberships")
    .update({ status: "rejected" } as never)
    .eq("id", requestId)
    .select()
    .single() as unknown as Promise<{
      data:  MembershipRow | null
      error: { message: string } | null
    }>)

  if (error) {
    console.error("[rejectRequest]", error.message)
    return null
  }
  return data
}

/**
 * Cancel the user's own pending request (deletes the row).
 * The `userId` guard ensures a user can only cancel their own request.
 * Returns true on success, false if the row was not found or not deletable.
 */
export async function cancelRequest(
  requestId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", requestId)
    .eq("user_id", userId)
    .eq("status", "pending")

  if (error) {
    console.error("[cancelRequest]", error.message)
    return false
  }
  return true
}
