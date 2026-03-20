"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import ChatArea, { ChatMessage } from "@/components/room/ChatArea";
import MembersList, { Member } from "@/components/room/MembersList";
import PartyInfoCard from "@/components/room/PartyInfoCard";

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    userId: "u2",
    username: "ProPlayer99",
    text: "ใครจะ top บ้างครับ?",
    time: "20:01",
    isSelf: false,
  },
  {
    id: "2",
    userId: "u1",
    username: "คุณ",
    text: "ผม top ได้เลยครับ",
    time: "20:02",
    isSelf: true,
  },
  {
    id: "3",
    userId: "u3",
    username: "NightOwl",
    text: "ผม jungle นะ",
    time: "20:03",
    isSelf: false,
  },
];

const MOCK_MEMBERS: Member[] = [
  {
    id: "u1",
    username: "คุณ",
    isLeader: false,
    isOnline: true,
    rating: 4.8,
    isSelf: true,
  },
  {
    id: "u2",
    username: "ProPlayer99",
    isLeader: true,
    isOnline: true,
    rating: 4.5,
  },
  {
    id: "u3",
    username: "NightOwl",
    isLeader: false,
    isOnline: true,
    rating: 4.2,
  },
];

const Page = styled.div`
  min-height: 100vh;
  background: ${theme.colors.bg};
  display: flex;
  flex-direction: column;
  font-family: ${theme.fonts.sans};
`;

const Topbar = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${theme.colors.bgCard};
  border-bottom: 1px solid ${theme.colors.border};
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PartyName = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OpenBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${theme.colors.success};
  background: rgba(34, 197, 94, 0.12);
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;
`;

const GameTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  background: ${theme.colors.primaryGlow};
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;
`;

const SlotCount = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.accent};
  white-space: nowrap;
`;

const LeaveBtn = styled.button`
  padding: 8px 14px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.danger};
  color: ${theme.colors.danger};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.danger};
    color: #fff;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  height: calc(100vh - 57px);
`;

const ChatCol = styled.div`
  flex: 1;
  min-width: 0;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Sidebar = styled.div`
  width: 260px;
  flex-shrink: 0;
  padding: 16px 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${theme.colors.textDim};
`;

const AdDiv = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: ${theme.colors.textDim};
`;

export default function PartyRoomPage() {
  const router = useRouter();

  return (
    <Page>
      <Topbar>
        <PartyName>ROV แรงค์ Diamond ขึ้น</PartyName>
        <OpenBadge>OPEN</OpenBadge>
        <GameTag>ROV</GameTag>
        <SlotCount>3/5</SlotCount>
        <LeaveBtn onClick={() => router.push("/parties")}>ออกจาก Party</LeaveBtn>
      </Topbar>

      <Content>
        <ChatCol>
          <ChatArea
            initialMessages={MOCK_MESSAGES}
            currentUserId="u1"
          />
        </ChatCol>

        <Sidebar>
          <SideSection>
            <SectionTitle>ข้อมูล Party</SectionTitle>
            <PartyInfoCard
              game="ROV"
              joinMode="auto"
              current={3}
              max={5}
            />
          </SideSection>

          <SideSection>
            <SectionTitle>สมาชิก ({MOCK_MEMBERS.length}/5)</SectionTitle>
            <MembersList members={MOCK_MEMBERS} maxMembers={5} />
          </SideSection>

          <AdDiv>📢 พื้นที่โฆษณา</AdDiv>
        </Sidebar>
      </Content>
    </Page>
  );
}
