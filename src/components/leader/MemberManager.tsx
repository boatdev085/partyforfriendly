"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";

const AVATAR_COLORS = [
  "#7c6aff",
  "#00d4aa",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#ec4899",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Avatar = styled.div<{ $color: string }>`
  width: 38px;
  height: 38px;
  border-radius: ${theme.radii.full};
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Username = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const LeaderBadge = styled.span`
  font-size: 13px;
`;

const SubInfo = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  margin-top: 2px;
`;

const KickBtn = styled.button`
  padding: 6px 12px;
  border-radius: ${theme.radii.sm};
  background: transparent;
  border: 1px solid ${theme.colors.danger};
  color: ${theme.colors.danger};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.danger};
    color: #fff;
  }
`;

export interface MemberItem {
  id: string;
  username: string;
  isLeader: boolean;
  isSelf?: boolean;
  rating: number;
  partyCount: number;
}

interface MemberManagerProps {
  initialMembers: MemberItem[];
}

export default function MemberManager({ initialMembers }: MemberManagerProps) {
  const [members, setMembers] = useState<MemberItem[]>(initialMembers);

  const handleKick = (id: string, username: string) => {
    if (window.confirm(`Kick ${username} ออกจาก Party?`)) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <Card>
      <SectionTitle>สมาชิก ({members.length})</SectionTitle>

      {members.map((m) => (
        <MemberRow key={m.id}>
          <Avatar $color={getAvatarColor(m.id)}>{getInitials(m.username)}</Avatar>

          <MemberInfo>
            <NameRow>
              <Username>{m.username}</Username>
              {m.isLeader && <LeaderBadge>👑</LeaderBadge>}
            </NameRow>
            <SubInfo>
              ⭐ {m.rating.toFixed(1)} &nbsp;·&nbsp; {m.partyCount} parties
            </SubInfo>
          </MemberInfo>

          {!m.isLeader && !m.isSelf && (
            <KickBtn onClick={() => handleKick(m.id, m.username)}>
              Kick
            </KickBtn>
          )}
        </MemberRow>
      ))}
    </Card>
  );
}
