/**
 * GET /api/parties/[id]/members
 *
 * Returns all approved members of a party, joined with user info
 * and their average rating (from the ratings table).
 * Requires authentication.
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDevUserId } from "@/lib/dev-auth"
import { getPartyMembers } from "@/lib/party-members"
import { createClient } from "@/lib/supabase/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const isDev = process.env.NODE_ENV === "development"
  const session = await getSession()
  const userId = isDev
    ? (session?.user?.id ?? await getDevUserId())
    : session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id: partyId } = await params

  if (!partyId) {
    return NextResponse.json({ error: "missing_party_id" }, { status: 400 })
  }

  const members = await getPartyMembers(partyId)

  if (members.length === 0) {
    return NextResponse.json({ members: [] })
  }

  // Fetch all ratings for member user IDs in a single query
  const userIds = members.map((m) => m.user_id)
  const supabase = await createClient()
  const { data: ratings } = await supabase
    .from("ratings")
    .select("rated_id, score")
    .in("rated_id", userIds)

  // Build a map: user_id → average score
  const scoreMap: Record<string, number[]> = {}
  for (const r of (ratings ?? []) as { rated_id: string; score: number }[]) {
    if (!scoreMap[r.rated_id]) scoreMap[r.rated_id] = []
    scoreMap[r.rated_id].push(r.score)
  }
  const avgMap: Record<string, number | null> = {}
  for (const uid of userIds) {
    const scores = scoreMap[uid]
    avgMap[uid] = scores?.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null
  }

  const membersWithRating = members.map((m) => ({
    ...m,
    average_rating: avgMap[m.user_id] ?? null,
  }))

  return NextResponse.json({ members: membersWithRating })
}
