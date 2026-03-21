/**
 * Parties repository – server-side Supabase operations for the `parties` table.
 * All functions use the server client (anon key + RLS).
 */
import { createClient } from "@/lib/supabase/server"
import type { PartyRow, PartyInsert, PartyUpdate } from "@/types/database"

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export interface PartyFilters {
  status?: PartyRow["status"]
  game_id?: string
  join_mode?: PartyRow["join_mode"]
}

// ---------------------------------------------------------------------------
// PartyWithHost – party row joined with basic host user info
// ---------------------------------------------------------------------------

export interface PartyWithHost extends PartyRow {
  host: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  } | null
  member_count?: number
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * List parties, optionally filtered by status, game_id, or join_mode.
 * Returns each party with the host's basic profile joined.
 */
export async function getParties(
  filters?: PartyFilters,
): Promise<PartyWithHost[]> {
  const supabase = await createClient()

  let query = supabase
    .from("parties")
    .select(
      `*,
       host:users!parties_host_id_fkey (
         id, username, display_name, avatar_url
       )`,
    )
    .order("created_at", { ascending: false })

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }
  if (filters?.game_id) {
    query = query.eq("game_id", filters.game_id)
  }
  if (filters?.join_mode) {
    query = query.eq("join_mode", filters.join_mode)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getParties]", error.message)
    return []
  }

  return (data ?? []) as unknown as PartyWithHost[]
}

/**
 * Fetch a single party by ID, including current member count.
 */
export async function getPartyById(id: string): Promise<PartyWithHost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("parties")
    .select(
      `*,
       host:users!parties_host_id_fkey (
         id, username, display_name, avatar_url
       ),
       game:games!parties_game_id_fkey (
         id, name, slug, cover_url
       )`,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("[getPartyById]", error.message)
    return null
  }

  return data as unknown as PartyWithHost | null
}

/**
 * Fetch all parties created by a specific host.
 */
export async function getPartiesByHost(hostId: string): Promise<PartyRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getPartiesByHost]", error.message)
    return []
  }

  return (data ?? []) as PartyRow[]
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Insert a new party and return the created row.
 */
export async function createParty(
  data: PartyInsert,
): Promise<PartyRow | null> {
  const supabase = await createClient()

  const { data: created, error } = await (supabase
    .from("parties")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: PartyRow | null
    error: { message: string } | null
  }>)

  if (error) {
    console.error("[createParty]", error.message)
    return null
  }

  return created
}

/**
 * Update specific fields of a party and return the updated row.
 */
export async function updateParty(
  id: string,
  patch: PartyUpdate,
): Promise<PartyRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from("parties")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single() as unknown as Promise<{
    data: PartyRow | null
    error: { message: string } | null
  }>)

  if (error) {
    console.error("[updateParty]", error.message)
    return null
  }

  return data
}

/**
 * Soft-delete a party by setting its status to 'closed'.
 * Does not physically remove the row so chat history is preserved.
 */
export async function deleteParty(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("parties")
    .update({ status: "closed" } as never)
    .eq("id", id)

  if (error) {
    console.error("[deleteParty]", error.message)
    return false
  }

  return true
}
