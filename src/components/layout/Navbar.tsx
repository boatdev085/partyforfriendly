"use client";

import Link from "next/link";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Gamepad2, LogIn } from "lucide-react";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 15, 20, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${theme.colors.border};
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  color: ${theme.colors.text};

  svg {
    color: ${theme.colors.primary};
  }

  span {
    color: ${theme.colors.primary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: 6px 14px;
  border-radius: ${theme.radii.sm};
  font-size: 14px;
  color: ${theme.colors.textMuted};
  transition: all 0.15s;

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.bgHover};
  }
`;

const LoginBtn = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: ${theme.radii.sm};
  font-size: 14px;
  font-weight: 600;
  background: ${theme.colors.primary};
  color: #fff;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryHover};
  }

  @media (max-width: 640px) {
    padding: 7px 12px;
    font-size: 13px;
  }
`;

export default function Navbar() {
  return (
    <Nav>
      <Inner>
        <Logo href="/">
          <Gamepad2 size={20} />
          Party<span>ForFriendly</span>
        </Logo>

        <NavLinks>
          <NavLink href="/parties">หาปาร์ตี้</NavLink>
          <NavLink href="/games">เกม</NavLink>
          <NavLink href="/leaderboard">อันดับ</NavLink>
        </NavLinks>

        <LoginBtn href="/auth/signin">
          <LogIn size={15} />
          เข้าสู่ระบบ
        </LoginBtn>
      </Inner>
    </Nav>
  );
}
