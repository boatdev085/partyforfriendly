/**
 * POST /api/parties/[id]/leave
 *
 * Leave a party. Uses the `leave_party_safe` RPC which atomically:
 *   1. Marks the caller's membership as 'left'
 *   2. Decrements current_members
 *   3. Reopens the party if it was 'full'
 *   4. Auto-promotes the oldest pending join request (waitlist FIFO)
 *
 * Responses:
 *   200 { success: true, promoted_user_id: string | null }
 *   400 { error: 'not_a_member' | string }
 *   401 { error: 'unauthorized' }
 *   404 { error: 'party_not_found' }
 *   500 { error: 'internal_error' }
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { leaveParty } from "@/lib/party-members"

export async function POST(
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

  // 3. Call the RPC via the lib helper
  const result = await leaveParty(partyId, user.id)

  if (!result) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  if (result.error) {
    const statusMap: Record<string, number> = {
      party_not_found: 404,
      not_a_member:    400,
    }
    return NextResponse.json(
      { error: result.error },
      { status: statusMap[result.error] ?? 400 },
    )
  }

  return NextResponse.json(
    { success: true, promoted_user_id: result.promoted_user_id ?? null },
    { status: 200 },
  )
}
