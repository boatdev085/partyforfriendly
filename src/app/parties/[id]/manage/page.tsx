"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import PartySettings from "@/components/leader/PartySettings";
import RealtimeStats from "@/components/leader/RealtimeStats";
import MemberManager, { MemberItem } from "@/components/leader/MemberManager";
import PendingList, { PendingItem } from "@/components/leader/PendingList";

const MOCK_MEMBERS: MemberItem[] = [
  {
    id: "u1",
    username: "SomchaiXX",
    isLeader: true,
    isSelf: true,
    rating: 4.8,
    partyCount: 127,
  },
  {
    id: "u2",
    username: "NongMin99",
    isLeader: false,
    rating: 4.5,
    partyCount: 64,
  },
  {
    id: "u3",
    username: "TomZaa",
    isLeader: false,
    rating: 4.2,
    partyCount: 31,
  },
];

const MOCK_PENDING: PendingItem[] = [
  {
    id: "p1",
    username: "BaanGamer",
    rating: 4.0,
    partyCount: 22,
    timeAgo: "3 นาทีที่แล้ว",
  },
  {
    id: "p2",
    username: "XRankerPro",
    rating: 3.8,
    partyCount: 15,
    timeAgo: "8 นาทีที่แล้ว",
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

const OpenBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${theme.colors.success};
  background: rgba(34, 197, 94, 0.12);
  padding: 3px 8px;
  border-radius: ${theme.radii.sm};
  white-space: nowrap;
`;

const PageTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text};
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BackLink = styled(Link)`
  padding: 8px 14px;
  border-radius: ${theme.radii.md};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 480px) {
    padding: 16px 12px;
    gap: 16px;
  }
`;

export default function LeaderPanelPage() {
  const params = useParams();
  const router = useRouter();
  const partyId = params?.id ?? "1";

  const handleDisband = () => {
    if (window.confirm("ยืนยันการยุบ Party? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      router.push("/parties");
    }
  };

  return (
    <Page>
      <Topbar>
        <OpenBadge>OPEN 3/5</OpenBadge>
        <PageTitle>⚙️ จัดการห้อง</PageTitle>
        <BackLink href={`/parties/${partyId}`}>← กลับห้อง</BackLink>
      </Topbar>

      <Content>
        <RealtimeStats
          memberCount={3}
          maxMembers={5}
          pendingCount={2}
          waitlistCount={1}
          onDisband={handleDisband}
        />

        <PartySettings
          initialJoinMode="approve"
          initialMaxMembers={5}
          initialDiscord=""
          onSave={(settings) => {
            console.log("Saved settings:", settings);
          }}
        />

        <MemberManager initialMembers={MOCK_MEMBERS} />

        <PendingList initialPending={MOCK_PENDING} />
      </Content>
    </Page>
  );
}
