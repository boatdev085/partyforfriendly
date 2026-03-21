"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Toaster } from "react-hot-toast";
import GiveRatingForm, { type RatableMember } from "@/components/reviews/GiveRatingForm";
import ReceivedReviews from "@/components/reviews/ReceivedReviews";
import AuthGuard from "@/components/auth/AuthGuard";
import type { ReviewWithRater } from "@/lib/reviews";

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg};
  font-family: ${theme.fonts.sans};
  padding: 32px 16px 64px;

  @media (max-width: 768px) {
    padding: 20px 12px 48px;
  }
`;

const Inner = styled.div`
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// ---------------------------------------------------------------------------
// Inner component (uses useSearchParams — needs Suspense boundary)
// ---------------------------------------------------------------------------

function ReviewsInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const partyId = searchParams.get("partyId") ?? "";

  const [reviews, setReviews] = useState<ReviewWithRater[]>([]);
  const [members, setMembers] = useState<RatableMember[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const userId = (session?.user as { id?: string } | undefined)?.id;

  // Fetch received reviews for current user
  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?userId=${userId}`);
      if (!res.ok) throw new Error();
      const json = await res.json() as { reviews: ReviewWithRater[] };
      setReviews(json.reviews);
    } catch {
      // silently fail — ReceivedReviews shows empty state
    } finally {
      setReviewsLoading(false);
    }
  }, [userId]);

  // Fetch pending members to rate (only when partyId is in URL)
  const fetchPending = useCallback(async () => {
    if (!partyId) return;
    try {
      const res = await fetch(`/api/reviews/pending?partyId=${partyId}`);
      if (!res.ok) return;
      const json = await res.json() as { members: RatableMember[] };
      setMembers(json.members);
    } catch {
      // ignore
    }
  }, [partyId]);

  useEffect(() => {
    void fetchReviews();
    void fetchPending();
  }, [fetchReviews, fetchPending]);

  return (
    <Inner>
      <GiveRatingForm
        partyId={partyId}
        members={members}
        onSubmitSuccess={() => { void fetchReviews(); void fetchPending(); }}
      />
      <ReceivedReviews reviews={reviews} isLoading={reviewsLoading} />
    </Inner>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function ReviewsPage() {
  return (
    <AuthGuard>
      <PageWrapper>
        <Toaster position="top-center" />
        <Suspense fallback={null}>
          <ReviewsInner />
        </Suspense>
      </PageWrapper>
    </AuthGuard>
  );
}
