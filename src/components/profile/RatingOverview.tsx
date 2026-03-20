"use client";

import Link from "next/link";
import styled from "styled-components";
import { theme } from "@/styles/theme";

interface Props {
  score: number;
  totalReviews: number;
  distribution: { stars: number; percent: number }[];
}

const Wrapper = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
`;

const ReviewCount = styled.span`
  font-size: 13px;
  color: ${theme.colors.textMuted};
`;

const ScoreLine = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 16px;
`;

const BarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StarLabel = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  width: 20px;
  text-align: right;
  flex-shrink: 0;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 8px;
  background: ${theme.colors.bgHover};
  border-radius: ${theme.radii.full};
  overflow: hidden;
`;

const BarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: #f59e0b;
  border-radius: ${theme.radii.full};
  transition: width 0.3s ease;
`;

const PercentLabel = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  width: 34px;
  flex-shrink: 0;
`;

const ReviewLink = styled(Link)`
  display: inline-block;
  font-size: 13px;
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default function RatingOverview({ score, totalReviews, distribution }: Props) {
  const stars = "⭐".repeat(Math.round(score));

  return (
    <Wrapper>
      <Header>
        <Title>⭐ Rating Overview</Title>
        <ReviewCount>จาก {totalReviews} รีวิว</ReviewCount>
      </Header>

      <ScoreLine>
        {score} {stars}
      </ScoreLine>

      <BarList>
        {distribution.map((d) => (
          <BarRow key={d.stars}>
            <StarLabel>{d.stars}★</StarLabel>
            <BarTrack>
              <BarFill $percent={d.percent} />
            </BarTrack>
            <PercentLabel>{d.percent}%</PercentLabel>
          </BarRow>
        ))}
      </BarList>

      <ReviewLink href="/reviews">ดูรีวิวทั้งหมด →</ReviewLink>
    </Wrapper>
  );
}
