"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

const Banner = styled.div`
  border: 1.5px dashed ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: ${theme.colors.bgCard};
  margin-bottom: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const Label = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${theme.colors.warning};
  background: rgba(245, 158, 11, 0.12);
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;
  flex-shrink: 0;
`;

const Text = styled.span`
  font-size: 13px;
  color: ${theme.colors.textMuted};
  flex: 1;
`;

const MoreLink = styled.a`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.primary};
  white-space: nowrap;

  &:hover {
    color: ${theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

export default function SponsoredBanner() {
  return (
    <Banner>
      <Label>📢 SPONSORED</Label>
      <Text>
        อยากหาทีมเล่นเกมแบบมือโปร? สมัคร GG Academy เรียนรู้เทคนิคจากโปรเพลเยอร์ตัวจริง!
      </Text>
      <MoreLink href="#" target="_blank" rel="noopener noreferrer">
        ดูเพิ่ม →
      </MoreLink>
    </Banner>
  );
}
