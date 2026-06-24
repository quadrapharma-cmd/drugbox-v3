'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangToggle from './LangToggle'
import styles from './Topbar.module.css'

export default function Topbar() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLang()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <LangToggle />
        <button className={styles.signOut} onClick={handleSignOut}>
          ⎋ {t('nav.signOut')}
        </button>
      </div>
    </header>
  )
}
