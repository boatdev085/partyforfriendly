/**
 * GET /api/users/[id]
 *
 * Returns the user row plus:
 *   - average_rating      (null if no ratings yet)
 *   - party_count         (number of approved memberships)
 *   - rating_distribution (per-star counts: { 1: n, 2: n, 3: n, 4: n, 5: n })
 *
 * Public endpoint – no auth required.
 */
import { NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/users"
import { getAverageRating } from "@/lib/reviews"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

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

  const supabase = await createClient()

  // Count approved memberships (parties joined)
  const { count: partyCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("status", "approved")

  // Rating distribution: count per star (1–5)
  const { data: ratingRows } = await supabase
    .from("ratings")
    .select("score")
    .eq("rated_id", id)

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const row of (ratingRows ?? []) as { score: number }[]) {
    const s = row.score
    if (s >= 1 && s <= 5) distribution[s]++
  }

  return NextResponse.json({
    data: {
      ...user,
      average_rating: averageRating,
      party_count: partyCount ?? 0,
      rating_distribution: distribution,
    },
  })
}

/**
 * PATCH /api/users/[id]
 *
 * Update the authenticated user's own profile (display_name only for now).
 * Returns { data: { display_name } } on success.
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params

  // Auth check with dev fallback
  const isDev = process.env.NODE_ENV === "development"
  const session = await getSession()
  const callerId = isDev
    ? (session?.user?.id ?? "dev-local-000")
    : session?.user?.id

  if (!callerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Only allow editing own profile
  if (callerId !== id && !isDev) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { display_name } = body as { display_name?: string }

  if (!display_name || typeof display_name !== "string" || !display_name.trim()) {
    return NextResponse.json({ error: "invalid_display_name" }, { status: 400 })
  }

  const admin = createAdminClient()
  const targetId = isDev ? "dev-local-000" : id

  const { data, error } = await admin
    .from("users")
    .update({ display_name: display_name.trim() } as never)
    .eq("id", targetId)
    .select("display_name")
    .single()

  if (error) {
    console.error("[PATCH /api/users/[id]] update error:", error.message)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ data })
}
