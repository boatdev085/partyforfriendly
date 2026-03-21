/**
 * GET /api/reviews/pending?partyId=<id>
 *
 * Returns party members that the current user has NOT yet rated in the
 * given party (excludes the user themselves).
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getPendingReviews } from "@/lib/reviews"

export async function GET(req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const partyId = req.nextUrl.searchParams.get("partyId")
  if (!partyId) {
    return NextResponse.json({ error: "missing_partyId" }, { status: 400 })
  }

  const members = await getPendingReviews(user.id as string, partyId)
  return NextResponse.json({ members })
}
