/**
 * PATCH /api/notifications/[id]/read — mark a single notification as read
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { markAsRead } from "@/lib/notifications"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 })
  }

  const ok = await markAsRead(id)
  if (!ok) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
