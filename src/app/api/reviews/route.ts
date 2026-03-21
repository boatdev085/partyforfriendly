/**
 * GET  /api/reviews?userId=<id>  — get reviews received by a user
 * POST /api/reviews              — submit a new review (auth required)
 *
 * POST body: { reviewee_id, party_id, rating, comment? }
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getReviewsForUser, createReview } from "@/lib/reviews"

// ---------------------------------------------------------------------------
// GET /api/reviews?userId=xxx
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "missing_userId" }, { status: 400 })
  }

  const reviews = await getReviewsForUser(userId)
  return NextResponse.json({ reviews })
}

// ---------------------------------------------------------------------------
// POST /api/reviews
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: {
    reviewee_id?: string
    party_id?: string
    rating?: number
    comment?: string
  }
  try {
    body = await req.json() as typeof body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { reviewee_id, party_id, rating, comment } = body

  if (!reviewee_id || !party_id || !rating) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 400 })
  }

  if ((user.id as string) === reviewee_id) {
    return NextResponse.json({ error: "cannot_review_self" }, { status: 400 })
  }

  const review = await createReview({
    reviewer_id: user.id as string,
    reviewee_id,
    party_id,
    rating,
    comment,
  })

  if (!review) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ review }, { status: 201 })
}
