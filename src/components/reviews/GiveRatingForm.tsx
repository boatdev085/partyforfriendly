"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import toast from "react-hot-toast";

interface Member {
  id: string;
  username: string;
  role: "leader" | "member";
}

const MOCK_MEMBERS: Member[] = [
  { id: "u1", username: "SomchaiXX", role: "leader" },
  { id: "u2", username: "NongMin99", role: "member" },
];

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

  &:hover {
    color: ${theme.colors.warning};
    transform: scale(1.15);
  }
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

  &::placeholder {
    color: ${theme.colors.textDim};
  }

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${theme.radii.md};
  padding: 13px 0;
  font-size: 15px;
  font-weight: 700;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  margin-bottom: 14px;

  &:hover {
    background: ${theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
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

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function GiveRatingForm() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  const handleStar = (memberId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [memberId]: star }));
  };

  const handleSubmit = () => {
    console.log("Ratings:", ratings, "Comment:", comment);
    toast.success("ส่ง Rating เรียบร้อย! ✅");
    setRatings({});
    setComment("");
  };

  return (
    <Card>
      <CardHeader>
        <Title>⭐ ให้คะแนน</Title>
        <Subtitle>จาก Party: ROV แรงค์ Diamond</Subtitle>
      </CardHeader>

      <MemberList>
        {MOCK_MEMBERS.map((member) => (
          <MemberRow key={member.id}>
            <Avatar>{getInitials(member.username)}</Avatar>
            <MemberInfo>
              <Username>{member.username}</Username>
              <RoleBadge $role={member.role}>
                {member.role === "leader" ? "👑 Leader" : "สมาชิก"}
              </RoleBadge>
            </MemberInfo>
            <Stars>
              {[1, 2, 3, 4, 5].map((star) => (
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
        ))}
      </MemberList>

      <Textarea
        placeholder="เล่นดีมาก ไม่ toxic..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <SubmitBtn onClick={handleSubmit}>ส่ง Rating</SubmitBtn>

      <WarningBanner>
        <span>⚠️</span>
        <span>Rate ได้เฉพาะคนที่ join party เดียวกัน · มีเวลา 48 ชม.</span>
      </WarningBanner>
    </Card>
  );
}
