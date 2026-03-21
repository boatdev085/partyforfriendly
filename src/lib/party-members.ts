/**
 * Party-members repository – server-side Supabase operations for the
 * `memberships` table (active party members).
 *
 * Status lifecycle:
 *   pending   → approved (host accepts join request)
 *   approved  → left     (member leaves voluntarily)
 *   approved  → kicked   (host removes member)
 *   pending   → rejected (host declines request)
 */
import { createClient } from "@/lib/supabase/server"
import type { MembershipRow, MembershipInsert } from "@/types/database"

// ---------------------------------------------------------------------------
// MemberWithUser – membership row joined with basic user info
// ---------------------------------------------------------------------------

export interface MemberWithUser extends MembershipRow {
  user: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Return all active (approved) members of a party, joined with user info.
 */
export async function getPartyMembers(
  partyId: string,
): Promise<MemberWithUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memberships")
    .select(
      `*,
       user:users!memberships_user_id_fkey (
         id, username, display_name, avatar_url
       )`,
    )
    .eq("party_id", partyId)
    .eq("status", "approved")
    .order("joined_at", { ascending: true })

  if (error) {
    console.error("[getPartyMembers]", error.message)
    return []
  }

  return (data ?? []) as unknown as MemberWithUser[]
}

/**
 * Count active (approved) members in a party.
 */
export async function getMemberCount(partyId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("party_id", partyId)
    .eq("status", "approved")

  if (error) {
    console.error("[getMemberCount]", error.message)
    return 0
  }

  return count ?? 0
}

/**
 * Check whether a user is currently an active member of a party.
 */
export async function isUserInParty(
  partyId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memberships")
    .select("id")
    .eq("party_id", partyId)
    .eq("user_id", userId)
    .eq("status", "approved")
    .maybeSingle()

  if (error) {
    console.error("[isUserInParty]", error.message)
    return false
  }

  return data !== null
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Add a user to a party.
 * - role defaults to 'member'
 * - status defaults to 'approved' (use 'pending' for request-based parties)
 */
export async function addMember(
  partyId: string,
  userId: string,
  role: "host" | "member" = "member",
  status: "approved" | "pending" = "approved",
): Promise<MembershipRow | null> {
  const supabase = await createClient()

  const payload: MembershipInsert = {
    party_id: partyId,
    user_id: userId,
    role,
    status,
  }

  const { data, error } = await (supabase
    .from("memberships")
    .insert(payload as never)
    .select()
    .single() as unknown as Promise<{
    data: MembershipRow | null
    error: { message: string } | null
  }>)

  if (error) {
    console.error("[addMember]", error.message)
    return null
  }

  return data
}

/**
 * Mark a member as having left voluntarily (status → 'left').
 */
export async function removeMember(
  partyId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("memberships")
    .update({ status: "left" } as never)
    .eq("party_id", partyId)
    .eq("user_id", userId)
    .eq("status", "approved")

  if (error) {
    console.error("[removeMember]", error.message)
    return false
  }

  return true
}

/**
 * Leave a party safely via the `leave_party_safe` RPC.
 * Atomically marks the member as left, decrements the counter,
 * reopens the party if it was full, and auto-promotes the next
 * pending join request (waitlist FIFO).
 *
 * Returns the RPC result or null on unexpected error.
 */
export interface LeavePartyResult {
  success?: boolean
  promoted_user_id?: string | null
  error?: string
}

export async function leaveParty(
  partyId: string,
  userId: string,
): Promise<LeavePartyResult | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: { p_party_id: string; p_user_id: string },
  ) => Promise<{ data: LeavePartyResult | null; error: { message: string } | null }>)(
    "leave_party_safe",
    { p_party_id: partyId, p_user_id: userId },
  )

  if (error) {
    console.error("[leaveParty]", error.message)
    return null
  }

  return data
}

/**
 * Kick a member from the party (status → 'kicked').
 * Only the party host should be allowed to call this (enforce via RLS or API layer).
 */
export async function kickMember(
  partyId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("memberships")
    .update({ status: "kicked" } as never)
    .eq("party_id", partyId)
    .eq("user_id", userId)
    .in("status", ["approved", "pending"])

  if (error) {
    console.error("[kickMember]", error.message)
    return false
  }

  return true
}
