/**
 * GET  /api/parties/[id]/messages  – list recent messages for a party
 * POST /api/parties/[id]/messages  – send a new message
 *
 * After a successful POST the message is synced to the party's Discord
 * channel (discord_channel_id) in a fire-and-forget fashion.
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPartyById } from "@/lib/parties"
import { createClient } from "@/lib/supabase/server"
import { syncMessageToDiscord } from "@/lib/discord-sync"
import type { MessageRow } from "@/types/database"

type RouteContext = { params: Promise<{ id: string }> }

// ---------------------------------------------------------------------------
// GET – fetch messages (newest-last, limit 100)
// ---------------------------------------------------------------------------
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

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("party_id", partyId)
    .order("created_at", { ascending: true })
    .limit(100)

  if (error) {
    console.error("[GET /api/parties/[id]/messages]", error.message)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ messages: (data ?? []) as MessageRow[] })
}

// ---------------------------------------------------------------------------
// POST – send a message
// ---------------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const { id: partyId } = await params
  if (!partyId) {
    return NextResponse.json({ error: "missing_party_id" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({})) as { content?: string }
  const content = (body.content ?? "").trim()
  if (!content) {
    return NextResponse.json({ error: "content_required" }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "content_too_long" }, { status: 400 })
  }

  const supabase = await createClient()

  // Insert message
  const { data: message, error } = await supabase
    .from("messages")
    .insert({ party_id: partyId, user_id: userId, content } as never)
    .select()
    .single()

  if (error) {
    console.error("[POST /api/parties/[id]/messages]", error.message)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  // Fire-and-forget: sync to Discord channel if party has one configured
  void (async () => {
    try {
      const party = await getPartyById(partyId)
      if (party?.discord_channel_id) {
        const displayName =
          session.user.name ?? session.user.email ?? "Unknown"
        await syncMessageToDiscord(
          party.discord_channel_id,
          displayName,
          content,
        )
      }
    } catch (err) {
      console.error("[discord-sync] failed:", err)
    }
  })()

  return NextResponse.json({ message: message as MessageRow }, { status: 201 })
}
