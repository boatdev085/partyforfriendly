/**
 * POST /api/parties/[id]/join
 *
 * Join or request to join a party.
 *
 * Behaviour by join_mode:
 *   open        → direct join via `join_party_safe` RPC (race-condition-safe)
 *   request     → create pending membership row; host must approve
 *   invite_only → always 403
 *
 * Responses:
 *   200 { status: 'joined',   member_count: number }   – open, success
 *   202 { status: 'pending' }                          – request mode
 *   400 { error: string }                              – bad input / party state
 *   401 { error: 'unauthorized' }                      – not authenticated
 *   403 { error: 'invite_only' }                       – invite-only party
 *   404 { error: 'party_not_found' }                   – party does not exist
 *   409 { error: 'party_full' | 'already_member' }     – conflict
 *   500 { error: 'internal_error' }                    – unexpected failure
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPartyById } from "@/lib/parties"
import { createJoinRequest, getUserRequest } from "@/lib/join-requests"
import { createClient } from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// RPC result shape returned by join_party_safe
// ---------------------------------------------------------------------------
interface JoinPartyRpcResult {
  success?: boolean
  member_count?: number
  error?: string
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth check
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  // 2. Resolve dynamic segment (Next.js 15 params are async)
  const { id: partyId } = await params

  if (!partyId) {
    return NextResponse.json({ error: "missing_party_id" }, { status: 400 })
  }

  // 3. Fetch the party
  const party = await getPartyById(partyId)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }

  // 4. Guard: party must be open to accept new members
  if (party.status !== "open") {
    if (party.status === "full") {
      return NextResponse.json({ error: "party_full" }, { status: 409 })
    }
    return NextResponse.json({ error: "party_not_open" }, { status: 400 })
  }

  // 5. Guard: host cannot join their own party
  if (party.host_id === userId) {
    return NextResponse.json({ error: "host_cannot_join" }, { status: 400 })
  }

  // 6. Dispatch on join_mode
  switch (party.join_mode) {
    // ------------------------------------------------------------------
    case "invite_only":
      return NextResponse.json({ error: "invite_only" }, { status: 403 })

    // ------------------------------------------------------------------
    case "request": {
      // Check for an existing membership row (any status) to prevent dupes
      const existing = await getUserRequest(partyId, userId)
      if (existing) {
        if (existing.status === "approved") {
          return NextResponse.json({ error: "already_member" }, { status: 409 })
        }
        if (existing.status === "pending") {
          return NextResponse.json({ error: "request_pending" }, { status: 409 })
        }
        // Rejected/left/kicked – allow re-request by falling through
      }

      const request = await createJoinRequest(partyId, userId)
      if (!request) {
        return NextResponse.json({ error: "internal_error" }, { status: 500 })
      }
      return NextResponse.json({ status: "pending" }, { status: 202 })
    }

    // ------------------------------------------------------------------
    case "open":
    default: {
      // Use the race-safe RPC that locks the party row before inserting
      const supabase = await createClient()
      const { data, error } = await (supabase.rpc as unknown as (
        fn: string,
        args: { p_party_id: string; p_user_id: string },
      ) => Promise<{ data: JoinPartyRpcResult | null; error: { message: string } | null }>)(
        "join_party_safe",
        { p_party_id: partyId, p_user_id: userId },
      )

      if (error) {
        console.error("[POST /api/parties/[id]/join] rpc error:", error.message)
        return NextResponse.json({ error: "internal_error" }, { status: 500 })
      }

      const result = data as JoinPartyRpcResult

      if (result.error) {
        const statusMap: Record<string, number> = {
          party_not_found: 404,
          party_not_open:  400,
          already_member:  409,
          party_full:      409,
        }
        const httpStatus = statusMap[result.error] ?? 400
        return NextResponse.json({ error: result.error }, { status: httpStatus })
      }

      return NextResponse.json(
        { status: "joined", member_count: result.member_count },
        { status: 200 },
      )
    }
  }
}
