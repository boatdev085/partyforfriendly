/**
 * Notifications repository – server-side Supabase operations for the
 * `notifications` table. Issue #21.
 */
import { createClient } from "@/lib/supabase/server"
import type { Json, NotificationRow, NotificationInsert } from "@/types/database"

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get all notifications for a user, newest first.
 */
export async function getNotifications(userId: string): Promise<NotificationRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getNotifications]", error.message)
    return []
  }
  return (data ?? []) as NotificationRow[]
}

/**
 * Count unread notifications for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("[getUnreadCount]", error.message)
    return 0
  }
  return count ?? 0
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("id", notificationId)

  if (error) {
    console.error("[markAsRead]", error.message)
    return false
  }
  return true
}

/**
 * Mark all notifications for a user as read.
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) {
    console.error("[markAllAsRead]", error.message)
    return false
  }
  return true
}

/**
 * Create a notification for a user.
 * `payload` maps to the `data` jsonb column.
 */
export async function createNotification(data: {
  user_id: string
  type: string
  title: string
  message: string
  payload?: Json
}): Promise<NotificationRow | null> {
  const supabase = await createClient()

  const payload: NotificationInsert = {
    user_id: data.user_id,
    type:    data.type,
    title:   data.title,
    message: data.message,
    data:    data.payload ?? null,
  }

  const { data: row, error } = await (supabase
    .from("notifications")
    .insert(payload as never)
    .select()
    .single() as unknown as Promise<{
      data: NotificationRow | null
      error: { message: string } | null
    }>)

  if (error) {
    console.error("[createNotification]", error.message)
    return null
  }
  return row
}

/**
 * Delete a notification by id.
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)

  if (error) {
    console.error("[deleteNotification]", error.message)
    return false
  }
  return true
}
