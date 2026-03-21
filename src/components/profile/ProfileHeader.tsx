"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

interface Badge {
  icon: string;
  label: string;
  color: string;
  bg: string;
}

interface Props {
  username: string;
  bio: string;
  isSelf?: boolean;
  onEdit?: () => void;
  avatarUrl?: string | null;
}

const BADGES: Badge[] = [
  { icon: "🏆", label: "Top", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  { icon: "🤝", label: "Team", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  { icon: "⚡", label: "Active", color: "#7c6aff", bg: "rgba(124,106,255,0.15)" },
  { icon: "🎮", label: "Vet", color: "#00d4aa", bg: "rgba(0,212,170,0.15)" },
];

const Wrapper = styled.div`
  position: relative;
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const EditBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 14px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${theme.radii.full};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
`;

const DisplayName = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
`;

const Bio = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
  margin: 0;
  max-width: 360px;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const BadgeChip = styled.span<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: ${theme.radii.full};
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
`;

export default function ProfileHeader({ username, bio, isSelf, onEdit, avatarUrl }: Props) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Wrapper>
      {isSelf && (
        <EditBtn onClick={onEdit}>✏️ แก้ไข</EditBtn>
      )}
      <Avatar>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          initials
        )}
      </Avatar>
      <DisplayName>{username}</DisplayName>
      <Bio>{bio}</Bio>
      <BadgeRow>
        {BADGES.map((b) => (
          <BadgeChip key={b.label} $color={b.color} $bg={b.bg}>
            {b.icon} {b.label}
          </BadgeChip>
        ))}
      </BadgeRow>
    </Wrapper>
  );
}
