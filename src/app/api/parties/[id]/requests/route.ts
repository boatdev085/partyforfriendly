/**
 * GET /api/parties/[id]/requests
 *
 * Returns all pending join requests for a party.
 * Only the party host may call this endpoint.
 *
 * Responses:
 *   200 { requests: JoinRequestRow[] }
 *   401 { error: 'unauthorized' }
 *   403 { error: 'forbidden' }   – caller is not the party host
 *   404 { error: 'party_not_found' }
 *   500 { error: 'internal_error' }
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getPartyById } from "@/lib/parties"
import { getPendingRequests } from "@/lib/join-requests"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth check
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2. Resolve dynamic segment
  const { id: partyId } = await params
  if (!partyId) {
    return NextResponse.json({ error: "missing_party_id" }, { status: 400 })
  }

  // 3. Fetch party and verify host
  const party = await getPartyById(partyId)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }
  if (party.host_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // 4. Fetch pending requests
  const requests = await getPendingRequests(partyId)

  return NextResponse.json({ requests }, { status: 200 })
}
