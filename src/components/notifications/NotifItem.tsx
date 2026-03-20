"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";
import { useRouter } from "next/navigation";

export type NotifType =
  | "join_request"
  | "waitlist_open"
  | "rated"
  | "approved"
  | "party_full"
  | "badge_earned";

export interface Notif {
  id: string;
  type: NotifType;
  username?: string;
  game?: string;
  score?: number;
  timeAgo: string;
  isNew: boolean;
}

interface Props {
  notif: Notif;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const Row = styled.div<{ $isNew: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid ${theme.colors.border};
  background: ${({ $isNew }) =>
    $isNew ? "rgba(124,106,255,0.06)" : "transparent"};
  border-radius: 8px;
  padding: 12px;
  &:last-child { border-bottom: none; }
`;

const IconCircle = styled.div<{ color?: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ color }) => color || theme.colors.bgHover};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Text = styled.div`
  font-size: 13px;
  color: ${theme.colors.text};
  line-height: 1.5;
  margin-bottom: 4px;

  strong { color: ${theme.colors.primary}; }
`;

const Sub = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;

const Time = styled.span`
  font-size: 11px;
  color: ${theme.colors.textDim};
  white-space: nowrap;
  flex-shrink: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const Btn = styled.button<{ $variant: "green" | "red" | "primary" }>`
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  font-family: inherit;
  transition: opacity 0.15s;
  &:hover { opacity: 0.8; }

  ${({ $variant }) =>
    $variant === "green"
      ? `background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.3); color: ${theme.colors.success};`
      : $variant === "red"
      ? `background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); color: ${theme.colors.danger};`
      : `background: rgba(124,106,255,0.12); border-color: rgba(124,106,255,0.3); color: ${theme.colors.primary};`}
`;

const Stars = ({ score }: { score: number }) => (
  <span style={{ color: theme.colors.warning }}>
    {"⭐".repeat(score)}
  </span>
);

export default function NotifItem({ notif, onApprove, onReject }: Props) {
  const router = useRouter();

  const renderContent = () => {
    switch (notif.type) {
      case "join_request":
        return (
          <>
            <Avatar>{notif.username?.[0]?.toUpperCase() ?? "?"}</Avatar>
            <Content>
              <Text>
                <strong>{notif.username}</strong> ขอ join party · {notif.game}
              </Text>
              <Actions>
                <Btn $variant="green" onClick={() => onApprove?.(notif.id)}>✅ Approve</Btn>
                <Btn $variant="red" onClick={() => onReject?.(notif.id)}>❌ Reject</Btn>
              </Actions>
            </Content>
          </>
        );
      case "waitlist_open":
        return (
          <>
            <IconCircle color="rgba(124,106,255,0.15)">🔔</IconCircle>
            <Content>
              <Text>Party Waitlist เปิดแล้ว! · {notif.game}</Text>
              <Sub>มีที่ว่าง 1 คน</Sub>
              <Actions>
                <Btn $variant="primary" onClick={() => router.push("/parties")}>⚡ Join ตอนนี้</Btn>
              </Actions>
            </Content>
          </>
        );
      case "rated":
        return (
          <>
            <Avatar>{notif.username?.[0]?.toUpperCase() ?? "?"}</Avatar>
            <Content>
              <Text>
                <strong>{notif.username}</strong> ให้คะแนน{" "}
                <Stars score={notif.score ?? 5} />
              </Text>
            </Content>
          </>
        );
      case "approved":
        return (
          <>
            <IconCircle color="rgba(34,197,94,0.15)">✅</IconCircle>
            <Content>
              <Text>Request ของคุณถูก Approve แล้ว · {notif.game}</Text>
            </Content>
          </>
        );
      case "party_full":
        return (
          <>
            <IconCircle color="rgba(124,106,255,0.15)">🎉</IconCircle>
            <Content>
              <Text>Party เต็มแล้ว! ไป Discord ได้เลย</Text>
            </Content>
          </>
        );
      case "badge_earned":
        return (
          <>
            <IconCircle color="rgba(254,231,92,0.15)">🏆</IconCircle>
            <Content>
              <Text>ได้รับ Badge ใหม่: ⚡ Active Player</Text>
              <Sub>เล่น 10 party ใน 30 วัน</Sub>
            </Content>
          </>
        );
    }
  };

  return (
    <Row $isNew={notif.isNew}>
      {renderContent()}
      <Time>{notif.timeAgo}</Time>
    </Row>
  );
}
