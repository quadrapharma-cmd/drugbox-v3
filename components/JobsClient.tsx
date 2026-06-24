'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getJobs, contactJobPoster } from '@/actions/jobs'
import styles from '@/app/jobs/jobs.module.css'

const SENIORITY = [
  { key: 'all', label: 'All Levels' },
  { key: 'exec', label: '👔 Executive' },
  { key: 'senior', label: '🧭 Senior Mgmt' },
  { key: 'mid', label: '🎯 Mid-Level' },
  { key: 'junior', label: '🌿 Junior' },
  { key: 'entry', label: '🌱 Entry Level' },
]
const LEVEL_STYLE: Record<string, string> = {
  exec: styles.levelExec, senior: styles.levelSenior, mid: styles.levelMid,
  junior: styles.levelJunior, entry: styles.levelEntry,
}
const LEVEL_LABEL: Record<string, string> = {
  exec: '👔 Executive', senior: '🧭 Senior Mgmt', mid: '🎯 Mid-Level',
  junior: '🌿 Junior', entry: '🌱 Entry Level',
}
const EMP_LABEL: Record<string, string> = {
  fulltime: 'Full-time', parttime: 'Part-time', contract: 'Contract', remote: 'Remote',
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function JobsClient({ initialJobs, currentUserId }: { initialJobs: any[]; currentUserId: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<'offering' | 'seeking'>('offering') // hiring vs job-seeking
  const [seniority, setSeniority] = useState('all')
  const [jobs, setJobs] = useState<any[]>(initialJobs)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async (newMode: string, newSeniority: string) => {
    setLoading(true)
    const res = await getJobs({ role: newMode, seniority: newSeniority })
    if (!res.error) setJobs(res.jobs)
    setLoading(false)
  }, [])

  function handleMode(m: 'offering' | 'seeking') {
    setMode(m)
    reload(m, seniority)
  }
  function handleSeniority(s: string) {
    setSeniority(s)
    reload(mode, s)
  }

  async function handleContact(jobId: string) {
    const res = await contactJobPoster(jobId)
    if (res.error) { alert(res.error); return }
    router.push('/messages')
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.pageTitle}>Jobs</div>
          <div className={styles.pageDesc}>Pharmaceutical industry opportunities across MENA</div>
        </div>
        <Link href="/marketplace" className={styles.btnPrimary} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          + Post a Job
        </Link>
      </div>

      <div className={styles.modeToggle}>
        <button className={`${styles.modeBtn} ${mode === 'offering' ? styles.on : ''}`} onClick={() => handleMode('offering')}>
          🏢 Hiring
        </button>
        <button className={`${styles.modeBtn} ${mode === 'seeking' ? styles.on : ''}`} onClick={() => handleMode('seeking')}>
          🔍 Looking for a Job
        </button>
      </div>

      <div className={styles.filters}>
        {SENIORITY.map((s) => (
          <button key={s.key} className={`${styles.chip} ${seniority === s.key ? styles.active : ''}`} onClick={() => handleSeniority(s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div className={styles.empty}>💼 No {mode === 'offering' ? 'job postings' : 'job seekers'} in this category yet</div>
        ) : (
          jobs.map((j) => (
            <div key={j.id} className={styles.jcard}>
              <div className={styles.jcLogo}>{initials(j.poster?.company || j.poster?.name || '?')}</div>
              <div className={styles.jcBody}>
                <div className={styles.jcTitle}>
                  <span className={`${styles.roleBadge} ${j.role === 'offering' ? styles.roleHiring : styles.roleSeeking}`}>
                    {j.role === 'offering' ? '🏢 Hiring' : '🔍 Seeking'}
                  </span>
                  {j.seniority_level && (
                    <span className={`${styles.levelBadge} ${LEVEL_STYLE[j.seniority_level] || ''}`}>
                      {LEVEL_LABEL[j.seniority_level] || j.seniority_level}
                    </span>
                  )}
                  {j.title}
                </div>
                <div className={styles.jcCompany}>
                  {j.company_id ? (
                    <Link href="/company" style={{ color: '#0f172a', fontWeight: 700 }}>{j.poster?.company}</Link>
                  ) : (
                    j.poster?.company || j.poster?.name
                  )}
                  {j.poster?.verified && <span style={{ color: '#1a56db' }}> ✓</span>}
                  {j.department ? ` · ${j.department}` : ''}
                </div>
                <div className={styles.jcTags}>
                  {j.employment_type && <span className={styles.jt}>{EMP_LABEL[j.employment_type] || j.employment_type}</span>}
                </div>
              </div>
              <div className={styles.jcAction}>
                {j.user_id !== currentUserId && (
                  <button className={styles.contactBtn} onClick={() => handleContact(j.id)}>Contact</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
