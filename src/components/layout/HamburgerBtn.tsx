"use client";

import styled from "styled-components";
import { theme } from "@/styles/theme";

const Btn = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.text};
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${theme.colors.bgHover};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const BarsWrapper = styled.span`
  position: relative;
  width: 16px;
  height: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Bar = styled.span`
  display: block;
  width: 16px;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
`;

interface HamburgerBtnProps {
  onClick: () => void;
}

export default function HamburgerBtn({ onClick }: HamburgerBtnProps) {
  return (
    <Btn onClick={onClick} aria-label="Open menu">
      <BarsWrapper>
        <Bar />
        <Bar />
        <Bar />
      </BarsWrapper>
    </Btn>
  );
}
