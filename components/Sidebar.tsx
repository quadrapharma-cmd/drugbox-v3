'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n/LanguageProvider'
import styles from './Sidebar.module.css'

interface Props {
  userName: string
  userHeadline: string
  userInitials: string
}

const MAIN_NAV = [
  { href: '/feed', ico: '🏠', key: 'nav.home' as const },
  { href: '/marketplace', ico: '🛒', key: 'nav.marketplace' as const },
  { href: '/messages', ico: '💬', key: 'nav.messages' as const },
]
const DISCOVER_NAV = [
  { href: '/groups', ico: '👥', key: 'nav.groups' as const },
  { href: '/jobs', ico: '💼', key: 'nav.jobs' as const },
  { href: '/profile', ico: '👤', key: 'nav.myProfile' as const },
]

export default function Sidebar({ userName, userHeadline, userInitials }: Props) {
  const pathname = usePathname()
  const { t } = useLang()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>D</div>
        <div className={styles.brandName}>DRUGBOX</div>
      </div>

      <Link href="/profile" className={styles.profile}>
        <div className={styles.av}>{userInitials}</div>
        <div>
          <div className={styles.name}>{userName}</div>
          <div className={styles.role}>{userHeadline}</div>
        </div>
      </Link>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>{t('nav.main')}</div>
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.ico}>{item.ico}</span>
            <span>{t(item.key)}</span>
          </Link>
        ))}
        <div className={styles.navItemDisabled} title={t('nav.notBuilt')}>
          <span className={styles.ico}>🤝</span>
          <span>{t('nav.myNetwork')}</span>
        </div>

        <div className={styles.navLabel}>{t('nav.discover')}</div>
        {DISCOVER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.ico}>{item.ico}</span>
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.shortcuts}>
        <div className={styles.navLabel}>{t('nav.pages')}</div>
        <Link href="/company" className={styles.shortcutItem}>
          <div className={styles.shortcutIco}>🏢</div> Quadra Pharm
        </Link>
        <Link href="/company" className={styles.shortcutItem} style={{ color: '#1a56db' }}>
          <div className={styles.shortcutIco}>➕</div> {t('nav.createCompany')}
        </Link>
      </div>
    </aside>
  )
}
