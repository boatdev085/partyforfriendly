"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";
import type { ReviewWithRater } from "@/lib/reviews";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  reviews: ReviewWithRater[];
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${Math.max(1, min)} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

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
  &:hover { border-color: ${theme.colors.borderLight}; }
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

const TimeAgo = styled.span`
  font-size: 12px;
  color: ${theme.colors.textDim};
`;

const CommentText = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
  line-height: 1.5;
`;

const Empty = styled.div`
  padding: 32px;
  text-align: center;
  font-size: 14px;
  color: ${theme.colors.textMuted};
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
`;

const LoadingText = styled.div`
  padding: 32px;
  text-align: center;
  font-size: 13px;
  color: ${theme.colors.textMuted};
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function ReceivedReviews({ reviews, isLoading }: Props) {
  if (isLoading) {
    return (
      <Section>
        <SectionHeader>รีวิวที่ได้รับ</SectionHeader>
        <LoadingText>กำลังโหลด...</LoadingText>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>รีวิวที่ได้รับ ({reviews.length})</SectionHeader>

      {reviews.length === 0 ? (
        <Empty>ยังไม่มีรีวิว</Empty>
      ) : (
        reviews.map((review) => {
          const raterName =
            review.rater?.display_name ?? review.rater?.username ?? "ผู้ใช้";
          return (
            <ReviewCard key={review.id}>
              <ReviewTop>
                <Avatar>{getInitials(raterName)}</Avatar>
                <ReviewerInfo>
                  <ReviewerName>{raterName}</ReviewerName>
                  <StarsRow>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} $filled={review.score >= s}>
                        {review.score >= s ? "★" : "☆"}
                      </Star>
                    ))}
                  </StarsRow>
                </ReviewerInfo>
                <MetaRow>
                  <TimeAgo>{formatTimeAgo(review.created_at)}</TimeAgo>
                </MetaRow>
              </ReviewTop>
              {review.comment && (
                <CommentText>{review.comment}</CommentText>
              )}
            </ReviewCard>
          );
        })
      )}
    </Section>
  );
}
