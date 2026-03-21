"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import { theme } from "@/styles/theme";
import { Users, Globe, Crown } from "lucide-react";
import type { Party } from "@/types";

interface Props {
  party: Party;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div`
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

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
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

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
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

const PendingBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.warning};
  background: rgba(245, 158, 11, 0.15);
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
  margin-bottom: 12px;
`;

const TagRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const Tag = styled.span`
  font-size: 11px;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.bgHover};
  border: 1px solid ${theme.colors.border};
  padding: 2px 8px;
  border-radius: ${theme.radii.full};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
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

const HostLine = styled.div`
  font-size: 12px;
  color: ${theme.colors.textDim};
  margin-bottom: 12px;
`;

const ActionBtn = styled.button<{ $variant: "green" | "purple" | "gray" }>`
  width: 100%;
  padding: 10px;
  border-radius: ${theme.radii.md};
  font-size: 13px;
  font-weight: 700;
  cursor: ${({ $variant }) => ($variant === "gray" ? "not-allowed" : "pointer")};
  transition: all 0.15s;
  border: ${({ $variant }) =>
    $variant === "green"
      ? "none"
      : $variant === "purple"
      ? `1px solid ${theme.colors.primary}`
      : `1px solid ${theme.colors.border}`};
  background: ${({ $variant }) =>
    $variant === "green" ? theme.colors.success : "transparent"};
  color: ${({ $variant }) =>
    $variant === "green"
      ? "#fff"
      : $variant === "purple"
      ? theme.colors.primary
      : theme.colors.textMuted};
  opacity: ${({ $variant }) => ($variant === "gray" ? 0.6 : 1)};

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const InlineFeedback = styled.div<{ $type: "success" | "info" | "error" }>`
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: ${theme.radii.sm};
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.2s ease;
  background: ${({ $type }) =>
    $type === "success"
      ? "rgba(34,197,94,0.12)"
      : $type === "info"
      ? "rgba(124,106,255,0.12)"
      : "rgba(239,68,68,0.12)"};
  color: ${({ $type }) =>
    $type === "success"
      ? theme.colors.success
      : $type === "info"
      ? theme.colors.primary
      : theme.colors.danger};
  border: 1px solid
    ${({ $type }) =>
      $type === "success"
        ? "rgba(34,197,94,0.25)"
        : $type === "info"
        ? theme.colors.primaryGlow
        : "rgba(239,68,68,0.25)"};
`;

const langLabel: Record<string, string> = {
  th: "ไทย",
  en: "EN",
  both: "ไทย/EN",
};

type JoinState = "idle" | "joining" | "joined" | "requested" | "error";

export default function PartyCard({ party }: Props) {
  const router = useRouter();
  const isFull = party.current_members >= party.max_members || party.status === "full";
  const effectiveStatus = isFull ? "full" : party.status;
  const hasPending = (party.pending_count ?? 0) > 0 && party.join_mode === "approve";

  const [joinState, setJoinState] = useState<JoinState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleJoin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (joinState === "joining") return;

    setJoinState("joining");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/parties/${party.id}/join`, { method: "POST" });
      const json = await res.json();

      if (res.ok) {
        if (json.status === "joined") {
          setJoinState("joined");
          setTimeout(() => router.push(`/parties/${party.id}`), 800);
        } else if (json.status === "pending") {
          setJoinState("requested");
        } else {
          setJoinState("joined");
          setTimeout(() => router.push(`/parties/${party.id}`), 800);
        }
      } else {
        const msg =
          json.error === "party_full"
            ? "ปาร์ตี้เต็มแล้ว"
            : json.error === "already_member"
            ? "คุณเป็นสมาชิกอยู่แล้ว"
            : json.error === "request_pending"
            ? "คำขอรอการอนุมัติอยู่แล้ว"
            : json.error === "host_cannot_join"
            ? "คุณเป็นเจ้าของปาร์ตี้นี้"
            : "เกิดข้อผิดพลาด กรุณาลองใหม่";
        setErrorMsg(msg);
        setJoinState("error");
      }
    } catch {
      setErrorMsg("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setJoinState("error");
    }
  }

  let actionBtn: React.ReactNode = null;
  if (effectiveStatus === "full") {
    actionBtn = (
      <ActionBtn $variant="gray" disabled>
        เต็มแล้ว
      </ActionBtn>
    );
  } else if (effectiveStatus === "open" && party.join_mode === "auto") {
    actionBtn = (
      <ActionBtn
        $variant="green"
        onClick={handleJoin}
        disabled={joinState === "joining" || joinState === "joined"}
      >
        {joinState === "joining" ? "กำลังเข้าร่วม…" : "⚡ เข้าร่วม"}
      </ActionBtn>
    );
  } else if (effectiveStatus === "open" && party.join_mode === "approve") {
    actionBtn = (
      <ActionBtn
        $variant="purple"
        onClick={handleJoin}
        disabled={joinState === "joining" || joinState === "requested"}
      >
        {joinState === "joining" ? "กำลังส่งคำขอ…" : "📨 ขอเข้าร่วม"}
      </ActionBtn>
    );
  }

  const feedback =
    joinState === "joined" ? (
      <InlineFeedback $type="success">เข้าร่วมสำเร็จ! กำลังพาไปห้อง…</InlineFeedback>
    ) : joinState === "requested" ? (
      <InlineFeedback $type="info">ส่งคำขอแล้ว รอการอนุมัติจากเจ้าของ</InlineFeedback>
    ) : joinState === "error" ? (
      <InlineFeedback $type="error">{errorMsg}</InlineFeedback>
    ) : null;

  return (
    <Card>
      <CardLink href={`/parties/${party.id}`}>
        <Top>
          <GameTag>{party.game_name ?? party.game}</GameTag>
          <BadgeRow>
            {hasPending && (
              <PendingBadge>⏳ {party.pending_count} pending</PendingBadge>
            )}
            <StatusBadge $status={effectiveStatus}>
              {effectiveStatus === "open"
                ? "เปิดรับ"
                : effectiveStatus === "full"
                ? "เต็มแล้ว"
                : "ปิด"}
            </StatusBadge>
          </BadgeRow>
        </Top>

        <Title>{party.title}</Title>

        {party.description && <Description>{party.description}</Description>}

        {party.tags && party.tags.length > 0 && (
          <TagRow>
            {party.tags.map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </TagRow>
        )}

        <MetaRow>
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

          <MetaItem>
            {party.join_mode === "auto" ? "🔓 Auto" : "🔒 Approve"}
          </MetaItem>

          {party.discord_voice_link && (
            <MetaItem style={{ color: "#5865f2" }}>🎙 Discord</MetaItem>
          )}
        </MetaRow>

        {party.host_name && (
          <HostLine>โดย {party.host_name}</HostLine>
        )}
      </CardLink>

      {actionBtn}
      {feedback}
    </Card>
  );
}
