/**
 * GET  /api/notifications  — list notifications for current user
 * PATCH /api/notifications — mark all as read
 */
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getNotifications, markAllAsRead } from "@/lib/notifications"

export async function GET(_req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const notifications = await getNotifications(user.id as string)
  return NextResponse.json({ notifications })
}

export async function PATCH(_req: NextRequest) {
  let user: Awaited<ReturnType<typeof requireAuth>>
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const ok = await markAllAsRead(user.id as string)
  if (!ok) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
