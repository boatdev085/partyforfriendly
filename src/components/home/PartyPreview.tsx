"use client";

import Link from "next/link";
import styled from "styled-components";
import { theme } from "@/styles/theme";
import { ArrowRight, TrendingUp } from "lucide-react";
import PartyCard from "@/components/party/PartyCard";
import type { Party } from "@/types";

const MOCK_PARTIES: (Party & { game_name: string; host_name: string })[] = [
  {
    id: "1",
    title: "หา DPS มือดี ไป Mythic+ 15+",
    game: "world-of-warcraft",
    game_name: "World of Warcraft",
    host_id: "u1",
    host_name: "Shadowblade",
    max_members: 5,
    current_members: 3,
    status: "open",
    description: "ต้องการ DPS gear score 450+ รู้จัก rotation ของ class ตัวเอง ไม่ toxic",
    required_rank: "450+ GS",
    language: "th",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Valorant ขึ้น Diamond ด้วยกัน",
    game: "valorant",
    game_name: "Valorant",
    host_id: "u2",
    host_name: "NightFox",
    max_members: 5,
    current_members: 5,
    status: "full",
    description: "ปาร์ตี้ ranked เน้น communication และ IGL ที่ดี มีไมค์บังคับ",
    required_rank: "Platinum+",
    language: "th",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Minecraft Survival ยาว ๆ สร้างเซิร์ฟใหม่",
    game: "minecraft",
    game_name: "Minecraft",
    host_id: "u3",
    host_name: "CrafterZaa",
    max_members: 8,
    current_members: 2,
    status: "open",
    description: "เล่น survival กัน ไม่เร่ง ชิล ๆ มีออก stream ด้วย",
    language: "both",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "FFXIV Savage Raid P8S สอนนะ",
    game: "final-fantasy-xiv",
    game_name: "Final Fantasy XIV",
    host_id: "u4",
    host_name: "AetherWing",
    max_members: 8,
    current_members: 6,
    status: "open",
    description: "Static ใหม่สำหรับคนอยากเรียน Savage ไม่ต้องมีประสบการณ์ก็ได้",
    language: "th",
    created_at: new Date().toISOString(),
  },
];

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;

  @media (max-width: 768px) {
    padding: 0 16px 60px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const IconWrap = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.primaryGlow};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
`;

const ViewAll = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.primary};
  transition: gap 0.15s;

  &:hover {
    gap: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export default function PartyPreview() {
  return (
    <Section>
      <Header>
        <TitleGroup>
          <IconWrap>
            <TrendingUp size={16} />
          </IconWrap>
          <SectionTitle>ปาร์ตี้ที่กำลังเปิดรับ</SectionTitle>
        </TitleGroup>
        <ViewAll href="/parties">
          ดูทั้งหมด <ArrowRight size={14} />
        </ViewAll>
      </Header>

      <Grid>
        {MOCK_PARTIES.map((party) => (
          <PartyCard key={party.id} party={party} />
        ))}
      </Grid>
    </Section>
  );
}
