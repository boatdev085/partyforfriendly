"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatWidget = styled.div<{ $color: string; $glow: string }>`
  flex: 1;
  min-width: 90px;
  background: ${theme.colors.bgCard};
  border: 1px solid ${({ $color }) => $color};
  border-radius: ${theme.radii.lg};
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 0 8px ${({ $glow }) => $glow};
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 22px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  line-height: 1;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const OutlineBtn = styled.button<{ $color: string }>`
  padding: 9px 16px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${({ $color }) => $color};
    color: ${theme.colors.bg};
  }
`;

interface RealtimeStatsProps {
  memberCount: number;
  maxMembers: number;
  pendingCount: number;
  waitlistCount: number;
  onClose?: () => void;
  onDisband?: () => void;
}

export default function RealtimeStats({
  memberCount,
  maxMembers,
  pendingCount,
  waitlistCount,
  onClose,
  onDisband,
}: RealtimeStatsProps) {
  return (
    <Container>
      <StatsRow>
        <StatWidget
          $color={theme.colors.success}
          $glow="rgba(34, 197, 94, 0.15)"
        >
          <StatLabel>สมาชิก</StatLabel>
          <StatValue $color={theme.colors.success}>
            {memberCount}/{maxMembers}
          </StatValue>
        </StatWidget>

        <StatWidget
          $color={theme.colors.warning}
          $glow="rgba(245, 158, 11, 0.15)"
        >
          <StatLabel>รอ Approve</StatLabel>
          <StatValue $color={theme.colors.warning}>{pendingCount}</StatValue>
        </StatWidget>

        <StatWidget
          $color={theme.colors.primary}
          $glow={theme.colors.primaryGlow}
        >
          <StatLabel>Waitlist</StatLabel>
          <StatValue $color={theme.colors.primary}>{waitlistCount}</StatValue>
        </StatWidget>
      </StatsRow>

      <ActionRow>
        <OutlineBtn $color={theme.colors.warning} onClick={onClose}>
          🔒 ปิดชั่วคราว
        </OutlineBtn>
        <OutlineBtn $color={theme.colors.danger} onClick={onDisband}>
          ❌ ยุบ Party
        </OutlineBtn>
      </ActionRow>
    </Container>
  );
}
