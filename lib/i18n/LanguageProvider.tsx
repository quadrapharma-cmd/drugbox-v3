'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations, type Lang, type TranslationKey } from './translations'

interface LangContextValue {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: (key: TranslationKey) => string
  toggleLang: () => void
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  // Load saved preference on mount
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('drugbox-lang')) as Lang | null
    if (saved === 'en' || saved === 'ar') {
      setLangState(saved)
    }
  }, [])

  // Apply direction + lang to <html> whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    }
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem('drugbox-lang', l)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en')
  }, [lang, setLang])

  const t = useCallback(
    (key: TranslationKey) => {
      const entry = translations[key]
      if (!entry) return key
      return entry[lang] ?? entry.en ?? key
    },
    [lang]
  )

  return (
    <LangContext.Provider value={{ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', t, toggleLang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
