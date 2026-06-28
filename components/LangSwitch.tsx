'use client'

import { useLang } from '@/lib/i18n/LanguageProvider'

// Shared, reusable language toggle. Designed to sit in any page's topbar
// without disturbing the surrounding approved markup — it's a pure addition.
export default function LangSwitch() {
  const { lang, toggleLang } = useLang()

  return (
    <button
      onClick={toggleLang}
      title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 36,
        padding: '0 12px',
        borderRadius: 9,
        border: '1px solid #e4e6eb',
        background: '#fff',
        color: '#1a56db',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      🌐 {lang === 'en' ? 'العربية' : 'English'}
    </button>
  )
}
