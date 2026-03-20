"use client";

import Link from "next/link";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Users, Globe, Crown } from "lucide-react";
import type { Party } from "@/types";

interface Props {
  party: Party & { game_name?: string; host_name?: string };
}

const Card = styled(Link)`
  display: block;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px;
  transition: all 0.2s;
  box-shadow: ${theme.shadows.card};

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.glow};
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const GameTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  background: ${theme.colors.primaryGlow};
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  color: ${({ $status }) =>
    $status === "open"
      ? theme.colors.success
      : $status === "full"
      ? theme.colors.full
      : theme.colors.textMuted};
  background: ${({ $status }) =>
    $status === "open"
      ? "rgba(34,197,94,0.12)"
      : $status === "full"
      ? "rgba(249,115,22,0.12)"
      : theme.colors.bgHover};
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.text};
  line-height: 1.4;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 13px;
  color: ${theme.colors.textMuted};
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${theme.colors.textMuted};

  svg {
    flex-shrink: 0;
  }
`;

const Slots = styled.span<{ $isFull: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $isFull }) => ($isFull ? theme.colors.full : theme.colors.accent)};
`;

const langLabel: Record<string, string> = {
  th: "ไทย",
  en: "EN",
  both: "ไทย/EN",
};

export default function PartyCard({ party }: Props) {
  const isFull = party.current_members >= party.max_members;

  return (
    <Card href={`/parties/${party.id}`}>
      <Top>
        <GameTag>{party.game_name ?? party.game}</GameTag>
        <StatusBadge $status={isFull ? "full" : party.status}>
          {isFull ? "เต็มแล้ว" : party.status === "open" ? "เปิดรับ" : "ปิด"}
        </StatusBadge>
      </Top>

      <Title>{party.title}</Title>

      {party.description && <Description>{party.description}</Description>}

      <Footer>
        <Meta>
          <MetaItem>
            <Users size={12} />
            <Slots $isFull={isFull}>
              {party.current_members}/{party.max_members}
            </Slots>
          </MetaItem>

          <MetaItem>
            <Globe size={12} />
            {langLabel[party.language]}
          </MetaItem>

          {party.required_rank && (
            <MetaItem>
              <Crown size={12} />
              {party.required_rank}
            </MetaItem>
          )}
        </Meta>

        {party.host_name && (
          <MetaItem>
            โดย {party.host_name}
          </MetaItem>
        )}
      </Footer>
    </Card>
  );
}
