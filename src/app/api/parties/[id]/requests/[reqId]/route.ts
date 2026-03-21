/**
 * PATCH /api/parties/[id]/requests/[reqId]
 *
 * Approve or reject a pending join request.
 * Body: { action: 'approve' | 'reject' }
 *
 * Only the party host may call this endpoint.
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getPartyById } from "@/lib/parties"
import { approveRequest, rejectRequest } from "@/lib/join-requests"
import { createClient } from "@/lib/supabase/server"

type RouteContext = { params: Promise<{ id: string; reqId: string }> }

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  // 1. Auth
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id: partyId, reqId } = await params

  // 2. Verify party exists and caller is host
  const party = await getPartyById(partyId)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }
  if (party.host_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // 3. Parse action
  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { action } = body
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 },
    )
  }

  // 4. Verify request belongs to this party
  const supabase = await createClient()
  const { data: reqRow } = await (supabase
    .from("memberships")
    .select("id, party_id, user_id")
    .eq("id", reqId)
    .eq("party_id", partyId)
    .eq("status", "pending")
    .maybeSingle() as unknown as Promise<{
      data: { id: string; party_id: string; user_id: string } | null
      error: { message: string } | null
    }>)

  if (!reqRow) {
    return NextResponse.json({ error: "request_not_found" }, { status: 404 })
  }

  // 5. Apply action
  if (action === "approve") {
    const result = await approveRequest(reqId)
    if (!result) {
      return NextResponse.json({ error: "internal_error" }, { status: 500 })
    }
    // Increment current_members
    await supabase.rpc("join_party_safe" as never, {
      p_party_id: partyId,
      p_user_id: reqRow.user_id,
    } as never)
    return NextResponse.json({ data: result })
  } else {
    const result = await rejectRequest(reqId)
    if (!result) {
      return NextResponse.json({ error: "internal_error" }, { status: 500 })
    }
    return NextResponse.json({ data: result })
  }
}
