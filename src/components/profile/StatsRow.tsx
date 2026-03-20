"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

interface Stat {
  value: string;
  label: string;
  color: string;
}

interface Props {
  parties: number;
  rating: number;
  kicks: number;
  completion: number;
}

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  flex: 1;
  min-width: 120px;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
`;

const Value = styled.span<{ $color: string }>`
  font-size: 22px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  line-height: 1.1;
`;

const Label = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;

export default function StatsRow({ parties, rating, kicks, completion }: Props) {
  const stats: Stat[] = [
    { value: String(parties), label: "Parties", color: theme.colors.primary },
    { value: `${rating} ⭐`, label: "Rating", color: "#f59e0b" },
    { value: String(kicks), label: "ถูก Kick", color: theme.colors.success },
    { value: `${completion}%`, label: "Completion", color: theme.colors.accent },
  ];

  return (
    <Row>
      {stats.map((s) => (
        <Card key={s.label}>
          <Value $color={s.color}>{s.value}</Value>
          <Label>{s.label}</Label>
        </Card>
      ))}
    </Row>
  );
}
