"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import toast from "react-hot-toast";
import { theme } from "@/styles/theme";
import ChatArea, { ChatMessage } from "@/components/room/ChatArea";
import MembersList, { Member } from "@/components/room/MembersList";
import PartyInfoCard from "@/components/room/PartyInfoCard";
import AuthGuard from "@/components/auth/AuthGuard";
import { usePartyRealtime, MemberWithUser } from "@/hooks/usePartyRealtime";
import type { MessageRow } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GameInfo {
  id: string;
  name: string;
  slug: string;
  cover_url: string | null;
}

interface PartyData {
  id: string;
  title: string;
  status: "open" | "full" | "closed" | "in_progress";
  join_mode: "open" | "request" | "invite_only";
  host_id: string;
  max_members: number;
  current_members: number;
  game_id: string | null;
  game?: GameInfo | null;
  discord_voice_link?: string | null;
  host: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  member_count: number;
}

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

const PartyName = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OpenBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${theme.colors.success};
  background: rgba(34, 197, 94, 0.12);
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none;
  }
`;

const GameTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  background: ${theme.colors.primaryGlow};
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none;
  }
`;

const SlotCount = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.accent};
  white-space: nowrap;
`;

const JoinBtn = styled.button`
  padding: 8px 14px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.primary};
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const LeaveBtn = styled.button`
  padding: 8px 14px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.danger};
  color: ${theme.colors.danger};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.danger};
    color: #fff;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const RateBtn = styled.button`
  padding: 8px 14px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.accent};
  color: ${theme.colors.accent};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.accent};
    color: #fff;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  height: calc(100vh - 57px);

  @media (max-width: 768px) {
    height: calc(100vh - 52px - 57px);
  }
`;

const ChatCol = styled.div`
  flex: 1;
  min-width: 0;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Sidebar = styled.div`
  width: 260px;
  flex-shrink: 0;
  padding: 16px 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${theme.colors.textDim};
`;

const AdDiv = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: ${theme.colors.textDim};
`;

const ErrorPage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 16px;
  color: ${theme.colors.textMuted};
`;

// Skeleton styles
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonBar = styled.div<{ $w?: string; $h?: string }>`
  width: ${({ $w }) => $w ?? "100%"};
  height: ${({ $h }) => $h ?? "16px"};
  border-radius: ${theme.radii.sm};
  background: linear-gradient(
    90deg,
    ${theme.colors.bgCard} 25%,
    ${theme.colors.bgHover} 50%,
    ${theme.colors.bgCard} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s infinite;
`;

const SkeletonTopbar = styled.div`
  background: ${theme.colors.bgCard};
  border-bottom: 1px solid ${theme.colors.border};
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 57px;
`;

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonLoader() {
  return (
    <Page>
      <SkeletonTopbar>
        <SkeletonBar $w="200px" $h="18px" />
        <SkeletonBar $w="48px" $h="22px" />
        <SkeletonBar $w="48px" $h="22px" />
        <SkeletonBar $w="36px" $h="18px" />
        <SkeletonBar $w="80px" $h="34px" />
      </SkeletonTopbar>
      <Content>
        <ChatCol>
          <SkeletonBar $h="100%" />
        </ChatCol>
      </Content>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Helper: convert MessageRow → ChatMessage for display
// ---------------------------------------------------------------------------

function toDisplayMessage(
  msg: MessageRow,
  userMap: Record<string, string>,
  currentUserId: string,
): ChatMessage {
  return {
    id: msg.id,
    userId: msg.user_id,
    username: userMap[msg.user_id] ?? `User${msg.user_id.slice(0, 6)}`,
    text: msg.content,
    time: new Date(msg.created_at).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isSelf: msg.user_id === currentUserId,
  };
}

// ---------------------------------------------------------------------------
// PartyRoomContent — inner component that uses realtime hook
// ---------------------------------------------------------------------------

interface RoomContentProps {
  party: PartyData;
  initialMessages: MessageRow[];
  initialMembers: MemberWithUser[];
  currentUserId: string;
  currentUserName: string;
}

function PartyRoomContent({
  party,
  initialMessages,
  initialMembers,
  currentUserId,
  currentUserName,
}: RoomContentProps) {
  const router = useRouter();

  const { members, messages } = usePartyRealtime(
    party.id,
    initialMembers,
    initialMessages,
  );

  // Build userMap from live members + current user
  const userMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      if (m.user) {
        map[m.user_id] = m.user.display_name ?? m.user.username;
      }
    }
    if (currentUserId && currentUserName) {
      map[currentUserId] = currentUserName;
    }
    return map;
  }, [members, currentUserId, currentUserName]);

  // Convert MessageRow[] → ChatMessage[] for display
  const displayMessages = useMemo<ChatMessage[]>(() => {
    return messages.map((msg) => toDisplayMessage(msg, userMap, currentUserId));
  }, [messages, userMap, currentUserId]);

  // Convert MemberWithUser[] → Member[] for MembersList
  const displayMembers = useMemo<Member[]>(() => {
    return members.map((m) => ({
      id: m.user_id,
      username: m.user?.display_name ?? m.user?.username ?? `User${m.user_id.slice(0, 6)}`,
      isLeader: m.role === "host" || m.user_id === party.host_id,
      isOnline: party.status === "open" || party.status === "in_progress",
      rating: m.average_rating ?? 0,
      isSelf: m.user_id === currentUserId,
    }));
  }, [members, party.host_id, currentUserId, party.status]);

  // Send message via API (Realtime INSERT will pick it up automatically)
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !currentUserId) return;
      const res = await fetch(`/api/parties/${party.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        toast.error(json.error === "content_too_long" ? "ข้อความยาวเกินไป" : "ส่งข้อความไม่สำเร็จ");
      }
    },
    [party.id, currentUserId],
  );

  // Join party
  const handleJoin = useCallback(async () => {
    const res = await fetch(`/api/parties/${party.id}/join`, { method: "POST" });
    const json = await res.json() as { status?: string; error?: string };
    if (res.ok) {
      if (json.status === "joined") toast.success("เข้าร่วม Party แล้ว! 🎮");
      else if (json.status === "pending") toast.success("ส่งคำขอแล้ว รอ Host อนุมัติ");
    } else {
      const errMap: Record<string, string> = {
        party_full: "Party เต็มแล้ว",
        already_member: "คุณอยู่ใน Party นี้แล้ว",
        invite_only: "Party นี้เปิดเฉพาะ Invite เท่านั้น",
        host_cannot_join: "Host ไม่สามารถ join ได้",
        request_pending: "คุณส่งคำขอแล้ว รอ Host อนุมัติ",
      };
      toast.error(errMap[json.error ?? ""] ?? "เข้าร่วมไม่สำเร็จ");
    }
  }, [party.id]);

  // Leave party
  const handleLeave = useCallback(async () => {
    const res = await fetch(`/api/parties/${party.id}/leave`, { method: "POST" });
    if (res.ok) {
      toast.success("ออกจาก Party แล้ว");
      router.push("/parties");
    } else {
      toast.error("ออกจาก Party ไม่สำเร็จ");
    }
  }, [party.id, router]);

  const isMember = members.some((m) => m.user_id === currentUserId && m.status === "approved");
  const isHost = party.host_id === currentUserId;
  const gameName = party.game?.name ?? party.game_id?.slice(0, 8) ?? "Unknown";
  const memberCount = party.member_count;

  return (
    <Page>
      <Topbar>
        <PartyName>{party.title}</PartyName>
        {party.status === "open" && <OpenBadge>OPEN</OpenBadge>}
        <GameTag>{gameName.toUpperCase()}</GameTag>
        <SlotCount>{memberCount}/{party.max_members}</SlotCount>
        {!isMember && !isHost && party.status === "open" && (
          <JoinBtn onClick={handleJoin}>🎮 เข้าร่วม</JoinBtn>
        )}
        {isMember && (
          <RateBtn onClick={() => router.push(`/reviews?partyId=${party.id}`)}>
            ⭐ ให้คะแนน
          </RateBtn>
        )}
        {!isHost && isMember && (
          <LeaveBtn onClick={handleLeave}>🚪 ออก Party</LeaveBtn>
        )}
      </Topbar>

      <Content>
        <ChatCol>
          <ChatArea
            messages={displayMessages}
            onSendMessage={handleSendMessage}
            currentUserId={currentUserId}
            discordLink={party.discord_voice_link ?? undefined}
          />
        </ChatCol>

        <Sidebar>
          <SideSection>
            <SectionTitle>ข้อมูล Party</SectionTitle>
            <PartyInfoCard
              game={gameName}
              joinMode={party.join_mode}
              current={memberCount}
              max={party.max_members}
            />
          </SideSection>

          <SideSection>
            <SectionTitle>สมาชิก ({displayMembers.length}/{party.max_members})</SectionTitle>
            <MembersList members={displayMembers} maxMembers={party.max_members} partyStatus={party.status} />
          </SideSection>

          <AdDiv>📢 พื้นที่โฆษณา</AdDiv>
        </Sidebar>
      </Content>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// PartyRoomPage — outer component: fetches initial data, shows skeleton
// ---------------------------------------------------------------------------

function getDevUserIdFromCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(^| )dev-user-id=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : "";
}

export default function PartyRoomPage() {
  const params = useParams();
  const partyId = params.id as string;
  const { data: session } = useSession();
  const currentUserName = session?.user?.name ?? "";

  const [currentUserId, setCurrentUserId] = useState("");
  useEffect(() => {
    const devId = process.env.NODE_ENV === "development" ? getDevUserIdFromCookie() : "";
    setCurrentUserId(devId || session?.user?.id || "");
  }, [session]);

  const [party, setParty] = useState<PartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<MessageRow[]>([]);
  const [initialMembers, setInitialMembers] = useState<MemberWithUser[]>([]);

  useEffect(() => {
    if (!partyId) return;

    async function fetchAll() {
      try {
        const [partyRes, messagesRes, membersRes] = await Promise.all([
          fetch(`/api/parties/${partyId}`),
          fetch(`/api/parties/${partyId}/messages`),
          fetch(`/api/parties/${partyId}/members`),
        ]);

        if (!partyRes.ok) {
          setError("ไม่พบ Party นี้");
          setLoading(false);
          return;
        }

        const { data: partyData } = await partyRes.json() as { data: PartyData };
        setParty(partyData);

        if (messagesRes.ok) {
          const { messages: msgs } = await messagesRes.json() as { messages: MessageRow[] };
          setInitialMessages(msgs ?? []);
        }

        if (membersRes.ok) {
          const { members: mems } = await membersRes.json() as { members: MemberWithUser[] };
          setInitialMembers(mems ?? []);
        }
      } catch (err) {
        console.error("[PartyRoomPage] fetchAll:", err);
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    }

    void fetchAll();
  }, [partyId]);

  if (loading) {
    return (
      <AuthGuard>
        <SkeletonLoader />
      </AuthGuard>
    );
  }

  if (error || !party) {
    return (
      <AuthGuard>
        <ErrorPage>{error ?? "ไม่พบ Party"}</ErrorPage>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PartyRoomContent
        party={party}
        initialMessages={initialMessages}
        initialMembers={initialMembers}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </AuthGuard>
  );
}
