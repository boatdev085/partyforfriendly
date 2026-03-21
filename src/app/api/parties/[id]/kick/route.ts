/**
 * POST /api/parties/[id]/kick
 *
 * Kick a member from the party.
 * Body: { userId: string }
 *
 * Only the party host may call this endpoint.
 * Host cannot kick themselves.
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDevUserId } from "@/lib/dev-auth"
import { getPartyById } from "@/lib/parties"
import { kickMember } from "@/lib/party-members"
import { createClient } from "@/lib/supabase/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(
  req: NextRequest,
  { params }: RouteContext,
) {
  // 1. Auth (with dev fallback)
  const isDev = process.env.NODE_ENV === "development"
  const session = await getSession()
  const callerId = isDev
    ? (session?.user?.id ?? await getDevUserId())
    : session?.user?.id
  if (!callerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const user = { id: callerId }

  const { id: partyId } = await params

  // 2. Verify party + host
  const party = await getPartyById(partyId)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }
  if (party.host_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // 3. Parse body
  let body: { userId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { userId } = body
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId_required" }, { status: 400 })
  }

  // 4. Host cannot kick themselves
  if (userId === user.id) {
    return NextResponse.json({ error: "cannot_kick_self" }, { status: 400 })
  }

  // 5. Kick via leave_party_safe RPC to properly decrement count
  const supabase = await createClient()
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: { p_party_id: string; p_user_id: string },
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    "leave_party_safe",
    { p_party_id: partyId, p_user_id: userId },
  )

  if (error) {
    // Fallback: direct kickMember if RPC fails
    const ok = await kickMember(partyId, userId)
    if (!ok) {
      return NextResponse.json({ error: "internal_error" }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: true, data })
}
