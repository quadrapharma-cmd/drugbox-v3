'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import EditProfileButton from '@/components/EditProfileButton'
import ConnectButton from '@/components/ConnectButton'

const CAT_CLASS: Record<string, string> = {
  general: 'cat-general', regulatory: 'cat-regulatory', market: 'cat-market', innovation: 'cat-innovation', job: 'cat-job',
}
const CAT_KEY: Record<string, string> = {
  general: 'cat.general', regulatory: 'cat.regulatory', market: 'cat.market', innovation: 'cat.innovation', job: 'cat.job',
}
const LISTING_ICON: Record<string, string> = {
  supply: '⚗️', demand: '🔍', cmo: '🏭', equipment: '🔧', license: '📜', service: '📋', job: '💼', training: '🎓',
}

export default function ProfileShell({ profile, stats, listings, recentPosts, inits, timeAgoList }: {
  profile: any; stats: any; listings: any[]; recentPosts: any[]; inits: string; timeAgoList: string[]
}) {
  const { t } = useLang()
  const certs = (profile.certifications || '').split(',').map((c: string) => c.trim()).filter(Boolean)
  const isVerified = !!profile.certs_verified_at

  return (
    <>
      <div className="topbar">
        <Link href="/feed" className="brand" style={{ textDecoration: 'none' }}>DRUGBOX</Link>
        <LangSwitch />
        <Link href="/profile" className="av-sm" style={{ textDecoration: 'none' }}>{inits}</Link>
        <Link href="/login" style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textDecoration: 'none', marginLeft: 10 }}>⎋ {t('common.signOut')}</Link>
      </div>

      <div className="page-wrap">
        <div className="profile-card">
          <div className="cover">
            <div className="cover-edit">📷 {t('profile.editCover')}</div>
          </div>
          <div className="profile-head">
            <div className="avatar">{inits}</div>

            <div className="head-row">
              <div className="name-block">
                <div className="name">{profile.name} {profile.verified && <span style={{ color: '#1a56db', fontSize: 17 }}>✓</span>}</div>
                <div className="role">{profile.headline}{profile.company ? ` at ${profile.company}` : ''}{profile.location ? ` · ${profile.location}` : ''}</div>
              </div>
              <div className="head-actions">
                <EditProfileButton profile={profile} />
                <ConnectButton profileId={profile.id} />
              </div>
            </div>

            {certs.length > 0 && (
              <div className="cert-badges">
                {certs.map((c: string) => (
                  <span key={c} className="cert-badge cert-who">{isVerified ? '✓' : '○'} {c}</span>
                ))}
              </div>
            )}

            <div className="specialty-bar">
              <span className="specialty-label">{t('profile.specialties')}</span>
              <span className="specialty-tag">Solid Dosage Manufacturing</span>
              <span className="specialty-tag">Regulatory Affairs</span>
              <span className="specialty-tag">Cross-Border Registration</span>
              <span className="specialty-tag">GCC Market Access</span>
            </div>

            <div className="market-activity">
              <div className="ma-stat"><div className="n">{stats.posts}</div><div className="l">{t('profile.posts')}</div></div>
              <div className="ma-stat"><div className="n">{stats.connections}</div><div className="l">{t('profile.connections')}</div></div>
              <div className="ma-stat"><div className="n">{stats.listings}</div><div className="l">{t('profile.activeListings')}</div></div>
            </div>

            <div className="tabs">
              <div className="tab active">{t('profile.tabPosts')}</div>
              <div className="tab" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>{t('profile.tabAbout')}</div>
              <div className="tab" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>{t('profile.tabConnections')}</div>
              <div className="tab" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>{t('profile.tabListings')}</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">{t('profile.about')}</div>
              <p className="bio-text">{profile.bio || t('profile.noBio')}</p>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">{t('profile.details')}</div>
              {profile.company && (
                <div className="info-row"><div className="info-ico">🏢</div><div><div className="info-label">{t('profile.company')}</div><Link href="/company" className="info-val" style={{ color: '#1a56db', textDecoration: 'none' }}>{profile.company} →</Link></div></div>
              )}
              {profile.location && (
                <div className="info-row"><div className="info-ico">📍</div><div><div className="info-label">{t('profile.location')}</div><div className="info-val">{profile.location}</div></div></div>
              )}
              {profile.website && (
                <div className="info-row"><div className="info-ico">🌐</div><div><div className="info-label">{t('profile.website')}</div><div className="info-val">{profile.website}</div></div></div>
              )}
              {profile.phone && (
                <div className="info-row"><div className="info-ico">📞</div><div><div className="info-label">{t('profile.phone')}</div><div className="info-val">{profile.phone}</div></div></div>
              )}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">{t('profile.myListings')} <Link href="/marketplace" style={{ fontSize: 11, color: '#1a56db', fontWeight: 700, textDecoration: 'none' }}>{t('common.viewAll')} →</Link></div>
              {listings.length === 0 ? (
                <p className="bio-text">{t('profile.noListings')}</p>
              ) : (
                listings.map((l: any) => (
                  <div className="listing-row" key={l.id}>
                    <div className="listing-ico">{LISTING_ICON[l.category] || '📦'}</div>
                    <div><div className="listing-title">{l.title}</div><div className="listing-meta">{l.price_amount ? `$${l.price_amount}${l.price_unit ? '/' + l.price_unit : ''} · ` : ''}{l.views_count} views</div></div>
                    <span className="listing-type type-supply">{l.category}</span>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <div className="card-title">{t('profile.pages')}</div>
              <Link href="/company" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderBottom: '1px solid #f0f4fb', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#0a1f4d,#1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>QP</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{profile.company || 'Quadra Pharm'}</div><div style={{ fontSize: 10.5, color: '#94a3b8' }}>👑 {t('company.admin')} · 1,840 followers</div></div>
                <span style={{ color: '#1a56db', fontSize: 13 }}>→</span>
              </Link>
              <Link href="/company" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, marginTop: 8, border: '1.5px dashed #cbd5e1', borderRadius: 9, textDecoration: 'none', color: '#1a56db', fontSize: 12.5, fontWeight: 700 }}>
                ➕ {t('profile.createCompanyPage')}
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-title">{t('profile.recentPosts')}</div>
            {recentPosts.length === 0 ? (
              <p className="bio-text">{t('profile.noPosts')}</p>
            ) : (
              recentPosts.map((p: any, i: number) => (
                <div className="post" key={p.id}>
                  <div className="post-head">
                    <span className="post-time">{timeAgoList[i]}</span>
                    <span className={`post-cat ${CAT_CLASS[p.category] || 'cat-general'}`}>{t((CAT_KEY[p.category] || 'cat.general') as any)}</span>
                  </div>
                  <div className="post-body">{p.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
