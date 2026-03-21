/**
 * GET    /api/parties/[id]  — fetch a single party (public)
 * PATCH  /api/parties/[id]  — partial update (host only)
 * DELETE /api/parties/[id]  — soft-delete → status='closed' (host only)
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPartyById, updateParty, deleteParty } from "@/lib/parties"
import { getMemberCount } from "@/lib/party-members"

type RouteContext = { params: Promise<{ id: string }> }

// ---------------------------------------------------------------------------
// GET /api/parties/[id]
// ---------------------------------------------------------------------------
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params

  const party = await getPartyById(id)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }

  const member_count = await getMemberCount(id)

  return NextResponse.json({ data: { ...party, member_count } })
}

// ---------------------------------------------------------------------------
// PATCH /api/parties/[id]
// ---------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const party = await getPartyById(id)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }

  if (party.host_id !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  // Prevent changing host_id via PATCH
  delete body.host_id

  const updated = await updateParty(id, body as Parameters<typeof updateParty>[1])
  if (!updated) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ data: updated })
}

// ---------------------------------------------------------------------------
// DELETE /api/parties/[id]  (soft-delete)
// ---------------------------------------------------------------------------
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext,
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const party = await getPartyById(id)
  if (!party) {
    return NextResponse.json({ error: "party_not_found" }, { status: 404 })
  }

  if (party.host_id !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const ok = await deleteParty(id)
  if (!ok) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
