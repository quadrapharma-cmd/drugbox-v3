'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import styles from '@/app/feed/feed-approved.module.css'
import FeedComposer from '@/components/FeedComposer'
import FeedPost from '@/components/FeedPost'

export default function FeedShell({ name, inits, headlineOrCompany, posts }: { name: string; inits: string; headlineOrCompany: string; posts: any[] }) {
  const { t } = useLang()

  return (
    <div className={styles['app-shell']}>
      {/* LEFT SIDEBAR — identical structure to the approved design */}
      <aside className={styles['sidebar']}>
        <div className={styles['sb-brand']}>
          <div className={styles['sb-brand-mark']}>D</div>
          <div className={styles['sb-brand-name']}>DRUGBOX</div>
        </div>
        <Link href="/profile" className={styles['sb-profile']} style={{ textDecoration: 'none' }}>
          <div className={styles['sb-av']}>{inits}</div>
          <div>
            <div className={styles['sb-name']}>{name}</div>
            <div className={styles['sb-role']}>{headlineOrCompany || t('common.member')}</div>
          </div>
        </Link>

        <div className={styles['nav']}>
          <div className={styles['nav-label']}>{t('nav.main')}</div>
          <Link href="/feed" className={`${styles['nav-item']} ${styles['active']}`} style={{ textDecoration: 'none' }}><span className={styles['ico']}>🏠</span><span>{t('nav.home')}</span></Link>
          <Link href="/marketplace" className={styles['nav-item']} style={{ textDecoration: 'none' }}><span className={styles['ico']}>🛒</span><span>{t('nav.marketplace')}</span></Link>
          <Link href="/messages" className={styles['nav-item']} style={{ textDecoration: 'none' }}><span className={styles['ico']}>💬</span><span>{t('nav.messages')}</span></Link>
          <div className={styles['nav-item']} style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}><span className={styles['ico']}>🤝</span><span>{t('nav.myNetwork')}</span></div>

          <div className={styles['nav-label']}>{t('nav.discover')}</div>
          <Link href="/groups" className={styles['nav-item']} style={{ textDecoration: 'none' }}><span className={styles['ico']}>👥</span><span>{t('nav.groups')}</span></Link>
          <Link href="/jobs" className={styles['nav-item']} style={{ textDecoration: 'none' }}><span className={styles['ico']}>💼</span><span>{t('nav.jobs')}</span></Link>
          <Link href="/profile" className={styles['nav-item']} style={{ textDecoration: 'none' }}><span className={styles['ico']}>👤</span><span>{t('nav.myProfile')}</span></Link>
        </div>

        <div className={styles['sb-shortcuts']}>
          <div className={styles['nav-label']} style={{ padding: '6px 10px' }}>{t('nav.yourShortcuts')}</div>
          <Link href="/groups" className={styles['shortcut-item']} style={{ textDecoration: 'none' }}><div className={styles['shortcut-ico']}>📋</div> Regulatory Affairs Egypt</Link>
          <Link href="/groups" className={styles['shortcut-item']} style={{ textDecoration: 'none' }}><div className={styles['shortcut-ico']}>⚗️</div> API Sourcing &amp; Supply</Link>
          <Link href="/groups" className={styles['shortcut-item']} style={{ textDecoration: 'none' }}><div className={styles['shortcut-ico']}>🌍</div> GCC Market Access</Link>
        </div>
        <div className={styles['sb-shortcuts']}>
          <div className={styles['nav-label']} style={{ padding: '6px 10px' }}>{t('nav.pages')}</div>
          <Link href="/company" className={styles['shortcut-item']} style={{ textDecoration: 'none' }}><div className={styles['shortcut-ico']}>🏢</div> Quadra Pharm</Link>
          <Link href="/company" className={styles['shortcut-item']} style={{ textDecoration: 'none', color: '#1a56db' }}><div className={styles['shortcut-ico']}>➕</div> {t('nav.createCompany')}</Link>
        </div>
        <div className={styles['sb-privacy']}><Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>{t('nav.privacyTerms')}</Link> · © 2026 Drugbox</div>
      </aside>

      {/* MAIN */}
      <div className={styles['main']}>
        <div className={styles['ticker']}>
          <div className={styles['ticker-track']}>
            <span className={styles['ticker-item']}>⚗️ <b>Supply:</b> Metformin HCl GMP – $5.80/kg</span>
            <span className={styles['ticker-item']}>🔍 <b>Demand:</b> Ciprofloxacin HCl – 2MT/month</span>
            <span className={styles['ticker-item']}>📋 EDA Cosmetic Registration For Sale</span>
            <span className={styles['ticker-item']}>🏭 Contract Mfg – WHO-GMP Certified</span>
            <span className={styles['ticker-item']}>💼 <b>Job:</b> Senior RA Specialist – Egypt</span>
            <span className={styles['ticker-item']}>🌍 GCC Registration – All 6 States</span>
            <span className={styles['ticker-item']}>⚗️ <b>Supply:</b> Metformin HCl GMP – $5.80/kg</span>
            <span className={styles['ticker-item']}>🔍 <b>Demand:</b> Ciprofloxacin HCl – 2MT/month</span>
          </div>
        </div>

        <header className={styles['topbar']}>
          <div className={styles['search-box']}>
            <span className={styles['search-ico']}>🔍</span>
            <input type="text" placeholder={t('feed.searchPlaceholder')} />
          </div>
          <div className={styles['top-actions']}>
            <LangSwitch />
            <div className={styles['icon-btn']} style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🤝<span className={styles['icon-dot']}></span></div>
            <Link href="/messages" className={styles['icon-btn']} style={{ textDecoration: 'none' }}>💬<span className={styles['icon-dot']}></span></Link>
            <div className={styles['icon-btn']} style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🔔<span className={styles['icon-dot']}></span></div>
          </div>
        </header>

        <div className={styles['content']}>
          {/* FEED COLUMN */}
          <div>
            <FeedComposer inits={inits} />

            {(posts ?? []).map((p: any) => <FeedPost post={p} key={p.id} />)}
          </div>

          {/* RIGHT SIDEBAR */}
          <div>
            <div className={styles['r-card']}>
              <div className={styles['r-card-title']}>{t('feed.sponsored')}</div>
              <div className={styles['sponsored-ad']}>
                <div className={styles['ad-img']}>🏭</div>
                <div><div className={styles['ad-title']}>PharmaChem Expo 2026</div><div className={styles['ad-sub']}>Cairo · Oct 14-16</div><div className={styles['ad-tag']}>{t('feed.sponsored')}</div></div>
              </div>
              <div className={styles['sponsored-ad']}>
                <div className={styles['ad-img']}>📋</div>
                <div><div className={styles['ad-title']}>EDA Registration Services</div><div className={styles['ad-sub']}>Fast-track your dossier</div><div className={styles['ad-tag']}>{t('feed.sponsored')}</div></div>
              </div>
              <div className={styles['sponsored-ad']}>
                <div className={styles['ad-img']}>🎓</div>
                <div><div className={styles['ad-title']}>GMP Training Online</div><div className={styles['ad-sub']}>Certified course · 6 hrs</div><div className={styles['ad-tag']}>{t('feed.sponsored')}</div></div>
              </div>
            </div>

            <div className={styles['r-card']}>
              <div className={styles['r-card-title']}>{t('feed.highlights')}</div>
              <div className={styles['highlight-row']}>
                <div className={styles['highlight-ico']}>🎂</div>
                <div><div className={styles['highlight-text']}>Muhammed Musthafa&apos;s birthday</div><div className={styles['highlight-sub']}>Today</div></div>
              </div>
              <div className={styles['highlight-row']}>
                <div className={styles['highlight-ico']}>📅</div>
                <div><div className={styles['highlight-text']}>GCC Registration Webinar</div><div className={styles['highlight-sub']}>Tomorrow, 4:00 PM</div></div>
              </div>
            </div>

            <div className={styles['r-card']}>
              <div className={styles['r-card-title']}>{t('feed.marketToday')}</div>
              <div className={styles['market-stat-row']}><span className={styles['market-stat-label']}>🟢 {t('feed.activeSupply')}</span><span className={`${styles['market-stat-value']} ${styles['up']}`}>312</span></div>
              <div className={styles['market-stat-row']}><span className={styles['market-stat-label']}>🟠 {t('feed.openDemand')}</span><span className={styles['market-stat-value']}>187</span></div>
              <div className={styles['market-stat-row']}><span className={styles['market-stat-label']}>💼 {t('feed.openJobs')}</span><span className={styles['market-stat-value']}>76</span></div>
              <div className={styles['market-stat-row']}><span className={styles['market-stat-label']}>🏭 {t('feed.cmoListings')}</span><span className={styles['market-stat-value']}>43</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
