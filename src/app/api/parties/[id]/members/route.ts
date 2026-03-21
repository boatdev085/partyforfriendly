/**
 * GET /api/parties/[id]/members
 *
 * Returns all approved members of a party, joined with user info.
 * Requires authentication.
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPartyMembers } from "@/lib/party-members"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id: partyId } = await params

  if (!partyId) {
    return NextResponse.json({ error: "missing_party_id" }, { status: 400 })
  }

  const members = await getPartyMembers(partyId)

  return NextResponse.json({ members })
}
