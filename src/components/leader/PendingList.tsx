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

const EmptyText = styled.div`
  font-size: 13px;
  color: ${theme.colors.textDim};
  text-align: center;
  padding: 12px 0;
`;

const PendingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: 480px) {
    flex-wrap: wrap;
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

const PendingInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const SubInfo = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  margin-top: 2px;
`;

const TimeAgo = styled.span`
  font-size: 11px;
  color: ${theme.colors.textDim};
  white-space: nowrap;
  flex-shrink: 0;
`;

const ActionBtns = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const ApproveBtn = styled.button`
  padding: 6px 10px;
  border-radius: ${theme.radii.sm};
  background: transparent;
  border: 1px solid ${theme.colors.success};
  color: ${theme.colors.success};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.success};
    color: #fff;
  }
`;

const RejectBtn = styled.button`
  padding: 6px 10px;
  border-radius: ${theme.radii.sm};
  background: transparent;
  border: 1px solid ${theme.colors.danger};
  color: ${theme.colors.danger};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.danger};
    color: #fff;
  }
`;

export interface PendingItem {
  id: string;
  username: string;
  rating: number;
  partyCount: number;
  timeAgo: string;
}

interface PendingListProps {
  initialPending: PendingItem[];
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
}

export default function PendingList({ initialPending, onApprove, onReject }: PendingListProps) {
  const [pending, setPending] = useState<PendingItem[]>(initialPending);
  const [busy, setBusy] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setBusy(id);
    try {
      await onApprove?.(id);
    } finally {
      setBusy(null);
    }
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReject = async (id: string) => {
    setBusy(id);
    try {
      await onReject?.(id);
    } finally {
      setBusy(null);
    }
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Card>
      <SectionTitle>⏳ รอ Approve ({pending.length})</SectionTitle>

      {pending.length === 0 ? (
        <EmptyText>ไม่มีรายการรอ Approve</EmptyText>
      ) : (
        pending.map((p) => (
          <PendingRow key={p.id}>
            <Avatar $color={getAvatarColor(p.id)}>
              {getInitials(p.username)}
            </Avatar>

            <PendingInfo>
              <Username>{p.username}</Username>
              <SubInfo>
                ⭐ {p.rating.toFixed(1)} &nbsp;·&nbsp; {p.partyCount} parties
              </SubInfo>
            </PendingInfo>

            <TimeAgo>{p.timeAgo}</TimeAgo>

            <ActionBtns>
              <ApproveBtn
                onClick={() => handleApprove(p.id)}
                disabled={busy === p.id}
              >
                ✅ Approve
              </ApproveBtn>
              <RejectBtn
                onClick={() => handleReject(p.id)}
                disabled={busy === p.id}
              >
                ❌ Reject
              </RejectBtn>
            </ActionBtns>
          </PendingRow>
        ))
      )}
    </Card>
  );
}
