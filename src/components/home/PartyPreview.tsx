"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { theme } from "@/styles/theme";
import { ArrowRight, TrendingUp } from "lucide-react";
import PartyCard from "@/components/party/PartyCard";
import type { Party } from "@/types";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;

  @media (max-width: 768px) {
    padding: 0 16px 60px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.primaryGlow};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
`;

const ViewAll = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.primary};
  transition: gap 0.15s;

  &:hover {
    gap: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SkeletonCard = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonLine = styled.div<{ $width?: string; $height?: string }>`
  background: ${theme.colors.bgHover};
  border-radius: ${theme.radii.sm};
  height: ${({ $height }) => $height ?? "12px"};
  width: ${({ $width }) => $width ?? "100%"};
  margin-bottom: 10px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 24px;
  color: ${theme.colors.textMuted};
  font-size: 15px;
`;

function LoadingSkeleton() {
  return (
    <SkeletonCard>
      <SkeletonLine $width="40%" $height="14px" />
      <SkeletonLine $width="80%" $height="16px" />
      <SkeletonLine $width="100%" />
      <SkeletonLine $width="70%" />
      <SkeletonLine $width="50%" $height="14px" />
    </SkeletonCard>
  );
}

export default function PartyPreview() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/parties?status=open")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((json) => {
        const data: Party[] = Array.isArray(json.data) ? json.data.slice(0, 4) : [];
        setParties(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <Section>
      <Header>
        <TitleGroup>
          <IconWrap>
            <TrendingUp size={16} />
          </IconWrap>
          <SectionTitle>ปาร์ตี้ที่กำลังเปิดรับ</SectionTitle>
        </TitleGroup>
        <ViewAll href="/parties">
          ดูทั้งหมด <ArrowRight size={14} />
        </ViewAll>
      </Header>

      <Grid>
        {loading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : error || parties.length === 0 ? (
          <EmptyState>ยังไม่มีปาร์ตี้ที่เปิดรับ</EmptyState>
        ) : (
          parties.map((party) => (
            <PartyCard key={party.id} party={party} />
          ))
        )}
      </Grid>
    </Section>
  );
}
