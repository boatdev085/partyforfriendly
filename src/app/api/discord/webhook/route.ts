/**
 * POST /api/discord/webhook
 *
 * Stub endpoint for future Discord interaction/event webhooks.
 * Returns 200 so Discord's endpoint verification passes.
 */
import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest): Promise<NextResponse> {
  // TODO: verify Discord request signature (X-Signature-Ed25519 / X-Signature-Timestamp)
  // TODO: handle PING, application commands, component interactions, etc.
  return NextResponse.json({ message: "ok" }, { status: 200 })
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "Discord webhook endpoint" }, { status: 200 })
}
