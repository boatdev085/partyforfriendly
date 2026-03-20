"use client";

import { useState } from "react";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import NotifItem, { type Notif } from "@/components/notifications/NotifItem";
import AuthGuard from "@/components/auth/AuthGuard";

const INITIAL_NOTIFS: Notif[] = [
  { id:"n1", type:"join_request", username:"SomchaiXX", game:"ROV", timeAgo:"2 นาทีที่แล้ว", isNew:true },
  { id:"n2", type:"waitlist_open", game:"PUBG", timeAgo:"5 นาทีที่แล้ว", isNew:true },
  { id:"n3", type:"rated", username:"TomZaa", score:5, timeAgo:"10 นาทีที่แล้ว", isNew:true },
  { id:"n4", type:"approved", game:"Valorant", timeAgo:"1 ชั่วโมงที่แล้ว", isNew:false },
  { id:"n5", type:"party_full", timeAgo:"เมื่อวาน", isNew:false },
  { id:"n6", type:"badge_earned", timeAgo:"2 วันที่แล้ว", isNew:false },
];

const Page = styled.main`
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 20px 80px;

  @media (max-width: 768px) {
    padding: 20px 16px 60px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: ${theme.colors.text};

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const MarkAllBtn = styled.button`
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.borderLight}; color: ${theme.colors.text}; }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
  margin-bottom: 8px;
`;

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 14px;
  padding: 4px 12px;
`;

const Empty = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: ${theme.colors.textDim};
`;

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);

  const remove = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, isNew: false })));

  const newNotifs = notifs.filter(n => n.isNew);
  const oldNotifs = notifs.filter(n => !n.isNew);
  const newCount = newNotifs.length;

  return (
    <AuthGuard>
    <Page>
      <Header>
        <Title>แจ้งเตือน</Title>
        <MarkAllBtn onClick={markAllRead}>อ่านทั้งหมด</MarkAllBtn>
      </Header>

      <Section>
        <SectionLabel>ใหม่ {newCount > 0 ? `(${newCount})` : ""}</SectionLabel>
        <Card>
          {newNotifs.length === 0 ? (
            <Empty>ไม่มีการแจ้งเตือนใหม่</Empty>
          ) : (
            newNotifs.map(n => (
              <NotifItem
                key={n.id}
                notif={n}
                onApprove={remove}
                onReject={remove}
              />
            ))
          )}
        </Card>
      </Section>

      <Section>
        <SectionLabel>ก่อนหน้า</SectionLabel>
        <Card>
          {oldNotifs.length === 0 ? (
            <Empty>ไม่มีการแจ้งเตือนก่อนหน้า</Empty>
          ) : (
            oldNotifs.map(n => (
              <NotifItem key={n.id} notif={n} />
            ))
          )}
        </Card>
      </Section>
    </Page>
    </AuthGuard>
  );
}
