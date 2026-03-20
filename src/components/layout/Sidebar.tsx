"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled, { css } from "styled-components";
import { theme } from "@/styles/theme";

interface NavItemData {
  icon: string;
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItemData[];
}

const navSections: NavSection[] = [
  {
    label: "MAIN",
    items: [
      { icon: "🏠", label: "หน้าหลัก", href: "/" },
      { icon: "📋", label: "Party List", href: "/parties" },
      { icon: "🔍", label: "ค้นหา", href: "/search" },
      { icon: "➕", label: "สร้าง Party", href: "/parties/create" },
    ],
  },
  {
    label: "MY PARTY",
    items: [
      { icon: "🎮", label: "ห้อง Party", href: "/parties/1" },
      { icon: "⚙️", label: "จัดการห้อง", href: "/parties/1/manage" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { icon: "👤", label: "โปรไฟล์", href: "/profile/1" },
      { icon: "⭐", label: "รีวิว", href: "/reviews" },
      { icon: "🔔", label: "แจ้งเตือน", href: "/notifications", badge: "3" },
    ],
  },
];

const Overlay = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 199;
  }
`;

const SidebarWrapper = styled.aside<{ $open: boolean }>`
  width: 220px;
  min-width: 220px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: ${theme.colors.bgCard};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 200;

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    transform: ${({ $open }) => ($open ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.25s ease;
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 18px;
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0;
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${theme.radii.md};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LogoTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.text};
  line-height: 1.2;
  white-space: nowrap;
`;

const LogoSub = styled.span`
  font-size: 10px;
  color: ${theme.colors.textMuted};
  line-height: 1.4;
  white-space: nowrap;
`;

const NavContent = styled.div`
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: 8px 12px;
`;

const SectionLabel = styled.div`
  padding: 10px 16px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${theme.colors.textDim};
  text-transform: uppercase;
`;

const NavItemLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  margin: 1px 8px;
  border-radius: ${theme.radii.sm};
  font-size: 13.5px;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  background: ${({ $active }) => ($active ? theme.colors.primaryGlow : "transparent")};
  transition: all 0.15s;

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.bgHover};
  }

  ${({ $active }) =>
    $active &&
    css`
      &:hover {
        color: ${theme.colors.primary};
        background: ${theme.colors.primaryGlow};
      }
    `}
`;

const NavIcon = styled.span`
  font-size: 15px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
`;

const NavLabel = styled.span`
  flex: 1;
`;

const Badge = styled.span`
  background: ${theme.colors.danger};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: ${theme.radii.full};
  line-height: 1.6;
`;

const UserFooter = styled.div`
  padding: 14px 16px;
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${theme.radii.full};
  background: linear-gradient(
    135deg,
    ${theme.colors.primary},
    ${theme.colors.primaryHover}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OnlineDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: ${theme.radii.full};
  background: ${theme.colors.success};
  flex-shrink: 0;
  display: inline-block;
`;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <SidebarWrapper $open={open}>
        <LogoArea>
          <LogoIcon>🎮</LogoIcon>
          <LogoText>
            <LogoTitle>PartyForFriendly</LogoTitle>
            <LogoSub>หาเพื่อนเล่นเกม</LogoSub>
          </LogoText>
        </LogoArea>

        <NavContent>
          {navSections.map((section, sIdx) => (
            <div key={section.label}>
              {sIdx > 0 && <SectionDivider />}
              <SectionLabel>{section.label}</SectionLabel>
              {section.items.map((item) => (
                <NavItemLink
                  key={item.href}
                  href={item.href}
                  $active={pathname === item.href}
                  onClick={onClose}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <NavLabel>{item.label}</NavLabel>
                  {item.badge && <Badge>{item.badge}</Badge>}
                </NavItemLink>
              ))}
            </div>
          ))}
        </NavContent>

        <UserFooter>
          <Avatar>PT</Avatar>
          <UserInfo>
            <UserName>PlayerOne_TH</UserName>
          </UserInfo>
          <OnlineDot />
        </UserFooter>
      </SidebarWrapper>
    </>
  );
}
