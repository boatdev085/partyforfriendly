/**
 * User repository – server-side Supabase operations for the `users` table.
 * All functions run with the anon key via the server client; upsertUser is
 * called from the NextAuth JWT callback so it runs on every sign-in.
 */
import { createClient } from "@/lib/supabase/server"
import type { UserRow, UserInsert, UserUpdate } from "@/types/database"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscordProfile {
  id: string           // Discord snowflake
  username: string     // @handle (unique)
  global_name?: string // Display name (may be null for legacy accounts)
  discriminator?: string
  avatar?: string | null
  email?: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function avatarUrl(profile: DiscordProfile): string | null {
  if (!profile.avatar) return null
  return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp?size=256`
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Fetch a user row by internal UUID.
 */
export async function getUserById(id: string): Promise<UserRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("[getUserById]", error.message)
    return null
  }
  return data as UserRow
}

/**
 * Fetch a user row by Discord snowflake ID.
 */
export async function getUserByDiscordId(discordId: string): Promise<UserRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("discord_id", discordId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = row not found; anything else is a real error
    console.error("[getUserByDiscordId]", error.message)
  }
  return (data as UserRow | null) ?? null
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Upsert a user record from a Discord OAuth profile.
 * Called inside the NextAuth `jwt` callback on every sign-in so the DB
 * always reflects the latest Discord avatar / username.
 *
 * Returns the upserted row or null on failure (non-blocking – auth continues).
 */
export async function upsertUser(profile: DiscordProfile): Promise<UserRow | null> {
  const supabase = await createClient()

  const payload: UserInsert = {
    discord_id:    profile.id,
    username:      profile.username,
    discriminator: profile.discriminator ?? null,
    display_name:  profile.global_name ?? null,
    avatar_url:    avatarUrl(profile),
    email:         profile.email ?? null,
  }

  // Use explicit cast: supabase-js v2 strict generics can infer `never` in
  // complex TypeScript versions when the Database union isn't fully resolved.
  const { data, error } = await (supabase
    .from("users")
    .upsert(payload as never, {
      onConflict:       "discord_id",
      ignoreDuplicates: false,
    })
    .select()
    .single() as unknown as Promise<{ data: UserRow | null; error: { message: string } | null }>)

  if (error) {
    console.error("[upsertUser]", error.message)
    return null
  }
  return data
}

/**
 * Partial update of a user's own profile fields.
 */
export async function updateUser(
  id: string,
  patch: UserUpdate,
): Promise<UserRow | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from("users")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single() as unknown as Promise<{ data: UserRow | null; error: { message: string } | null }>)

  if (error) {
    console.error("[updateUser]", error.message)
    return null
  }
  return data
}
