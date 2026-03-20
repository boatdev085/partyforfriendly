"use client"
import styled from "styled-components"
import { theme } from "@/styles/theme"
import { useLocale } from "@/lib/locale-context"
import type { Locale } from "@/lib/i18n"

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.bgHover};
  border-radius: ${theme.radii.full};
  padding: 2px;
  gap: 2px;
`

const LangBtn = styled.button<{ $active: boolean }>`
  padding: 3px 10px;
  border-radius: ${theme.radii.full};
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $active }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : theme.colors.textMuted)};

  &:hover {
    color: ${({ $active }) => ($active ? "#fff" : theme.colors.text)};
  }
`

const locales: Locale[] = ["th", "en"]
const labels: Record<Locale, string> = { th: "TH", en: "EN" }

export default function LangSwitcher() {
  const { locale, setLocale } = useLocale()
  return (
    <Wrapper>
      {locales.map((l) => (
        <LangBtn key={l} $active={locale === l} onClick={() => setLocale(l)}>
          {labels[l]}
        </LangBtn>
      ))}
    </Wrapper>
  )
}
