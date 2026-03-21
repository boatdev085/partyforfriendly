"use client"

/**
 * usePartyRealtime
 *
 * Subscribes to Supabase Realtime for a party room:
 *   - memberships table: member join / leave events
 *   - messages table:    new chat messages
 *
 * Returns live `members`, `messages`, and a `sendMessage` helper.
 */
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { MembershipRow, MessageRow } from "@/types/database"

export interface MemberWithUser extends MembershipRow {
  user?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export function usePartyRealtime(
  partyId: string,
  initialMembers: MemberWithUser[] = [],
  initialMessages: MessageRow[]   = [],
) {
  const [members,  setMembers]  = useState<MemberWithUser[]>(initialMembers)
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages)

  const supabase = createClient()

  useEffect(() => {
    if (!partyId) return

    const channel = supabase
      .channel(`party:${partyId}`)
      // ── Member join / leave ──────────────────────────────────────────────
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "memberships",
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMembers((prev) => {
              const exists = prev.some((m) => m.id === (payload.new as MembershipRow).id)
              return exists ? prev : [...prev, payload.new as MemberWithUser]
            })
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as MembershipRow
            // Remove members who are no longer approved (left / kicked)
            if (updated.status !== "approved") {
              setMembers((prev) => prev.filter((m) => m.id !== updated.id))
            } else {
              setMembers((prev) =>
                prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
              )
            }
          } else if (payload.eventType === "DELETE") {
            setMembers((prev) =>
              prev.filter((m) => m.id !== (payload.old as MembershipRow).id),
            )
          }
        },
      )
      // ── New chat message ─────────────────────────────────────────────────
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "messages",
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageRow])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── sendMessage helper ───────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, userId: string): Promise<void> => {
      if (!content.trim()) return
      const { error } = await (supabase.from("messages" as never) as unknown as {
        insert: (row: { party_id: string; user_id: string; content: string }) => Promise<{ error: { message: string } | null }>
      }).insert({ party_id: partyId, user_id: userId, content: content.trim() })

      if (error) {
        console.error("[usePartyRealtime] sendMessage error:", error.message)
      }
    },
    [partyId, supabase],
  )

  return { members, messages, sendMessage }
}
