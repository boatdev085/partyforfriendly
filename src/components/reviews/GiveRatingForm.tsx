"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// Types & Props
// ---------------------------------------------------------------------------

export interface RatableMember {
  id: string;
  username: string;
  display_name: string | null;
  role?: "leader" | "member";
}

interface Props {
  partyId: string;
  partyTitle?: string;
  members: RatableMember[];
  onSubmitSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 24px;
  box-shadow: ${theme.shadows.card};
`;

const CardHeader = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${theme.colors.textMuted};
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.radii.full};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const Username = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoleBadge = styled.span<{ $role: "leader" | "member" }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: ${theme.radii.full};
  white-space: nowrap;
  background: ${({ $role }) =>
    $role === "leader" ? "rgba(124,106,255,0.15)" : theme.colors.bgHover};
  color: ${({ $role }) =>
    $role === "leader" ? theme.colors.primary : theme.colors.textMuted};
  border: 1px solid ${({ $role }) =>
    $role === "leader" ? `rgba(124,106,255,0.3)` : theme.colors.border};
`;

const Stars = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
`;

const StarBtn = styled.button<{ $filled: boolean }>`
  background: none;
  border: none;
  padding: 2px;
  font-size: 22px;
  line-height: 1;
  color: ${({ $filled }) => ($filled ? theme.colors.warning : theme.colors.border)};
  transition: color 0.15s, transform 0.1s;
  cursor: pointer;
  &:hover { color: ${theme.colors.warning}; transform: scale(1.15); }
`;

const Textarea = styled.textarea`
  width: 100%;
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.text};
  font-family: ${theme.fonts.sans};
  font-size: 14px;
  padding: 12px 14px;
  resize: vertical;
  min-height: 88px;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 16px;
  &::placeholder { color: ${theme.colors.textDim}; }
  &:focus { border-color: ${theme.colors.primary}; }
`;

const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${theme.radii.md};
  padding: 13px 0;
  font-size: 15px;
  font-weight: 700;
  font-family: ${theme.fonts.sans};
  cursor: ${({ $loading }) => ($loading ? "not-allowed" : "pointer")};
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  transition: background 0.2s, transform 0.1s;
  margin-bottom: 14px;
  &:hover:not(:disabled) { background: ${theme.colors.primaryHover}; transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
`;

const WarningBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: ${theme.radii.md};
  padding: 10px 14px;
  font-size: 12px;
  color: ${theme.colors.warning};
`;

const Empty = styled.div`
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: ${theme.colors.textMuted};
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function GiveRatingForm({ partyId, partyTitle, members, onSubmitSuccess }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleStar = (memberId: string, star: number) => {
    setRatings(prev => ({ ...prev, [memberId]: star }));
  };

  const handleSubmit = async () => {
    const entries = Object.entries(ratings).filter(([, v]) => v > 0);
    if (entries.length === 0) {
      toast.error("กรุณาให้คะแนนอย่างน้อย 1 คน");
      return;
    }
    setSubmitting(true);
    try {
      const results = await Promise.allSettled(
        entries.map(([revieweeId, rating]) =>
          fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviewee_id: revieweeId, party_id: partyId, rating, comment }),
          }).then(async (res) => {
            if (!res.ok) {
              const json = await res.json() as { error?: string };
              throw new Error(json.error ?? "error");
            }
          }),
        ),
      );

      const failed = results.filter(r => r.status === "rejected");
      if (failed.length > 0) {
        const first = failed[0] as PromiseRejectedResult;
        const msg = (first.reason as Error).message;
        if (msg === "cannot_review_self") toast.error("ไม่สามารถให้คะแนนตัวเองได้");
        else toast.error("บางรายการส่งไม่สำเร็จ (อาจเคยให้คะแนนแล้ว)");
      } else {
        toast.success("ส่ง Rating เรียบร้อย! ✅");
        setRatings({});
        setComment("");
        onSubmitSuccess?.();
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Title>⭐ ให้คะแนน</Title>
          {partyTitle && <Subtitle>จาก Party: {partyTitle}</Subtitle>}
        </CardHeader>
        <Empty>ไม่มีสมาชิกที่ต้องให้คะแนนในขณะนี้</Empty>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Title>⭐ ให้คะแนน</Title>
        {partyTitle && <Subtitle>จาก Party: {partyTitle}</Subtitle>}
      </CardHeader>

      <MemberList>
        {members.map(member => {
          const displayName = member.display_name ?? member.username;
          return (
            <MemberRow key={member.id}>
              <Avatar>{getInitials(displayName)}</Avatar>
              <MemberInfo>
                <Username>{displayName}</Username>
                {member.role && (
                  <RoleBadge $role={member.role}>
                    {member.role === "leader" ? "👑 Leader" : "สมาชิก"}
                  </RoleBadge>
                )}
              </MemberInfo>
              <Stars>
                {[1, 2, 3, 4, 5].map(star => (
                  <StarBtn
                    key={star}
                    $filled={(ratings[member.id] ?? 0) >= star}
                    onClick={() => handleStar(member.id, star)}
                    aria-label={`ให้ ${star} ดาว`}
                  >
                    {(ratings[member.id] ?? 0) >= star ? "★" : "☆"}
                  </StarBtn>
                ))}
              </Stars>
            </MemberRow>
          );
        })}
      </MemberList>

      <Textarea
        placeholder="เล่นดีมาก ไม่ toxic..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />

      <SubmitBtn onClick={handleSubmit} $loading={submitting} disabled={submitting}>
        {submitting ? "กำลังส่ง..." : "ส่ง Rating"}
      </SubmitBtn>

      <WarningBanner>
        <span>⚠️</span>
        <span>Rate ได้เฉพาะคนที่ join party เดียวกัน · มีเวลา 48 ชม.</span>
      </WarningBanner>
    </Card>
  );
}
