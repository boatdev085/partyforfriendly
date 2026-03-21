"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import toast from "react-hot-toast";
import NotifItem, { type Notif, type NotifType } from "@/components/notifications/NotifItem";
import AuthGuard from "@/components/auth/AuthGuard";
import type { NotificationRow } from "@/types/database";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "เมื่อกี้";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
}

function rowToNotif(row: NotificationRow): Notif {
  const data = (row.data ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    type: row.type as NotifType,
    username: (data.username as string | undefined),
    game: (data.game as string | undefined),
    score: (data.score as number | undefined),
    partyId: (data.partyId as string | undefined),
    requestId: (data.requestId as string | undefined),
    timeAgo: formatTimeAgo(row.created_at),
    isNew: !row.is_read,
  };
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Page = styled.main`
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 20px 80px;

  @media (max-width: 768px) {
    padding: 20px 16px 60px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: ${theme.colors.text};

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const MarkAllBtn = styled.button`
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.borderLight}; color: ${theme.colors.text}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
  margin-bottom: 8px;
`;

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 14px;
  padding: 4px 12px;
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: ${theme.colors.textDim};
`;

const LoadingRow = styled.div`
  padding: 32px;
  text-align: center;
  font-size: 13px;
  color: ${theme.colors.textMuted};
`;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  // Fetch notifications on mount
  const fetchNotifs = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json() as { notifications: NotificationRow[] };
      setNotifs(json.notifications.map(rowToNotif));
    } catch {
      toast.error("ไม่สามารถโหลดการแจ้งเตือนได้");
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    void fetchNotifs();
  }, [fetchNotifs]);

  // Realtime subscription — prepend new notifications without page reload
  useEffect(() => {
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = rowToNotif(payload.new as NotificationRow);
          setNotifs((prev) => [newNotif, ...prev]);
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session]);

  // Mark single notification as read
  const markRead = useCallback(async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isNew: false })));
    await fetch("/api/notifications", { method: "PATCH" });
  }, []);

  // Approve join request
  const handleApprove = useCallback(async (notifId: string) => {
    const notif = notifs.find(n => n.id === notifId);
    if (!notif?.partyId || !notif?.requestId) return;
    try {
      const res = await fetch(
        `/api/parties/${notif.partyId}/requests/${notif.requestId}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }) },
      );
      if (!res.ok) throw new Error();
      toast.success("Approved ✅");
      await markRead(notifId);
      setNotifs(prev => prev.filter(n => n.id !== notifId));
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }, [notifs, markRead]);

  // Reject join request
  const handleReject = useCallback(async (notifId: string) => {
    const notif = notifs.find(n => n.id === notifId);
    if (!notif?.partyId || !notif?.requestId) return;
    try {
      const res = await fetch(
        `/api/parties/${notif.partyId}/requests/${notif.requestId}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject" }) },
      );
      if (!res.ok) throw new Error();
      toast.success("Rejected ❌");
      await markRead(notifId);
      setNotifs(prev => prev.filter(n => n.id !== notifId));
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  }, [notifs, markRead]);

  const newNotifs = notifs.filter(n => n.isNew);
  const oldNotifs = notifs.filter(n => !n.isNew);

  return (
    <AuthGuard>
    <Page>
      <Header>
        <Title>แจ้งเตือน</Title>
        <MarkAllBtn onClick={markAllRead} disabled={loading || notifs.every(n => !n.isNew)}>
          อ่านทั้งหมด
        </MarkAllBtn>
      </Header>

      {loading ? (
        <Card><LoadingRow>กำลังโหลด...</LoadingRow></Card>
      ) : (
        <>
          <Section>
            <SectionLabel>ใหม่ {newNotifs.length > 0 ? `(${newNotifs.length})` : ""}</SectionLabel>
            <Card>
              {newNotifs.length === 0 ? (
                <Empty>ไม่มีการแจ้งเตือนใหม่</Empty>
              ) : (
                newNotifs.map(n => (
                  <NotifItem
                    key={n.id}
                    notif={n}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClick={markRead}
                  />
                ))
              )}
            </Card>
          </Section>

          <Section>
            <SectionLabel>ก่อนหน้า</SectionLabel>
            <Card>
              {oldNotifs.length === 0 ? (
                <Empty>ไม่มีการแจ้งเตือนก่อนหน้า</Empty>
              ) : (
                oldNotifs.map(n => (
                  <NotifItem key={n.id} notif={n} onClick={markRead} />
                ))
              )}
            </Card>
          </Section>
        </>
      )}
    </Page>
    </AuthGuard>
  );
}
