'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import FeedComposer from '@/components/FeedComposer'
import FeedPost from '@/components/FeedPost'

export default function FeedShell({ name, inits, headlineOrCompany, posts }: { name: string; inits: string; headlineOrCompany: string; posts: any[] }) {
  const { t } = useLang()

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR — identical structure to the approved design */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-brand-mark">D</div>
          <div className="sb-brand-name">DRUGBOX</div>
        </div>
        <Link href="/profile" className="sb-profile" style={{ textDecoration: 'none' }}>
          <div className="sb-av">{inits}</div>
          <div>
            <div className="sb-name">{name}</div>
            <div className="sb-role">{headlineOrCompany || t('common.member')}</div>
          </div>
        </Link>

        <div className="nav">
          <div className="nav-label">{t('nav.main')}</div>
          <Link href="/feed" className="nav-item active" style={{ textDecoration: 'none' }}><span className="ico">🏠</span><span>{t('nav.home')}</span></Link>
          <Link href="/marketplace" className="nav-item" style={{ textDecoration: 'none' }}><span className="ico">🛒</span><span>{t('nav.marketplace')}</span></Link>
          <Link href="/messages" className="nav-item" style={{ textDecoration: 'none' }}><span className="ico">💬</span><span>{t('nav.messages')}</span></Link>
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}><span className="ico">🤝</span><span>{t('nav.myNetwork')}</span></div>

          <div className="nav-label">{t('nav.discover')}</div>
          <Link href="/groups" className="nav-item" style={{ textDecoration: 'none' }}><span className="ico">👥</span><span>{t('nav.groups')}</span></Link>
          <Link href="/jobs" className="nav-item" style={{ textDecoration: 'none' }}><span className="ico">💼</span><span>{t('nav.jobs')}</span></Link>
          <Link href="/profile" className="nav-item" style={{ textDecoration: 'none' }}><span className="ico">👤</span><span>{t('nav.myProfile')}</span></Link>
        </div>

        <div className="sb-shortcuts">
          <div className="nav-label" style={{ padding: '6px 10px' }}>{t('nav.yourShortcuts')}</div>
          <Link href="/groups" className="shortcut-item" style={{ textDecoration: 'none' }}><div className="shortcut-ico">📋</div> Regulatory Affairs Egypt</Link>
          <Link href="/groups" className="shortcut-item" style={{ textDecoration: 'none' }}><div className="shortcut-ico">⚗️</div> API Sourcing &amp; Supply</Link>
          <Link href="/groups" className="shortcut-item" style={{ textDecoration: 'none' }}><div className="shortcut-ico">🌍</div> GCC Market Access</Link>
        </div>
        <div className="sb-shortcuts">
          <div className="nav-label" style={{ padding: '6px 10px' }}>{t('nav.pages')}</div>
          <Link href="/company" className="shortcut-item" style={{ textDecoration: 'none' }}><div className="shortcut-ico">🏢</div> Quadra Pharm</Link>
          <Link href="/company" className="shortcut-item" style={{ textDecoration: 'none', color: '#1a56db' }}><div className="shortcut-ico">➕</div> {t('nav.createCompany')}</Link>
        </div>
        <div className="sb-privacy"><Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>{t('nav.privacyTerms')}</Link> · © 2026 Drugbox</div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <div className="ticker">
          <div className="ticker-track">
            <span className="ticker-item">⚗️ <b>Supply:</b> Metformin HCl GMP – $5.80/kg</span>
            <span className="ticker-item">🔍 <b>Demand:</b> Ciprofloxacin HCl – 2MT/month</span>
            <span className="ticker-item">📋 EDA Cosmetic Registration For Sale</span>
            <span className="ticker-item">🏭 Contract Mfg – WHO-GMP Certified</span>
            <span className="ticker-item">💼 <b>Job:</b> Senior RA Specialist – Egypt</span>
            <span className="ticker-item">🌍 GCC Registration – All 6 States</span>
            <span className="ticker-item">⚗️ <b>Supply:</b> Metformin HCl GMP – $5.80/kg</span>
            <span className="ticker-item">🔍 <b>Demand:</b> Ciprofloxacin HCl – 2MT/month</span>
          </div>
        </div>

        <header className="topbar">
          <div className="search-box">
            <span className="search-ico">🔍</span>
            <input type="text" placeholder={t('feed.searchPlaceholder')} />
          </div>
          <div className="top-actions">
            <LangSwitch />
            <div className="icon-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🤝<span className="icon-dot"></span></div>
            <Link href="/messages" className="icon-btn" style={{ textDecoration: 'none' }}>💬<span className="icon-dot"></span></Link>
            <div className="icon-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🔔<span className="icon-dot"></span></div>
          </div>
        </header>

        <div className="content">
          {/* FEED COLUMN */}
          <div>
            <FeedComposer inits={inits} />

            {(posts ?? []).map((p: any) => <FeedPost post={p} key={p.id} />)}
          </div>

          {/* RIGHT SIDEBAR */}
          <div>
            <div className="r-card">
              <div className="r-card-title">{t('feed.sponsored')}</div>
              <div className="sponsored-ad">
                <div className="ad-img">🏭</div>
                <div><div className="ad-title">PharmaChem Expo 2026</div><div className="ad-sub">Cairo · Oct 14-16</div><div className="ad-tag">{t('feed.sponsored')}</div></div>
              </div>
              <div className="sponsored-ad">
                <div className="ad-img">📋</div>
                <div><div className="ad-title">EDA Registration Services</div><div className="ad-sub">Fast-track your dossier</div><div className="ad-tag">{t('feed.sponsored')}</div></div>
              </div>
              <div className="sponsored-ad">
                <div className="ad-img">🎓</div>
                <div><div className="ad-title">GMP Training Online</div><div className="ad-sub">Certified course · 6 hrs</div><div className="ad-tag">{t('feed.sponsored')}</div></div>
              </div>
            </div>

            <div className="r-card">
              <div className="r-card-title">{t('feed.highlights')}</div>
              <div className="highlight-row">
                <div className="highlight-ico">🎂</div>
                <div><div className="highlight-text">Muhammed Musthafa&apos;s birthday</div><div className="highlight-sub">Today</div></div>
              </div>
              <div className="highlight-row">
                <div className="highlight-ico">📅</div>
                <div><div className="highlight-text">GCC Registration Webinar</div><div className="highlight-sub">Tomorrow, 4:00 PM</div></div>
              </div>
            </div>

            <div className="r-card">
              <div className="r-card-title">{t('feed.marketToday')}</div>
              <div className="market-stat-row"><span className="market-stat-label">🟢 {t('feed.activeSupply')}</span><span className="market-stat-value up">312</span></div>
              <div className="market-stat-row"><span className="market-stat-label">🟠 {t('feed.openDemand')}</span><span className="market-stat-value">187</span></div>
              <div className="market-stat-row"><span className="market-stat-label">💼 {t('feed.openJobs')}</span><span className="market-stat-value">76</span></div>
              <div className="market-stat-row"><span className="market-stat-label">🏭 {t('feed.cmoListings')}</span><span className="market-stat-value">43</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
