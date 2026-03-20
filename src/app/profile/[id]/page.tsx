"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import GamesList, { GameEntry } from "@/components/profile/GamesList";
import RatingOverview from "@/components/profile/RatingOverview";
import PartyHistory, { PartyHistoryEntry } from "@/components/profile/PartyHistory";
import AuthGuard from "@/components/auth/AuthGuard";

const MOCK_USER = {
  id: "u1",
  bio: "เล่นเกมเพื่อความสนุก ไม่ toxic 🎮",
};

const MOCK_GAMES: GameEntry[] = [
  {
    id: "g1",
    icon: "⚔️",
    name: "ROV",
    inGameUsername: "SomchaiROV99",
    server: "TH",
    rank: "Diamond III",
  },
  {
    id: "g2",
    icon: "🔫",
    name: "Valorant",
    inGameUsername: "Player#TH01",
    server: "SEA",
    rank: "Plat II",
  },
];

const MOCK_RATING_DIST = [
  { stars: 5, percent: 80 },
  { stars: 4, percent: 15 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 0 },
];

const MOCK_PARTY_HISTORY: PartyHistoryEntry[] = [
  {
    id: "p1",
    icon: "⚔️",
    name: "ROV Diamond",
    relativeDate: "เมื่อวาน",
    memberCount: "5/5",
  },
  {
    id: "p2",
    icon: "🔫",
    name: "Valorant Ranked",
    relativeDate: "2 วันก่อน",
    memberCount: "5/5",
  },
];

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

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();

  // Determine if this is the current user's own profile.
  // "1" is the mock ID for the logged-in user until real user IDs are connected.
  const profileId = params?.id as string;
  const isSelf = profileId === "1";

  const displayName = isSelf
    ? (session?.user as any)?.discordUsername ?? session?.user?.name ?? "PlayerOne_TH"
    : "PlayerOne_TH";

  return (
    <AuthGuard>
    <PageWrapper>
      <Inner>
        <ProfileHeader
          username={displayName}
          bio={MOCK_USER.bio}
          isSelf={isSelf}
        />
        <StatsRow
          parties={127}
          rating={4.8}
          kicks={0}
          completion={89}
        />
        <GamesList
          games={MOCK_GAMES}
          isSelf={isSelf}
        />
        <RatingOverview
          score={4.8}
          totalReviews={127}
          distribution={MOCK_RATING_DIST}
        />
        <PartyHistory entries={MOCK_PARTY_HISTORY} />
      </Inner>
    </PageWrapper>
    </AuthGuard>
  );
}
