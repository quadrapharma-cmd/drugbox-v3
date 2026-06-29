'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { contactJobPoster } from '@/actions/jobs'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import styles from '@/app/jobs/jobs-approved.module.css'

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
      <div className={styles['topbar']}>
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className={styles['sw']}><span className={styles['si-ic']}>🔍</span><input className={styles['si']} placeholder={t('feed.searchPlaceholder')} /></div>
        <div className={styles['tnav-wrap']}>
          <Link href="/feed" className={styles['tnav']} style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className={styles['tnav']} style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className={styles['tnav']} style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className={styles['tnav']} style={{ textDecoration: 'none' }}>💬</Link>
          <div className={styles['tnav']} style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className={styles['av']} style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>{initials(currentUserId === 'me' ? 'You' : 'U')}</Link>
      </div>

      <div className={styles['hero']}>
        <div className={styles['hero-content']}>
          <div>
            <div className={styles['hero-eyebrow']}>{t('jobs.careers')}</div>
            <div className={styles['hero-title']}>💼 {t('jobs.title')}</div>
            <div className={styles['hero-sub']}>{t('jobs.subtitle')}</div>
          </div>
          <div className={styles['mode-toggle']}>
            <div className={`${styles['mode-opt']} ${mode === 'hiring' ? styles['active'] : ''}`} onClick={() => setMode('hiring')}>🏢 {t('jobs.imHiring')}</div>
            <div className={`${styles['mode-opt']} ${mode === 'hunting' ? styles['active'] : ''}`} onClick={() => setMode('hunting')}>👤 {t('jobs.imJobSeeking')}</div>
          </div>
        </div>
      </div>

      <div className={styles['intel-strip']}>
        <div className={styles['intel-item']}><span className={styles['intel-dot']}></span> <b>{hiringJobs.length}</b> open positions across Egypt &amp; GCC</div>
        <div className={styles['intel-item']}>💼 <b>{hiringJobs.length}</b> jobs posted this week</div>
        <div className={styles['intel-item']}>👤 <b>{seekingJobs.length}</b> candidates available now</div>
      </div>

      <div className={styles['cat-filter']}>
        <div className={`${styles['cf-tag']} ${styles['on']}`}>{t('jobs.allJobs')}</div>
        <div className={styles['cf-tag']}>📋 Regulatory</div>
        <div className={styles['cf-tag']}>🔬 QA/QC</div>
        <div className={styles['cf-tag']}>🏭 Production</div>
        <div className={styles['cf-tag']}>📦 Supply Chain</div>
        <div className={styles['cf-tag']}>📈 Sales &amp; Marketing</div>
        <div className={styles['cf-tag']}>🩺 Medical Rep</div>
        <div className={styles['cf-tag']}>🧪 R&amp;D / Formulation</div>
      </div>

      <div className={styles['layout']}>
        <div className={styles['filters']}>
          <div className={styles['f-hdr']}>{t('jobs.employmentType')}</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> {t('jobs.fullTime')}</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> {t('jobs.contract')}</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> {t('jobs.partTime')}</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> {t('jobs.remote')}</div>
          <div className={styles['fdiv']}></div>
          <div className={styles['f-hdr']}>{t('jobs.country')}</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🇪🇬 Egypt</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🇦🇪 UAE</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🇸🇦 Saudi Arabia</div>
          <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🇮🇳 India</div>
          <div className={styles['fdiv']}></div>
          <div className={styles['f-hdr']}>Seniority Level</div>
          <div className={styles['seniority-list']}>
            {['all', 'exec', 'senior', 'mid', 'junior', 'entry'].map((lv) => (
              <div key={lv} className={`${styles['sen-opt']} ${level === lv ? styles['on'] : ''}`} onClick={() => setLevel(lv)}>
                {lv === 'all' ? t('jobs.allLevels') : `${LEVEL_ICON[lv]} ${t(('level.' + lv) as any)}`}
              </div>
            ))}
          </div>
        </div>

        <div className={styles['main']}>
          {mode === 'hiring' ? (
            <div>
              <div className={styles['post-cta']}>
                <div className={styles['post-cta-text']}><div className={styles['post-cta-title']}>📢 {t('jobs.hiringForTeam')}</div><div className={styles['post-cta-sub']}>{t('jobs.reachPros')}</div></div>
                <Link href="/marketplace" className={styles['post-cta-btn']} style={{ textDecoration: 'none' }}>➕ {t('jobs.postAJob')}</Link>
              </div>
              <div className={styles['sec-hdr']}><div><div className={styles['sec-title']}>{t('jobs.openPositionsHeader')} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{filteredHiring.length} jobs</span></div><div className={styles['sec-sub']}>{t('jobs.sortedRecent')}</div></div></div>
              <div className={styles['job-list']}>
                {filteredHiring.length === 0 ? (
                  <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>{t('jobs.noPositions')}</div>
                ) : (
                  filteredHiring.map((j: any) => (
                    <div className={styles['jcard']} key={j.id}>
                      <div className={styles['jc-logo']} style={{ background: '#1a56db' }}>{initials(j.poster?.company || j.poster?.name || '?')}</div>
                      <div className={styles['jc-body']}>
                        <div className={styles['jc-title']}>
                          <span className={`${styles['role-badge']} ${styles['have']}`}>🏢 {t('jobs.hiring')}</span>
                          {j.seniority_level && <span className={`${styles['level-badge']} ${styles['level-' + j.seniority_level]}`}>{LEVEL_ICON[j.seniority_level]} {t(('level.' + j.seniority_level) as any)}</span>}
                          {j.title}
                        </div>
                        <div className={styles['jc-company']}>
                          {j.company_id ? <Link href="/company" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>{j.poster?.company}</Link> : <span style={{ fontWeight: 700, color: '#0f172a' }}>{j.poster?.company || j.poster?.name}</span>}
                          {' · '}<span>{j.poster?.country || ''}</span>{j.poster?.verified && <> · <span style={{ color: '#1a56db' }}>✓ Verified</span></>}
                        </div>
                        <div className={styles['jc-tags']}>
                          {j.employment_type && <span className={`${styles['jt']} ${styles['jt-ft']}`}>{j.employment_type}</span>}
                          {j.department && <span className={styles['jt']} style={{ background: '#dbeafe', color: '#1d4ed8' }}>{j.department}</span>}
                        </div>
                        <div className={styles['jc-desc']}>{j.description || ''}</div>
                      </div>
                      <div className={styles['jc-right']}>
                        <div className={styles['jc-posted']}>{j.created_at ? new Date(j.created_at).toLocaleDateString() : ''}</div>
                        {j.user_id !== currentUserId && <button className={styles['apply-btn']} onClick={() => handleApply(j.id)}>{t('jobs.applyNow')} →</button>}
                        <button className={styles['save-btn']}>🔖 {t('mk.save')}</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className={styles['post-cta']} style={{ background: 'linear-gradient(135deg,#7c2d12,#c2410c)' }}>
                <div className={styles['post-cta-text']}><div className={styles['post-cta-title']}>📄 {t('jobs.lookingForRole')}</div><div className={styles['post-cta-sub']}>{t('jobs.postProfileSub')}</div></div>
                <Link href="/marketplace" className={styles['post-cta-btn']} style={{ color: '#7c2d12', textDecoration: 'none' }}>➕ {t('jobs.postMyProfile')}</Link>
              </div>
              <div className={styles['sec-hdr']}><div><div className={styles['sec-title']}>{t('jobs.availableCandidates')} <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{filteredSeeking.length} profiles</span></div><div className={styles['sec-sub']}>{t('jobs.verifiedLooking')}</div></div></div>
              <div className={styles['candidate-list']}>
                {filteredSeeking.length === 0 ? (
                  <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>{t('jobs.noCandidates')}</div>
                ) : (
                  filteredSeeking.map((j: any) => (
                    <div className={styles['ccard']} key={j.id}>
                      <div className={styles['ccard-avatar']} style={{ background: '#7A5680' }}>{initials(j.poster?.name || '?')}<div className={styles['ccard-availability']}></div></div>
                      <div className={styles['ccard-body']}>
                        <div className={styles['ccard-name']}>{j.poster?.name} {j.poster?.verified && <span style={{ color: '#1a56db', fontSize: 11 }}>✓</span>}</div>
                        <div className={styles['ccard-role']}>{j.title}</div>
                        <div className={styles['ccard-meta']}>{j.poster?.country || ''} {j.poster?.company ? `· ${j.poster.company}` : ''}</div>
                        <div className={styles['ccard-stats']}>
                          <div className={styles['ccard-stat']}><b>{j.seniority_level ? t(('level.' + j.seniority_level) as any) : '—'}</b>{t('jobs.seniority')}</div>
                          <div className={styles['ccard-stat']}><b>{j.employment_type || t('jobs.fullTime')}</b>{t('jobs.seeking')}</div>
                        </div>
                      </div>
                      <div className={styles['ccard-right']}>
                        <div className={styles['availability-badge']}>🟢 {t('jobs.availableNow')}</div>
                        {j.user_id !== currentUserId && <button className={`${styles['apply-btn']} ${styles['contact']}`} onClick={() => handleApply(j.id)}>{t('jobs.contact')} →</button>}
                        <button className={styles['save-btn']}>🔖 {t('mk.save')}</button>
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
