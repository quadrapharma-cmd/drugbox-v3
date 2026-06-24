'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangToggle from '@/components/LangToggle'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Splash: play intro video, then fade to login. Safety timer in case video fails.
  useEffect(() => {
    const v = videoRef.current
    if (!v) {
      setShowSplash(false)
      return
    }
    const end = () => setShowSplash(false)
    v.addEventListener('ended', end)
    const fallback = setTimeout(end, 5000) // safety: never trap the user on the splash
    return () => {
      v.removeEventListener('ended', end)
      clearTimeout(fallback)
    }
  }, [])

  async function handleLogin() {
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/feed')
    router.refresh()
  }

  return (
    <>
      {showSplash && (
        <div className={styles.splash}>
          <video
            ref={videoRef}
            className={styles.splashVideo}
            autoPlay
            muted
            playsInline
          >
            <source src="/intro-video.mp4" type="video/mp4" />
          </video>
          <div className={styles.splashOverlay} />
          <button className={styles.skipBtn} onClick={() => setShowSplash(false)}>
            Skip →
          </button>
          <div className={styles.splashBrand}>
            <div className={styles.splashBrandText}>DRUGBOX</div>
            <div className={styles.splashBrandTag}>Pharma Professional Network</div>
          </div>
        </div>
      )}
      <div className={styles.wrap}>
      {/* HERO SIDE */}
      <div className={styles.hero}>
        <div className={styles.dbOverlay} />
        <div className={styles.dbContent}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>
              DRUGBOX
            </div>
            <div className={styles.dbTagline}>Pharma Professional Network</div>
          </div>
          <div className={styles.dbH1}>
            The professional network for the pharmaceutical industry
          </div>
          <div className={styles.dbP}>
            Connect with manufacturers, suppliers, and regulatory experts across Egypt, the
            GCC, and Africa.
          </div>
          <div className={styles.dbFeat}>
            <div className={styles.dbFic}>🛒</div>
            <span>Source APIs, excipients, and equipment</span>
          </div>
          <div className={styles.dbFeat}>
            <div className={styles.dbFic}>🤝</div>
            <span>Build verified professional connections</span>
          </div>
          <div className={styles.dbFeat}>
            <div className={styles.dbFic}>📋</div>
            <span>Stay ahead on regulatory developments</span>
          </div>
          <div className={styles.dbStats}>
            <div>
              <div className={styles.dbSn}>150K+</div>
              <div className={styles.dbSl}>Professionals</div>
            </div>
            <div>
              <div className={styles.dbSn}>20+</div>
              <div className={styles.dbSl}>Countries</div>
            </div>
            <div>
              <div className={styles.dbSn}>8</div>
              <div className={styles.dbSl}>Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM SIDE */}
      <div className={styles.dbForm}>
        <div className={styles.dbBox}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <LangToggle compact />
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1a56db', letterSpacing: 1, marginBottom: 16 }}>
            DRUGBOX
          </div>
          <div className={styles.dbFtitle}>{t('auth.welcomeBack')}</div>
          <div className={styles.dbFsub}>{t('auth.signinSub')}</div>

          {error && <div className={styles.dbErr}>{error}</div>}

          <div className={styles.dbField}>
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="you@company.com"
            />
          </div>
          <div className={styles.dbField}>
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
            />
          </div>
          <button className={styles.dbBtn} onClick={handleLogin} disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>

          <div className={styles.dbDemo}>
            <div className="lbl" style={{ fontSize: 10, color: '#1a56db', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{t('auth.demoAccount')}</div>
            <div className="val" style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: 1.6 }}>
              haytham@drugbox.app
              <br />
              Drugbox2026!
            </div>
          </div>

          <div className={styles.dbFooter}>
            {t('auth.noAccount')} <Link href="/signup">{t('auth.createOne')}</Link>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
