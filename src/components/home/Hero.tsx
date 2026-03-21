"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styled, { keyframes } from "styled-components";
import { theme } from "@/styles/theme";
import { Search, ArrowRight, Users, Zap, Plus } from "lucide-react";

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const Section = styled.section`
  position: relative;
  overflow: hidden;
  padding: 80px 24px 100px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 48px 20px 60px;
  }

  &::before {
    content: "";
    position: absolute;
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(124, 106, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.primaryGlow};
  background: rgba(124, 106, 255, 0.08);
  font-size: 12px;
  color: ${theme.colors.primary};
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: clamp(36px, 6vw, 68px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: ${theme.colors.text};
  margin-bottom: 20px;

  span {
    background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Subtitle = styled.p`
  font-size: clamp(15px, 2vw, 18px);
  color: ${theme.colors.textMuted};
  max-width: 520px;
  margin: 0 auto 40px;
  line-height: 1.7;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 64px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const BtnPrimary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: ${theme.radii.md};
  font-size: 15px;
  font-weight: 600;
  background: ${theme.colors.primary};
  color: #fff;
  transition: all 0.15s;
  box-shadow: 0 0 20px ${theme.colors.primaryGlow};

  &:hover {
    background: ${theme.colors.primaryHover};
    box-shadow: 0 0 30px rgba(124, 106, 255, 0.4);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const BtnSecondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 28px;
  border-radius: ${theme.radii.md};
  font-size: 15px;
  font-weight: 600;
  background: transparent;
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
  transition: all 0.15s;

  &:hover {
    color: ${theme.colors.text};
    border-color: ${theme.colors.borderLight};
    background: ${theme.colors.bgHover};
  }

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 24px;
  }
`;

const Stat = styled.div`
  text-align: center;

  strong {
    display: block;
    font-size: 28px;
    font-weight: 800;
    color: ${theme.colors.text};
    letter-spacing: -0.5px;

    @media (max-width: 480px) {
      font-size: 22px;
    }
  }

  span {
    font-size: 13px;
    color: ${theme.colors.textMuted};
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 36px;
  background: ${theme.colors.border};

  @media (max-width: 480px) {
    display: none;
  }
`;

export default function Hero() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [partyCount, setPartyCount] = useState<number | null>(null);
  const [gameCount, setGameCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/parties?status=open")
      .then((r) => r.json())
      .then((json) => {
        if (typeof json.total === "number") setPartyCount(json.total);
        else if (Array.isArray(json.data)) setPartyCount(json.data.length);
      })
      .catch(() => {/* keep null */});

    fetch("/api/games")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json)) setGameCount(json.length);
      })
      .catch(() => {/* keep null */});
  }, []);

  return (
    <Section>
      <Badge>
        <Zap size={12} />
        Gaming Community Platform
      </Badge>

      <Title>
        หาปาร์ตี้เกม<br />
        <span>ที่ใช่สำหรับคุณ</span>
      </Title>

      <Subtitle>
        จับคู่กับเพื่อนร่วมทีมที่มีสไตล์การเล่นตรงกัน
        สร้างหรือเข้าร่วมปาร์ตี้ได้ทันที
      </Subtitle>

      <Buttons>
        <BtnPrimary href="/parties">
          <Search size={16} />
          หาปาร์ตี้เลย
        </BtnPrimary>

        {isLoggedIn ? (
          <BtnSecondary href="/parties/create">
            <Plus size={16} />
            สร้างปาร์ตี้
          </BtnSecondary>
        ) : (
          <BtnSecondary href="/search">
            สำรวจเกม
            <ArrowRight size={16} />
          </BtnSecondary>
        )}
      </Buttons>

      <Stats>
        <Stat>
          <strong>2,400+</strong>
          <span>ผู้เล่นลงทะเบียน</span>
        </Stat>
        <Divider />
        <Stat>
          <strong>{partyCount !== null ? `${partyCount}` : "—"}</strong>
          <span>ปาร์ตี้ที่เปิดอยู่</span>
        </Stat>
        <Divider />
        <Stat>
          <strong>{gameCount !== null ? `${gameCount}` : "—"}</strong>
          <span>เกมที่รองรับ</span>
        </Stat>
      </Stats>
    </Section>
  );
}
