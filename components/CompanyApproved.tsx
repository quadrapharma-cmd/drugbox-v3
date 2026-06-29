'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateCompany, leaveCompany, deleteCompany } from '@/actions/company'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import styles from '@/app/company/company-approved.module.css'
import FollowButton from '@/components/FollowButton'

function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
const ROLE_PILL: Record<string, string> = { admin: 'pill-admin', subadmin: 'pill-sub', member: 'pill-member' }
const ROLE_LABEL: Record<string, string> = { admin: 'Admin', subadmin: 'Sub-Admin', member: 'Member' }
const CAT_ICON: Record<string, string> = { supply: '⚗️', demand: '🔍', cmo: '🏭', equipment: '🔧', license: '📜', service: '📋', job: '💼', training: '🎓' }

export default function CompanyApproved({ company, team, products, jobs, viewerRole, currentUserId }: {
  company: any; team: any[]; products: any[]; jobs: any[]; viewerRole: string; currentUserId: string
}) {
  const router = useRouter()
  const { t } = useLang()
  const [showManage, setShowManage] = useState(false)
  const [tagline, setTagline] = useState(company.tagline || '')
  const [about, setAbout] = useState(company.about || '')
  const [saving, setSaving] = useState(false)
  const isAdmin = viewerRole === 'admin'
  const isManager = viewerRole === 'admin' || viewerRole === 'subadmin'
  const isMember = viewerRole === 'member'

  // BUG FIX: "Message company" used to do nothing — it now routes to a
  // real conversation with the company's admin (the first team member
  // with the admin role), same deep-link pattern used elsewhere in the app.
  const companyAdmin = team.find((tm: any) => tm.role === 'admin')
  function handleMessageCompany() {
    if (!companyAdmin) { alert('No admin found for this company yet.'); return }
    router.push(`/messages?with=${companyAdmin.user_id}`)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await updateCompany(company.id, { tagline, about })
      if (res.error) throw new Error(res.error)
      setShowManage(false)
      router.refresh()
    } catch (e: any) {
      alert(e.message || 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLeave() {
    try {
      const res = await leaveCompany(company.id)
      if (res.error) throw new Error(res.error) // also surfaces the sole-admin guard message
      router.refresh()
    } catch (e: any) {
      alert(e.message || 'Could not leave the team. Please try again.')
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${company.name}"? This cannot be undone. All ${company.followers_count || 0} followers will lose access to this page.`)) return
    try {
      const res = await deleteCompany(company.id)
      if (res.error) throw new Error(res.error)
      router.push('/profile')
      router.refresh()
    } catch (e: any) {
      alert(e.message || 'Could not delete the company page. Please try again.')
    }
  }

  return (
    <div className={styles.pageRoot}>
      <nav className={styles['nav']}>
        <div className={styles['nav-inner']}>
          <Link href="/feed" style={{ fontSize: 11, fontWeight: 600, color: '#86868b', textDecoration: 'none', marginRight: 16 }}>← Drugbox</Link>
          <div className={styles['nav-brand']}>
            <span style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg,#0a1f4d,#1a56db)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{initials(company.name)}</span>
            {company.name}
          </div>
          <div className={styles['nav-links']}>
            <div className={`${styles['nav-link']} ${styles['active']}`}>{t('company.products')}</div>
            <div className={styles['nav-link']}>{t('company.about')}</div>
            <div className={styles['nav-link']}>{t('company.team')}</div>
            <div className={styles['nav-link']}>{t('company.jobs')}</div>
          </div>
          <div className={styles['nav-cta']}><LangSwitch /> <FollowButton companyId={company.id} className={styles['btn-follow-nav']} /></div>
        </div>
      </nav>

      <header className={styles['hero']}>
        <div className={styles['hero-inner']}>
          <div className={styles['hero-logo']}>{initials(company.name)}</div>
          <div className={styles['hero-eyebrow']}>Pharmaceutical manufacturer · {company.location || 'Egypt'}</div>
          <h1 className={styles['hero-title']}>{company.name}</h1>
          <p className={styles['hero-sub']}>{company.tagline || 'Pharmaceutical excellence'}</p>

          {!isManager && !isMember && (
            <div className={styles['hero-actions']}>
              <button className={styles['btn-primary']} onClick={handleMessageCompany}>💬 {t('company.messageCompany')}</button>
              <FollowButton companyId={company.id} className={styles['btn-secondary']} />
            </div>
          )}
          {isMember && (
            <div className={styles['hero-actions']}>
              <button className={styles['btn-secondary']} onClick={handleLeave}>🚪 {t('company.leaveTeam')}</button>
            </div>
          )}
          {isManager && (
            <div className={styles['hero-actions']}>
              <button className={styles['btn-primary']} onClick={() => setShowManage(true)}>⚙️ {t('company.managePage')}</button>
              <button className={styles['btn-secondary']} onClick={handleLeave}>🚪 {t('company.leaveTeam')}</button>
            </div>
          )}
        </div>
        <div className={styles['stat-strip']}>
          <div className={styles['stat']}><div className={styles['stat-n']}>{company.followers_count || 0}</div><div className={styles['stat-l']}>{t('company.followers')}</div></div>
          <div className={styles['stat']}><div className={styles['stat-n']}>{products.length}</div><div className={styles['stat-l']}>{t('company.productsListed')}</div></div>
          <div className={styles['stat']}><div className={styles['stat-n']}>{jobs.length}</div><div className={styles['stat-l']}>{t('company.openRoles')}</div></div>
          <div className={styles['stat']}><div className={styles['stat-n']}>{company.founded_year || '—'}</div><div className={styles['stat-l']}>{t('company.founded')}</div></div>
        </div>
      </header>

      {isManager && (
        <div className={styles['status-banner']}>
          <div className={styles['status-text']}>{t('company.youreA')} <b>{ROLE_LABEL[viewerRole]}</b> {t('company.ofThisPage')}</div>
          <button className={styles['btn-secondary']} style={{ padding: '9px 18px', fontSize: 13 }} onClick={() => setShowManage(true)}>⚙️ {t('company.managePage')}</button>
        </div>
      )}

      <section className={styles['section']} id="products">
        <div className={styles['section-eyebrow']}>{t('nav.marketplace')}</div>
        <h2 className={styles['section-title']}>{t('company.productsListings')}</h2>
        <p className={styles['section-sub']}>{t('company.liveFromListings')}</p>
        <div className={styles['prod-grid']}>
          {products.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{t('company.noActiveListings')}</div>
          ) : (
            products.map((p: any) => (
              <Link href="/marketplace" className={styles['prod-card']} key={p.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className={styles['prod-icon']}>{CAT_ICON[p.category] || '📦'}</div>
                <div className={styles['prod-cat']}>{p.category}</div>
                <div className={styles['prod-name']}>{p.title}</div>
                <div className={styles['prod-price']}>{p.price_amount ? `From $${p.price_amount}${p.price_unit ? ` / ${p.price_unit}` : ''}` : 'Inquire'}</div>
                {p.boosted && <div className={styles['prod-badge']}>⭐ Boosted</div>}
              </Link>
            ))
          )}
        </div>
        <div className={styles['live-note']}>🔗 {t('company.pulledDirectly')}</div>
      </section>

      <section className={styles['section']} id="about">
        <div className={styles['about-split']}>
          <div className={styles['about-visual']}>🏭</div>
          <div>
            <div className={styles['about-eyebrow']}>{t('company.about')}</div>
            <h2 className={styles['about-title']}>{t('company.builtOnPrecision')}</h2>
            <p className={styles['about-body']}>{company.about || 'No description yet.'}</p>
            <div className={styles['about-facts']}>
              {company.address && <div className={styles['fact-row']}><div className={styles['fact-ico']}>📍</div> {company.address}</div>}
              {company.contact_email && <div className={styles['fact-row']}><div className={styles['fact-ico']}>✉️</div> <a href={`mailto:${company.contact_email}`} style={{ color: '#0066CC' }}>{company.contact_email}</a></div>}
              {company.contact_phone && <div className={styles['fact-row']}><div className={styles['fact-ico']}>📞</div> {company.contact_phone}</div>}
              {company.website && <div className={styles['fact-row']}><div className={styles['fact-ico']}>🔗</div> <a href={`https://${company.website}`} style={{ color: '#0066CC' }}>{company.website}</a></div>}
            </div>
          </div>
        </div>
      </section>

      <section className={styles['section']} id="team">
        <div className={styles['section-eyebrow']}>{t('company.leadership')}</div>
        <h2 className={styles['section-title']}>{t('company.theTeamBehind')}</h2>
        <p className={styles['section-sub']}>{t('company.adminsManaging')}</p>
        <div className={styles['team-grid']}>
          {team.map((tm: any) => (
            <div className={styles['team-member']} key={tm.user_id}>
              <div className={styles['team-avatar']} style={{ background: '#1a56db' }}>{tm.member ? initials(tm.member.name) : '?'}</div>
              <div className={styles['team-name']}>{tm.member?.name} {tm.member?.verified && <span style={{ color: '#0066CC', fontSize: 13 }}>✓</span>}</div>
              <div className={styles['team-role']}>{tm.member?.headline || ''}</div>
              <div className={`${styles['team-pill']} ${styles[ROLE_PILL[tm.role] || 'pill-member']}`}>{ROLE_LABEL[tm.role] || tm.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['section']} id="jobs">
        <div className={styles['section-eyebrow']}>{t('company.careers')}</div>
        <h2 className={styles['section-title']}>Open roles at {company.name}</h2>
        <p className={styles['section-sub']}>{jobs.length} positions hiring now — same listings shown on the Jobs page.</p>
        <div className={styles['prod-grid']}>
          {jobs.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{t('company.noOpenRoles')}</div>
          ) : (
            jobs.map((j: any) => (
              <Link href="/jobs" className={styles['prod-card']} key={j.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className={styles['prod-icon']}>📋</div>
                <div className={styles['prod-cat']}>{j.department || 'Open role'}</div>
                <div className={styles['prod-name']}>{j.title}</div>
                <div className={styles['prod-price']}>{j.employment_type || 'Full-time'}</div>
              </Link>
            ))
          )}
        </div>
      </section>

      {showManage && (
        <div className={styles['manage-overlay']} onClick={(e) => { if (e.target === e.currentTarget) setShowManage(false) }}>
          <div className={styles['manage-panel']}>
            <div className={styles['mp-head']}>
              <div className={styles['mp-title']}>{t('company.managePage')}</div>
              <button className={styles['mp-close']} onClick={() => setShowManage(false)}>×</button>
            </div>
            <div className={styles['mp-body']}>
              <label className={styles['mp-label-sm']}>{t('company.tagline')}</label>
              <input className={styles['mp-input']} value={tagline} onChange={(e) => setTagline(e.target.value)} />
              <label className={styles['mp-label-sm']}>{t('company.about')}</label>
              <textarea className={styles['mp-textarea']} value={about} onChange={(e) => setAbout(e.target.value)} />
              <button className={styles['btn-primary']} style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={handleSave} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
              {isAdmin && (
                <div className={styles['danger-zone-mp']}>
                  <div className={styles['danger-zone-mp-title']}>⚠️ {t('company.deletePage')}</div>
                  <div className={styles['danger-zone-mp-desc']}>Removes the page for all {company.followers_count || 0} followers. Products stay listed in Marketplace separately.</div>
                  <button className={styles['btn-danger-mp']} onClick={handleDelete}>{t('company.deleteButton')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
