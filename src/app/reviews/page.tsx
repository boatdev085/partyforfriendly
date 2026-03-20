"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";
import GiveRatingForm from "@/components/reviews/GiveRatingForm";
import ReceivedReviews from "@/components/reviews/ReceivedReviews";
import { Toaster } from "react-hot-toast";
import AuthGuard from "@/components/auth/AuthGuard";

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

export default function ReviewsPage() {
  return (
    <AuthGuard>
    <PageWrapper>
      <Toaster position="top-center" />
      <Inner>
        <GiveRatingForm />
        <ReceivedReviews />
      </Inner>
    </PageWrapper>
    </AuthGuard>
  );
}
