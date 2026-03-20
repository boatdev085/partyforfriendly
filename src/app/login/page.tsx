"use client"
import { signIn } from "next-auth/react"
import styled, { keyframes } from "styled-components"
import { theme } from "@/styles/theme"

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.bg};
  padding: 24px;
`

const Card = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.xl};
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: ${theme.shadows.card};
  animation: ${fadeIn} 0.4s ease;

  @media (max-width: 480px) {
    padding: 36px 24px;
  }
`

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const LogoIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${theme.radii.md};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: ${theme.shadows.glow};
`

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`

const AppTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: ${theme.colors.text};
  line-height: 1.2;
  margin: 0;
`

const AppSub = styled.span`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  margin-top: 2px;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${theme.colors.border};
`

const Tagline = styled.p`
  font-size: 15px;
  color: ${theme.colors.textMuted};
  text-align: center;
  margin: 0;
  line-height: 1.6;
`

const DiscordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: ${theme.radii.md};
  background: #5865f2;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  letter-spacing: 0.01em;

  &:hover {
    background: #4752c4;
  }

  &:active {
    transform: scale(0.98);
  }
`

const DiscordIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

export default function LoginPage() {
  return (
    <PageWrapper>
      <Card>
        <LogoRow>
          <LogoIcon>🎮</LogoIcon>
          <LogoText>
            <AppTitle>PartyForFriendly</AppTitle>
            <AppSub>หาเพื่อนเล่นเกม</AppSub>
          </LogoText>
        </LogoRow>

        <Divider />

        <Tagline>เชื่อมต่อกับเพื่อนนักเล่นเกม<br />เข้าร่วมปาร์ตี้และเล่นด้วยกัน</Tagline>

        <DiscordButton onClick={() => signIn("discord", { callbackUrl: "/" })}>
          <DiscordIcon />
          เข้าสู่ระบบด้วย Discord
        </DiscordButton>
      </Card>
    </PageWrapper>
  )
}
