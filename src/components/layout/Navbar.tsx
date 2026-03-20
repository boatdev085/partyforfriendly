"use client";

import Link from "next/link";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { Gamepad2, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

  @media (max-width: 768px) {
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const HamburgerBtn = styled.button`
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

  &:hover {
    background: ${theme.colors.bgHover};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? "flex" : "none")};
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(13, 15, 20, 0.97);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${theme.colors.border};
    padding: 12px 16px 16px;
    gap: 4px;
    z-index: 99;
  }
`;

const MobileNavLink = styled(Link)`
  padding: 10px 14px;
  border-radius: ${theme.radii.sm};
  font-size: 15px;
  color: ${theme.colors.textMuted};
  transition: all 0.15s;

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.bgHover};
  }
`;

const MobileLoginBtn = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  margin-top: 8px;
  border-radius: ${theme.radii.sm};
  font-size: 14px;
  font-weight: 600;
  background: ${theme.colors.primary};
  color: #fff;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <Nav ref={menuRef}>
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

        <HamburgerBtn onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </HamburgerBtn>
      </Inner>

      <MobileMenu $open={open}>
        <MobileNavLink href="/parties" onClick={() => setOpen(false)}>หาปาร์ตี้</MobileNavLink>
        <MobileNavLink href="/games" onClick={() => setOpen(false)}>เกม</MobileNavLink>
        <MobileNavLink href="/leaderboard" onClick={() => setOpen(false)}>อันดับ</MobileNavLink>
        <MobileLoginBtn href="/auth/signin" onClick={() => setOpen(false)}>
          <LogIn size={15} />
          เข้าสู่ระบบ
        </MobileLoginBtn>
      </MobileMenu>
    </Nav>
  );
}
