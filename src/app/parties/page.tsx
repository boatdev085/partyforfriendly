"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import type { Party } from "@/types";
import PartyCard from "@/components/party/PartyCard";
import FilterBar from "@/components/parties/FilterBar";
import SponsoredBanner from "@/components/parties/SponsoredBanner";
import { MOCK_PARTIES } from "@/lib/mock-data";

const Page = styled.main`
  min-height: 100vh;
  background: ${theme.colors.bg};
  padding: 32px 24px 64px;

  @media (max-width: 768px) {
    padding: 20px 16px 48px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 4px;
`;

const PageSub = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
`;

const StatusBar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const StatChip = styled.div<{ $color: string }>`
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: ${theme.radii.full};
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.textMuted};
  font-size: 15px;
`;

export default function PartiesPage() {
  const [filtered, setFiltered] = useState<Party[]>(MOCK_PARTIES);

  const openCount = MOCK_PARTIES.filter(
    (p) => p.status === "open" && p.current_members < p.max_members
  ).length;
  const pendingCount = MOCK_PARTIES.filter(
    (p) => p.join_mode === "approve" && (p.pending_count ?? 0) > 0
  ).length;
  const fullCount = MOCK_PARTIES.filter(
    (p) => p.status === "full" || p.current_members >= p.max_members
  ).length;

  return (
    <Page>
      <Container>
        <PageHeader>
          <PageTitle>🎮 Party List</PageTitle>
          <PageSub>ค้นหาปาร์ตี้เกมที่ใช่สำหรับคุณ</PageSub>
        </PageHeader>

        <SponsoredBanner />

        <FilterBar parties={MOCK_PARTIES} onFilter={setFiltered} />

        <StatusBar>
          <StatChip $color={theme.colors.success}>{openCount} OPEN</StatChip>
          <StatChip $color={theme.colors.warning}>{pendingCount} PENDING</StatChip>
          <StatChip $color={theme.colors.full}>{fullCount} FULL</StatChip>
          <StatChip $color={theme.colors.accent}>148 Online</StatChip>
        </StatusBar>

        <Grid>
          {filtered.length === 0 ? (
            <Empty>ไม่พบปาร์ตี้ที่ตรงกับตัวกรอง</Empty>
          ) : (
            filtered.map((party) => <PartyCard key={party.id} party={party} />)
          )}
        </Grid>
      </Container>
    </Page>
  );
}
