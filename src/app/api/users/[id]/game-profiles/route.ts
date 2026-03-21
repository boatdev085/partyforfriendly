/**
 * GET  /api/users/[id]/game-profiles  — list game profiles for a user
 * POST /api/users/[id]/game-profiles  — upsert a game profile (auth required, own profile only)
 */
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserGameProfiles, upsertGameProfile } from "@/lib/game-profiles"

type RouteContext = { params: Promise<{ id: string }> }

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  const { id } = await params
  const profiles = await getUserGameProfiles(id)
  return NextResponse.json({ data: profiles })
}

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: RouteContext,
) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params

  if (session.user.id !== id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!body.game_id || typeof body.game_id !== "string") {
    return NextResponse.json({ error: "game_id_required" }, { status: 400 })
  }

  const profile = await upsertGameProfile({
    user_id:      id,
    game_id:      body.game_id as string,
    in_game_name: (body.in_game_name as string) ?? null,
    rank:         (body.rank as string) ?? null,
    role:         (body.role as string) ?? null,
    play_style:   (body.play_style as string) ?? null,
    notes:        (body.notes as string) ?? null,
  })

  if (!profile) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }

  return NextResponse.json({ data: profile })
}
