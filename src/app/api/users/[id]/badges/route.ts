/**
 * GET /api/users/[id]/badges
 *
 * Returns all badges earned by a user, including badge details.
 * Public endpoint – no auth required.
 */
import { NextRequest, NextResponse } from "next/server"
import { getUserBadges } from "@/lib/badges"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params
  const badges = await getUserBadges(id)
  return NextResponse.json({ data: badges })
}
