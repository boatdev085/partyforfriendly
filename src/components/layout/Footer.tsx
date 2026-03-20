"use client";

import Link from "next/link";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Gamepad2 } from "lucide-react";

const FooterEl = styled.footer`
  border-top: 1px solid ${theme.colors.border};
  padding: 40px 24px;
  margin-top: auto;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  color: ${theme.colors.textMuted};

  svg {
    color: ${theme.colors.primary};
  }
`;

const Links = styled.div`
  display: flex;
  gap: 20px;
`;

const FootLink = styled(Link)`
  font-size: 13px;
  color: ${theme.colors.textDim};
  transition: color 0.15s;

  &:hover {
    color: ${theme.colors.textMuted};
  }
`;

const Copy = styled.p`
  font-size: 12px;
  color: ${theme.colors.textDim};
`;

export default function Footer() {
  return (
    <FooterEl>
      <Inner>
        <Brand>
          <Gamepad2 size={16} />
          PartyForFriendly
        </Brand>

        <Links>
          <FootLink href="/about">เกี่ยวกับ</FootLink>
          <FootLink href="/terms">เงื่อนไข</FootLink>
          <FootLink href="/privacy">ความเป็นส่วนตัว</FootLink>
        </Links>

        <Copy>© 2025 PartyForFriendly</Copy>
      </Inner>
    </FooterEl>
  );
}
