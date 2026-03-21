"use client"

import styled from "styled-components"
import { theme } from "@/styles/theme"
import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

const BannerWrapper = styled.div`
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  font-size: 11px;
  color: ${theme.colors.textMuted};
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 20px;
`

interface SponsoredBannerProps {
  slot?: string
}

export default function SponsoredBanner({ slot }: SponsoredBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch {
      // suppress adsbygoogle errors
    }
  }, [])

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const slotId = slot ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID

  if (!clientId) {
    return (
      <BannerWrapper>
        <span>📢 Sponsored</span>
      </BannerWrapper>
    )
  }

  return (
    <BannerWrapper>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </BannerWrapper>
  )
}
