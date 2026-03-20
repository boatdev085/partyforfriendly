"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

interface Review {
  id: string;
  reviewer: string;
  score: number;
  comment: string;
  game: string;
  timeAgo: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: "r1", reviewer: "TomZaa", score: 5, comment: "เล่นดีมาก ช่วยเหลือทีม!", game: "ROV", timeAgo: "2 วันก่อน" },
  { id: "r2", reviewer: "MaeMod", score: 5, comment: "อยากเล่นด้วยอีกครับ", game: "Valorant", timeAgo: "5 วันก่อน" },
  { id: "r3", reviewer: "BaanGamer", score: 4, comment: "เล่นดี แต่ช้านิดนึง", game: "PUBG", timeAgo: "1 สัปดาห์" },
];

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const ReviewCard = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  padding: 16px 20px;
  box-shadow: ${theme.shadows.card};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${theme.colors.borderLight};
  }
`;

const ReviewTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: ${theme.radii.full};
  background: linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const ReviewerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ReviewerName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text};
`;

const StarsRow = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 2px;
`;

const Star = styled.span<{ $filled: boolean }>`
  font-size: 14px;
  color: ${({ $filled }) => ($filled ? theme.colors.warning : theme.colors.border)};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const GameLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: ${theme.radii.full};
  background: rgba(124, 106, 255, 0.12);
  color: ${theme.colors.primary};
  border: 1px solid rgba(124, 106, 255, 0.2);
`;

const TimeAgo = styled.span`
  font-size: 12px;
  color: ${theme.colors.textDim};
`;

const CommentText = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
  line-height: 1.5;
`;

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function ReceivedReviews() {
  return (
    <Section>
      <SectionHeader>รีวิวที่ได้รับ (127)</SectionHeader>
      {MOCK_REVIEWS.map((review) => (
        <ReviewCard key={review.id}>
          <ReviewTop>
            <Avatar>{getInitials(review.reviewer)}</Avatar>
            <ReviewerInfo>
              <ReviewerName>{review.reviewer}</ReviewerName>
              <StarsRow>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} $filled={review.score >= s}>
                    {review.score >= s ? "★" : "☆"}
                  </Star>
                ))}
              </StarsRow>
            </ReviewerInfo>
            <MetaRow>
              <GameLabel>{review.game}</GameLabel>
              <TimeAgo>{review.timeAgo}</TimeAgo>
            </MetaRow>
          </ReviewTop>
          <CommentText>{review.comment}</CommentText>
        </ReviewCard>
      ))}
    </Section>
  );
}
