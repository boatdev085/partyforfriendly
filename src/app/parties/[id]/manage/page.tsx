"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import PartySettings from "@/components/leader/PartySettings";
import RealtimeStats from "@/components/leader/RealtimeStats";
import MemberManager, { MemberItem } from "@/components/leader/MemberManager";
import PendingList, { PendingItem } from "@/components/leader/PendingList";
import AuthGuard from "@/components/auth/AuthGuard";

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Page = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg};
  display: flex;
  flex-direction: column;
  font-family: ${theme.fonts.sans};
`;

const Topbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${theme.colors.bgCard};
  border-bottom: 1px solid ${theme.colors.border};
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OpenBadge = styled.span<{ $open: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ $open }) => ($open ? theme.colors.success : theme.colors.textMuted)};
  background: ${({ $open }) =>
    $open ? "rgba(34, 197, 94, 0.12)" : "rgba(150,150,150,0.12)"};
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;
`;

const PageTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BackLink = styled(Link)`
  padding: 8px 14px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 480px) {
    padding: 16px 12px;
    gap: 16px;
  }
`;

const ForbiddenMsg = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${theme.colors.textMuted};
  font-size: 16px;
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PartyData {
  id: string;
  title: string;
  host_id: string;
  max_members: number;
  current_members: number;
  status: string;
  join_mode: "open" | "request" | "invite_only";
  discord_channel_id: string | null;
  discord_voice_link: string | null;
  member_count: number;
}

interface MemberData {
  id: string;
  user_id: string;
  role: "host" | "member";
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface RequestData {
  id: string;
  user_id: string;
  joined_at: string;
  users: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hrs / 24)} วันที่แล้ว`;
}

function toMemberItem(
  m: MemberData,
  selfId: string | undefined,
  hostId: string,
): MemberItem {
  const username =
    m.user?.display_name ?? m.user?.username ?? m.user_id.slice(0, 8);
  return {
    id: m.user_id,
    username,
    isLeader: m.user_id === hostId,
    isSelf: m.user_id === selfId,
    rating: 0,
    partyCount: 0,
  };
}

function toPendingItem(r: RequestData): PendingItem {
  return {
    id: r.id,
    username:
      r.users?.display_name ?? r.users?.username ?? r.user_id.slice(0, 8),
    rating: 0,
    partyCount: 0,
    timeAgo: relativeTime(r.joined_at),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LeaderPanelPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const partyId = params?.id as string;
  const selfId = (session?.user as { id?: string })?.id;

  const [party, setParty] = useState<PartyData | null>(null);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!partyId) return;
    try {
      const [partyRes, membersRes, requestsRes] = await Promise.all([
        fetch(`/api/parties/${partyId}`).then((r) => r.json()),
        fetch(`/api/parties/${partyId}/members`).then((r) => r.json()),
        fetch(`/api/parties/${partyId}/requests`).then((r) => r.json()),
      ]);

      const p: PartyData = partyRes.data;
      if (!p) return;

      // Verify host access once session is available
      if (selfId && p.host_id !== selfId) {
        setForbidden(true);
        return;
      }

      setParty(p);
      setMembers(
        (membersRes.data ?? []).map((m: MemberData) =>
          toMemberItem(m, selfId, p.host_id),
        ),
      );
      setPending(
        (requestsRes.requests ?? []).map((r: RequestData) => toPendingItem(r)),
      );
    } catch (err) {
      console.error("[LeaderPanel] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [partyId, selfId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---------------------------------------------------------------------------
  // Approve / reject
  // ---------------------------------------------------------------------------

  const handleApprove = async (reqId: string) => {
    await fetch(`/api/parties/${partyId}/requests/${reqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    await fetchAll();
  };

  const handleReject = async (reqId: string) => {
    await fetch(`/api/parties/${partyId}/requests/${reqId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    await fetchAll();
  };

  // ---------------------------------------------------------------------------
  // Kick
  // ---------------------------------------------------------------------------

  const handleKick = async (userId: string) => {
    await fetch(`/api/parties/${partyId}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await fetchAll();
  };

  // ---------------------------------------------------------------------------
  // Save party settings
  // ---------------------------------------------------------------------------

  const handleSave = async (settings: {
    joinMode: "auto" | "approve";
    maxMembers: number;
    discord: string;
  }) => {
    await fetch(`/api/parties/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        join_mode: settings.joinMode === "auto" ? "open" : "request",
        max_members: settings.maxMembers,
        discord_voice_link: settings.discord || null,
      }),
    });
    await fetchAll();
  };

  // ---------------------------------------------------------------------------
  // Disband
  // ---------------------------------------------------------------------------

  const handleDisband = async () => {
    if (!window.confirm("ยืนยันการยุบ Party? การกระทำนี้ไม่สามารถย้อนกลับได้"))
      return;
    await fetch(`/api/parties/${partyId}`, { method: "DELETE" });
    router.push("/parties");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (forbidden) {
    return (
      <AuthGuard>
        <Page>
          <ForbiddenMsg>คุณไม่มีสิทธิ์จัดการห้องนี้ 🚫</ForbiddenMsg>
        </Page>
      </AuthGuard>
    );
  }

  const isOpen = party?.status === "open";
  const memberCount = party?.member_count ?? members.length;
  const maxMembers = party?.max_members ?? 5;

  const joinModeInitial: "auto" | "approve" =
    party?.join_mode === "request" ? "approve" : "auto";

  return (
    <AuthGuard>
      <Page>
        <Topbar>
          <OpenBadge $open={isOpen}>
            {isOpen ? "OPEN" : (party?.status ?? "LOADING").toUpperCase()}{" "}
            {!loading && `${memberCount}/${maxMembers}`}
          </OpenBadge>
          <PageTitle>⚙️ จัดการห้อง</PageTitle>
          <BackLink href={`/parties/${partyId}`}>← กลับห้อง</BackLink>
        </Topbar>

        <Content>
          <RealtimeStats
            memberCount={memberCount}
            maxMembers={maxMembers}
            pendingCount={pending.length}
            waitlistCount={0}
            onDisband={handleDisband}
          />

          <PartySettings
            key={party?.id ?? "loading"}
            initialJoinMode={joinModeInitial}
            initialMaxMembers={maxMembers}
            initialDiscord={party?.discord_voice_link ?? ""}
            onSave={handleSave}
          />

          <MemberManager
            initialMembers={members}
            onKick={handleKick}
          />

          <PendingList
            initialPending={pending}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Content>
      </Page>
    </AuthGuard>
  );
}
