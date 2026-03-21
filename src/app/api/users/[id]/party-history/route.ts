/**
 * GET /api/users/[id]/party-history
 *
 * Returns parties the user has participated in (approved memberships),
 * newest first. Includes basic party info joined.
 */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memberships")
    .select(
      `joined_at,
       party:parties!memberships_party_id_fkey (
         id, title, max_members, current_members, status, game_id,
         game:games!parties_game_id_fkey ( name )
       )`,
    )
    .eq("user_id", id)
    .eq("status", "approved")
    .order("joined_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[party-history]", error.message)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
