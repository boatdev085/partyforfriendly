"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import { theme } from "@/styles/theme";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import GamesList, { GameEntry } from "@/components/profile/GamesList";
import RatingOverview from "@/components/profile/RatingOverview";
import PartyHistory, { PartyHistoryEntry } from "@/components/profile/PartyHistory";
import AuthGuard from "@/components/auth/AuthGuard";

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg};
  font-family: ${theme.fonts.sans};
  padding: 32px 16px 48px;

  @media (max-width: 768px) {
    padding: 20px 12px 40px;
  }
`;

const Inner = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const SkeletonBlock = styled.div<{ $h?: string }>`
  height: ${({ $h }) => $h ?? "120px"};
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const NotFound = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${theme.colors.textMuted};
  font-size: 16px;
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserData {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  average_rating: number | null;
  party_count: number;
}

interface GameProfileData {
  id: string;
  game_id: string;
  in_game_name: string | null;
  rank: string | null;
  role: string | null;
  game: { id: string; name: string; slug: string; cover_url: string | null } | null;
}

interface PartyHistoryData {
  joined_at: string;
  party: {
    id: string;
    title: string;
    max_members: number;
    current_members: number;
    status: string;
    game: { name: string } | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันก่อน`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ก่อน`;
  return `${Math.floor(days / 30)} เดือนก่อน`;
}

function gameIcon(name?: string | null): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("rov") || n.includes("arena")) return "⚔️";
  if (n.includes("valorant")) return "🔫";
  if (n.includes("pubg")) return "🪖";
  if (n.includes("genshin")) return "🌸";
  if (n.includes("minecraft")) return "⛏️";
  return "🎮";
}

function toGameEntries(profiles: GameProfileData[]): GameEntry[] {
  return profiles.map((p) => ({
    id: p.id,
    icon: gameIcon(p.game?.name),
    name: p.game?.name ?? "Unknown",
    inGameUsername: p.in_game_name ?? "-",
    server: "SEA",
    rank: p.rank ?? "-",
  }));
}

function toPartyHistory(items: PartyHistoryData[]): PartyHistoryEntry[] {
  return items
    .filter((item) => item.party !== null)
    .map((item) => ({
      id: item.party!.id,
      icon: gameIcon(item.party!.game?.name),
      name: item.party!.title,
      relativeDate: relativeDate(item.joined_at),
      memberCount: `${item.party!.current_members}/${item.party!.max_members}`,
    }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();

  const profileId = params?.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [gameProfiles, setGameProfiles] = useState<GameProfileData[]>([]);
  const [partyHistory, setPartyHistory] = useState<PartyHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!profileId) return;

    setLoading(true);
    setNotFound(false);

    Promise.all([
      fetch(`/api/users/${profileId}`).then((r) => r.json()),
      fetch(`/api/users/${profileId}/game-profiles`).then((r) => r.json()),
      fetch(`/api/users/${profileId}/party-history`).then((r) => r.json()),
    ])
      .then(([userRes, gpRes, phRes]) => {
        if (userRes.error === "user_not_found") {
          setNotFound(true);
          return;
        }
        setUser(userRes.data ?? null);
        setGameProfiles(gpRes.data ?? []);
        setPartyHistory(phRes.data ?? []);
      })
      .catch((err) => {
        console.error("[ProfilePage] fetch error", err);
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  // isSelf: compare profileId with the logged-in user's Supabase UUID
  const sessionUserId = (session?.user as { id?: string })?.id;
  const isSelf = !!sessionUserId && sessionUserId === profileId;

  const displayName =
    user?.display_name ?? user?.username ?? "Unknown Player";

  const ratingAvg = user?.average_rating ?? 0;
  const ratingDist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percent: stars === Math.round(ratingAvg) ? 80 : stars === Math.round(ratingAvg) - 1 ? 15 : 5,
  }));

  if (loading) {
    return (
      <AuthGuard>
        <PageWrapper>
          <Inner>
            <SkeletonBlock $h="180px" />
            <SkeletonBlock $h="100px" />
            <SkeletonBlock $h="160px" />
            <SkeletonBlock $h="200px" />
          </Inner>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (notFound) {
    return (
      <AuthGuard>
        <PageWrapper>
          <NotFound>ไม่พบผู้ใช้งานนี้ 😕</NotFound>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageWrapper>
        <Inner>
          <ProfileHeader
            username={displayName}
            bio={isSelf ? "โปรไฟล์ของคุณ" : `@${user?.username ?? ""}`}
            isSelf={isSelf}
          />
          <StatsRow
            parties={user?.party_count ?? 0}
            rating={ratingAvg}
            kicks={0}
            completion={user?.party_count ? 89 : 0}
          />
          <GamesList
            games={toGameEntries(gameProfiles)}
            isSelf={isSelf}
          />
          <RatingOverview
            score={ratingAvg}
            totalReviews={user?.party_count ?? 0}
            distribution={ratingDist}
          />
          <PartyHistory entries={toPartyHistory(partyHistory)} />
        </Inner>
      </PageWrapper>
    </AuthGuard>
  );
}
