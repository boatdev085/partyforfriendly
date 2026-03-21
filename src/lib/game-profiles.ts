/**
 * Game profiles repository – server-side Supabase operations for the
 * `game_profiles` table. Issue #23.
 */
import { createClient } from "@/lib/supabase/server"
import type { GameProfileRow, GameProfileInsert, GameProfileUpdate, GameRow } from "@/types/database"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GameProfileWithGame extends GameProfileRow {
  game: Pick<GameRow, 'id' | 'name' | 'slug' | 'cover_url'>
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get all game profiles for a user, with game info joined.
 */
export async function getUserGameProfiles(userId: string): Promise<GameProfileWithGame[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("game_profiles")
    .select("*, game:games(id, name, slug, cover_url)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("[getUserGameProfiles]", error.message)
    return []
  }
  return (data ?? []) as GameProfileWithGame[]
}

/**
 * Get a single game profile for a user + game combination.
 */
export async function getGameProfile(
  userId: string,
  gameId: string,
): Promise<GameProfileRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("game_profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[getGameProfile]", error.message)
    }
    return null
  }
  return data as GameProfileRow
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Create or update a game profile. Safe to call multiple times.
 */
export async function upsertGameProfile(data: {
  user_id: string
  game_id: string
  in_game_name?: string | null
  rank?: string | null
  role?: string | null
  play_style?: string | null
  notes?: string | null
}): Promise<GameProfileRow | null> {
  const supabase = await createClient()

  const payload: GameProfileInsert = {
    user_id:      data.user_id,
    game_id:      data.game_id,
    in_game_name: data.in_game_name ?? null,
    rank:         data.rank ?? null,
    role:         data.role ?? null,
    play_style:   data.play_style ?? null,
    notes:        data.notes ?? null,
  }

  const { data: row, error } = await (supabase
    .from("game_profiles")
    .upsert(payload as never, { onConflict: "user_id,game_id", ignoreDuplicates: false })
    .select()
    .single() as unknown as Promise<{
      data: GameProfileRow | null
      error: { message: string } | null
    }>)

  if (error) {
    console.error("[upsertGameProfile]", error.message)
    return null
  }
  return row
}

/**
 * Delete a game profile for a user + game combination.
 */
export async function deleteGameProfile(
  userId: string,
  gameId: string,
): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("game_profiles")
    .delete()
    .eq("user_id", userId)
    .eq("game_id", gameId)

  if (error) {
    console.error("[deleteGameProfile]", error.message)
    return false
  }
  return true
}
