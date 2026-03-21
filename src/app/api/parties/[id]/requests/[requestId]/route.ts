/**
 * PATCH /api/parties/[id]/requests/[requestId]
 *
 * Approve or reject a pending join request.
 * Only the party host may call this endpoint.
 *
 * Request body:
 *   { action: 'approve' | 'reject' }
 *
 * Responses:
 *   200 { request: MembershipRow }
 *   400 { error: 'invalid_action' | 'missing_action' }
 *   401 { error: 'unauthorized' }
 *   403 { error: 'forbidden' }   – caller is not the party host
 *   404 { error: 'party_not_found' | 'request_not_found' }
 *   500 { error: 'internal_error' }
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getPartyById } from "@/lib/parties"
import { approveRequest, rejectRequest } from "@/lib/join-requests"
import { createNotification } from "@/lib/notifications"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> },
) {
  // 1. Auth check
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2. Resolve dynamic segments
  const { id: partyId, requestId } = await params
  if (!partyId || !requestId) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 })
  }

  // 3. Parse + validate body
  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { action } = body
  if (!action) {
    return NextResponse.json({ error: "missing_action" }, { status: 400 })
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 })
  }

  // 4. Verify the caller is the party host
  const party = await getPartyById(partyId)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }
  if (party.host_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // 5. Dispatch approve / reject
  if (action === "approve") {
    const updated = await approveRequest(requestId)
    if (!updated) {
      return NextResponse.json({ error: "request_not_found" }, { status: 404 })
    }

    // Notify the requester that they were approved
    await createNotification({
      user_id: updated.user_id,
      type:    "approved",
      title:   "Join request approved",
      message: `Your join request for "${party.title}" was approved — welcome!`,
      payload: { party_id: partyId },
    })

    return NextResponse.json({ request: updated }, { status: 200 })
  }

  // action === 'reject'
  const updated = await rejectRequest(requestId)
  if (!updated) {
    return NextResponse.json({ error: "request_not_found" }, { status: 404 })
  }

  return NextResponse.json({ request: updated }, { status: 200 })
}
