/**
 * GET /api/users/[id]
 *
 * Returns the user row plus:
 *   - average_rating  (null if no ratings yet)
 *   - party_count     (number of approved memberships)
 *
 * Public endpoint – no auth required.
 */
import { NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/users"
import { getAverageRating } from "@/lib/reviews"
import { createClient } from "@/lib/supabase/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params

  const [user, averageRating] = await Promise.all([
    getUserById(id),
    getAverageRating(id),
  ])

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 })
  }

  // Count approved memberships (parties joined)
  const supabase = await createClient()
  const { count: partyCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("status", "approved")

  return NextResponse.json({
    data: {
      ...user,
      average_rating: averageRating,
      party_count: partyCount ?? 0,
    },
  })
}
