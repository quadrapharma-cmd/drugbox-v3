'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { contactJobPoster } from '@/actions/jobs'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'

const LEVEL_ICON: Record<string, string> = {
  exec: '👑', senior: '🧭', mid: '🎯', junior: '⚙️', entry: '🌱',
}
function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function JobsApproved({ hiringJobs, seekingJobs, currentUserId }: { hiringJobs: any[]; seekingJobs: any[]; currentUserId: string }) {
  const { t } = useLang()
  const router = useRouter()
  const [mode, setMode] = useState<'hiring' | 'hunting'>('hiring')
  const [level, setLevel] = useState('all')

  async function handleApply(jobId: string) {
    try {
      const res = await contactJobPoster(jobId)
      if (res.error) throw new Error(res.error)
      router.push(`/messages?with=${res.posterId}`)
    } catch (e: any) {
      alert(e.message || 'Could not reach out. Please try again.')
    }
  }

  const filteredHiring = level === 'all' ? hiringJobs : hiringJobs.filter((j) => j.seniority_level === level)
  const filteredSeeking = level === 'all' ? seekingJobs : seekingJobs.filter((j) => j.seniority_level === level)

  return (
    <>
      <div className="topbar">
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className="sw"><span className="si-ic">🔍</span><input className="si" placeholder={t('feed.searchPlaceholder')} /></div>
        <div className="tnav-wrap">
          <Link href="/feed" className="tnav" style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className="tnav" style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className="tnav" style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className="tnav" style={{ textDecoration: 'none' }}>💬</Link>
          <div className="tnav" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className="av" style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>{initials(currentUserId === 'me' ? 'You' : 'U')}</Link>
      </div>

      <div className="hero">
        <div className="hero-content">
          <div>
            <div className="hero-eyebrow">{t('jobs.careers')}</div>
            <div className="hero-title">💼 {t('jobs.title')}</div>
            <div className="hero-sub">{t('jobs.subtitle')}</div>
          </div>
          <div className="mode-toggle">
            <div className={`mode-opt ${mode === 'hiring' ? 'active' : ''}`} onClick={() => setMode('hiring')}>🏢 {t('jobs.imHiring')}</div>
            <div className={`mode-opt ${mode === 'hunting' ? 'active' : ''}`} onClick={() => setMode('hunting')}>👤 {t('jobs.imJobSeeking')}</div>
          </div>
        </div>
      </div>

      <div className="intel-strip">
        <div className="intel-item"><span className="intel-dot"></span> <b>{hiringJobs.length}</b> open positions across Egypt &amp; GCC</div>
        <div className="intel-item">💼 <b>{hiringJobs.length}</b> jobs posted this week</div>
        <div className="intel-item">👤 <b>{seekingJobs.length}</b> candidates available now</div>
      </div>

      <div className="cat-filter">
        <div className="cf-tag on">{t('jobs.allJobs')}</div>
        <div className="cf-tag">📋 Regulatory</div>
        <div className="cf-tag">🔬 QA/QC</div>
        <div className="cf-tag">🏭 Production</div>
        <div className="cf-tag">📦 Supply Chain</div>
        <div className="cf-tag">📈 Sales &amp; Marketing</div>
        <div className="cf-tag">🩺 Medical Rep</div>
        <div className="cf-tag">🧪 R&amp;D / Formulation</div>
      </div>

      <div className="layout">
        <div className="filters">
          <div className="f-hdr">{t('jobs.employmentType')}</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> {t('jobs.fullTime')}</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> {t('jobs.contract')}</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> {t('jobs.partTime')}</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> {t('jobs.remote')}</div>
          <div className="fdiv"></div>
          <div className="f-hdr">{t('jobs.country')}</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> 🇪🇬 Egypt</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> 🇦🇪 UAE</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> 🇸🇦 Saudi Arabia</div>
          <div className="f-opt"><input type="checkbox" defaultChecked /> 🇮🇳 India</div>
          <div className="fdiv"></div>
          <div className="f-hdr">Seniority Level</div>
          <div className="seniority-list">
            {['all', 'exec', 'senior', 'mid', 'junior', 'entry'].map((lv) => (
              <div key={lv} className={`sen-opt ${level === lv ? 'on' : ''}`} onClick={() => setLevel(lv)}>
                {lv === 'all' ? t('jobs.allLevels') : `${LEVEL_ICON[lv]} ${t(('level.' + lv) as any)}`}
              </div>
            ))}
          </div>
        </div>

        <div className="main">
          {mode === 'hiring' ? (
            <div>
              <div className="post-cta">
                <div className="post-cta-text"><div className="post-cta-title">📢 {t('jobs.hiringForTeam')}</div><div className="post-cta-sub">{t('jobs.reachPros')}</div></div>
                <Link href="/marketplace" className="post-cta-btn" style={{ textDecoration: 'none' }}>➕ {t('jobs.postAJob')}</Link>
              </div>
              <div className="sec-hdr"><div><div className="sec-title">{t('jobs.openPositionsHeader')} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{filteredHiring.length} jobs</span></div><div className="sec-sub">{t('jobs.sortedRecent')}</div></div></div>
              <div className="job-list">
                {filteredHiring.length === 0 ? (
                  <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>{t('jobs.noPositions')}</div>
                ) : (
                  filteredHiring.map((j: any) => (
                    <div className="jcard" key={j.id}>
                      <div className="jc-logo" style={{ background: '#1a56db' }}>{initials(j.poster?.company || j.poster?.name || '?')}</div>
                      <div className="jc-body">
                        <div className="jc-title">
                          <span className="role-badge have">🏢 {t('jobs.hiring')}</span>
                          {j.seniority_level && <span className={`level-badge level-${j.seniority_level}`}>{LEVEL_ICON[j.seniority_level]} {t(('level.' + j.seniority_level) as any)}</span>}
                          {j.title}
                        </div>
                        <div className="jc-company">
                          {j.company_id ? <Link href="/company" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>{j.poster?.company}</Link> : <span style={{ fontWeight: 700, color: '#0f172a' }}>{j.poster?.company || j.poster?.name}</span>}
                          {' · '}<span>{j.poster?.country || ''}</span>{j.poster?.verified && <> · <span style={{ color: '#1a56db' }}>✓ Verified</span></>}
                        </div>
                        <div className="jc-tags">
                          {j.employment_type && <span className="jt jt-ft">{j.employment_type}</span>}
                          {j.department && <span className="jt" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{j.department}</span>}
                        </div>
                        <div className="jc-desc">{j.description || ''}</div>
                      </div>
                      <div className="jc-right">
                        <div className="jc-posted">{j.created_at ? new Date(j.created_at).toLocaleDateString() : ''}</div>
                        {j.user_id !== currentUserId && <button className="apply-btn" onClick={() => handleApply(j.id)}>{t('jobs.applyNow')} →</button>}
                        <button className="save-btn">🔖 {t('mk.save')}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="post-cta" style={{ background: 'linear-gradient(135deg,#7c2d12,#c2410c)' }}>
                <div className="post-cta-text"><div className="post-cta-title">📄 {t('jobs.lookingForRole')}</div><div className="post-cta-sub">{t('jobs.postProfileSub')}</div></div>
                <Link href="/marketplace" className="post-cta-btn" style={{ color: '#7c2d12', textDecoration: 'none' }}>➕ {t('jobs.postMyProfile')}</Link>
              </div>
              <div className="sec-hdr"><div><div className="sec-title">{t('jobs.availableCandidates')} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{filteredSeeking.length} profiles</span></div><div className="sec-sub">{t('jobs.verifiedLooking')}</div></div></div>
              <div className="candidate-list">
                {filteredSeeking.length === 0 ? (
                  <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>{t('jobs.noCandidates')}</div>
                ) : (
                  filteredSeeking.map((j: any) => (
                    <div className="ccard" key={j.id}>
                      <div className="ccard-avatar" style={{ background: '#7A5680' }}>{initials(j.poster?.name || '?')}<div className="ccard-availability"></div></div>
                      <div className="ccard-body">
                        <div className="ccard-name">{j.poster?.name} {j.poster?.verified && <span style={{ color: '#1a56db', fontSize: 11 }}>✓</span>}</div>
                        <div className="ccard-role">{j.title}</div>
                        <div className="ccard-meta">{j.poster?.country || ''} {j.poster?.company ? `· ${j.poster.company}` : ''}</div>
                        <div className="ccard-stats">
                          <div className="ccard-stat"><b>{j.seniority_level ? t(('level.' + j.seniority_level) as any) : '—'}</b>{t('jobs.seniority')}</div>
                          <div className="ccard-stat"><b>{j.employment_type || t('jobs.fullTime')}</b>{t('jobs.seeking')}</div>
                        </div>
                      </div>
                      <div className="ccard-right">
                        <div className="availability-badge">🟢 {t('jobs.availableNow')}</div>
                        {j.user_id !== currentUserId && <button className="apply-btn contact" onClick={() => handleApply(j.id)}>{t('jobs.contact')} →</button>}
                        <button className="save-btn">🔖 {t('mk.save')}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
