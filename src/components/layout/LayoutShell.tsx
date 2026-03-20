"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import Sidebar from "./Sidebar";
import HamburgerBtn from "./HamburgerBtn";
import LangSwitcher from "./LangSwitcher";
import { LocaleProvider } from "@/lib/locale-context";

const ShellWrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MobileTopBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 52px;
    background: ${theme.colors.bgCard};
    border-bottom: 1px solid ${theme.colors.border};
    position: sticky;
    top: 0;
    z-index: 100;
    gap: 12px;
    flex-shrink: 0;
  }
`;

const MobileTopBarTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.text};
  flex: 1;
`;

const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LocaleProvider>
      <ShellWrapper>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MainContent>
          <MobileTopBar>
            <HamburgerBtn onClick={() => setSidebarOpen(true)} />
            <MobileTopBarTitle>PartyForFriendly</MobileTopBarTitle>
            <LangSwitcher />
          </MobileTopBar>
          {children}
        </MainContent>
      </ShellWrapper>
    </LocaleProvider>
  );
}
