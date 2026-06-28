'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateCompany, leaveCompany, deleteCompany } from '@/actions/company'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
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
  const companyAdmin = team.find((t: any) => t.role === 'admin')
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
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/feed" style={{ fontSize: 11, fontWeight: 600, color: '#86868b', textDecoration: 'none', marginRight: 16 }}>← Drugbox</Link>
          <div className="nav-brand">
            <span style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg,#0a1f4d,#1a56db)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{initials(company.name)}</span>
            {company.name}
          </div>
          <div className="nav-links">
            <div className="nav-link active">{t('company.products')}</div>
            <div className="nav-link">{t('company.about')}</div>
            <div className="nav-link">{t('company.team')}</div>
            <div className="nav-link">{t('company.jobs')}</div>
          </div>
          <div className="nav-cta"><LangSwitch /> <FollowButton companyId={company.id} className="btn-follow-nav" /></div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-inner">
          <div className="hero-logo">{initials(company.name)}</div>
          <div className="hero-eyebrow">Pharmaceutical manufacturer · {company.location || 'Egypt'}</div>
          <h1 className="hero-title">{company.name}</h1>
          <p className="hero-sub">{company.tagline || 'Pharmaceutical excellence'}</p>

          {!isManager && !isMember && (
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleMessageCompany}>💬 {t('company.messageCompany')}</button>
              <FollowButton companyId={company.id} className="btn-secondary" />
            </div>
          )}
          {isMember && (
            <div className="hero-actions">
              <button className="btn-secondary" onClick={handleLeave}>🚪 {t('company.leaveTeam')}</button>
            </div>
          )}
          {isManager && (
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setShowManage(true)}>⚙️ {t('company.managePage')}</button>
              <button className="btn-secondary" onClick={handleLeave}>🚪 {t('company.leaveTeam')}</button>
            </div>
          )}
        </div>
        <div className="stat-strip">
          <div className="stat"><div className="stat-n">{company.followers_count || 0}</div><div className="stat-l">{t('company.followers')}</div></div>
          <div className="stat"><div className="stat-n">{products.length}</div><div className="stat-l">{t('company.productsListed')}</div></div>
          <div className="stat"><div className="stat-n">{jobs.length}</div><div className="stat-l">{t('company.openRoles')}</div></div>
          <div className="stat"><div className="stat-n">{company.founded_year || '—'}</div><div className="stat-l">{t('company.founded')}</div></div>
        </div>
      </header>

      {isManager && (
        <div className="status-banner">
          <div className="status-text">{t('company.youreA')} <b>{ROLE_LABEL[viewerRole]}</b> {t('company.ofThisPage')}</div>
          <button className="btn-secondary" style={{ padding: '9px 18px', fontSize: 13 }} onClick={() => setShowManage(true)}>⚙️ {t('company.managePage')}</button>
        </div>
      )}

      <section className="section" id="products">
        <div className="section-eyebrow">{t('nav.marketplace')}</div>
        <h2 className="section-title">{t('company.productsListings')}</h2>
        <p className="section-sub">{t('company.liveFromListings')}</p>
        <div className="prod-grid">
          {products.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{t('company.noActiveListings')}</div>
          ) : (
            products.map((p: any) => (
              <Link href="/marketplace" className="prod-card" key={p.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="prod-icon">{CAT_ICON[p.category] || '📦'}</div>
                <div className="prod-cat">{p.category}</div>
                <div className="prod-name">{p.title}</div>
                <div className="prod-price">{p.price_amount ? `From $${p.price_amount}${p.price_unit ? ` / ${p.price_unit}` : ''}` : 'Inquire'}</div>
                {p.boosted && <div className="prod-badge">⭐ Boosted</div>}
              </Link>
            ))
          )}
        </div>
        <div className="live-note">🔗 {t('company.pulledDirectly')}</div>
      </section>

      <section className="section" id="about">
        <div className="about-split">
          <div className="about-visual">🏭</div>
          <div>
            <div className="about-eyebrow">{t('company.about')}</div>
            <h2 className="about-title">{t('company.builtOnPrecision')}</h2>
            <p className="about-body">{company.about || 'No description yet.'}</p>
            <div className="about-facts">
              {company.address && <div className="fact-row"><div className="fact-ico">📍</div> {company.address}</div>}
              {company.contact_email && <div className="fact-row"><div className="fact-ico">✉️</div> <a href={`mailto:${company.contact_email}`} style={{ color: '#0066CC' }}>{company.contact_email}</a></div>}
              {company.contact_phone && <div className="fact-row"><div className="fact-ico">📞</div> {company.contact_phone}</div>}
              {company.website && <div className="fact-row"><div className="fact-ico">🔗</div> <a href={`https://${company.website}`} style={{ color: '#0066CC' }}>{company.website}</a></div>}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="team">
        <div className="section-eyebrow">{t('company.leadership')}</div>
        <h2 className="section-title">{t('company.theTeamBehind')}</h2>
        <p className="section-sub">{t('company.adminsManaging')}</p>
        <div className="team-grid">
          {team.map((t: any) => (
            <div className="team-member" key={t.user_id}>
              <div className="team-avatar" style={{ background: '#1a56db' }}>{t.member ? initials(t.member.name) : '?'}</div>
              <div className="team-name">{t.member?.name} {t.member?.verified && <span style={{ color: '#0066CC', fontSize: 13 }}>✓</span>}</div>
              <div className="team-role">{t.member?.headline || ''}</div>
              <div className={`team-pill ${ROLE_PILL[t.role] || 'pill-member'}`}>{ROLE_LABEL[t.role] || t.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="jobs">
        <div className="section-eyebrow">{t('company.careers')}</div>
        <h2 className="section-title">Open roles at {company.name}</h2>
        <p className="section-sub">{jobs.length} positions hiring now — same listings shown on the Jobs page.</p>
        <div className="prod-grid">
          {jobs.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{t('company.noOpenRoles')}</div>
          ) : (
            jobs.map((j: any) => (
              <Link href="/jobs" className="prod-card" key={j.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="prod-icon">📋</div>
                <div className="prod-cat">{j.department || 'Open role'}</div>
                <div className="prod-name">{j.title}</div>
                <div className="prod-price">{j.employment_type || 'Full-time'}</div>
              </Link>
            ))
          )}
        </div>
      </section>

      {showManage && (
        <div className="manage-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowManage(false) }}>
          <div className="manage-panel">
            <div className="mp-head">
              <div className="mp-title">{t('company.managePage')}</div>
              <button className="mp-close" onClick={() => setShowManage(false)}>×</button>
            </div>
            <div className="mp-body">
              <label className="mp-label-sm">{t('company.tagline')}</label>
              <input className="mp-input" value={tagline} onChange={(e) => setTagline(e.target.value)} />
              <label className="mp-label-sm">{t('company.about')}</label>
              <textarea className="mp-textarea" value={about} onChange={(e) => setAbout(e.target.value)} />
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={handleSave} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
              {isAdmin && (
                <div className="danger-zone-mp">
                  <div className="danger-zone-mp-title">⚠️ {t('company.deletePage')}</div>
                  <div className="danger-zone-mp-desc">Removes the page for all {company.followers_count || 0} followers. Products stay listed in Marketplace separately.</div>
                  <button className="btn-danger-mp" onClick={handleDelete}>{t('company.deleteButton')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
