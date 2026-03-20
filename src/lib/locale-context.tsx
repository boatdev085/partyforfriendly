"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import { i18n } from "./i18n"
import type { Locale } from "./i18n"

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}>({ locale: "th", setLocale: () => {}, t: (k) => k })

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th")
  const t = (key: string) => (i18n[locale] as Record<string, string>)[key] ?? key
  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export const useLocale = () => useContext(LocaleContext)
