"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import GamesList, { GameEntry } from "@/components/profile/GamesList";
import RatingOverview from "@/components/profile/RatingOverview";
import PartyHistory, { PartyHistoryEntry } from "@/components/profile/PartyHistory";

const MOCK_USER = {
  id: "u1",
  username: "PlayerOne_TH",
  bio: "เล่นเกมเพื่อความสนุก ไม่ toxic 🎮",
  isSelf: true,
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
`;

const Inner = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default function ProfilePage() {
  return (
    <PageWrapper>
      <Inner>
        <ProfileHeader
          username={MOCK_USER.username}
          bio={MOCK_USER.bio}
          isSelf={MOCK_USER.isSelf}
        />
        <StatsRow
          parties={127}
          rating={4.8}
          kicks={0}
          completion={89}
        />
        <GamesList
          games={MOCK_GAMES}
          isSelf={MOCK_USER.isSelf}
        />
        <RatingOverview
          score={4.8}
          totalReviews={127}
          distribution={MOCK_RATING_DIST}
        />
        <PartyHistory entries={MOCK_PARTY_HISTORY} />
      </Inner>
    </PageWrapper>
  );
}
