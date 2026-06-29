'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import styles from '@/app/login/login-approved.module.css'


export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLang()
  const [email, setEmail] = useState('haytham@drugbox.app')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [splashEnded, setSplashEnded] = useState(false)
  const endedRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function endSplash() {
    if (endedRef.current) return
    endedRef.current = true
    setSplashEnded(true)
  }

  useEffect(() => {
    const timer = setTimeout(endSplash, 5500)
    return () => clearTimeout(timer)
  }, [])

  async function handleSignIn() {
    if (!email || !password) { setError('Please enter your email and password'); return }
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) { setError(signInError.message); return }
    router.push('/feed')
    router.refresh()
  }

  return (
    <>
      <div id="splashScreen" className={splashEnded ? styles['fade-out'] : ''} style={splashEnded ? { display: 'none' } : {}}>
        <video id="introVideo" autoPlay muted playsInline ref={videoRef} onEnded={endSplash}>
          <source src="/intro-video.mp4" type="video/mp4" />
        </video>
        <div className={styles['splash-overlay']}></div>
        <button className={styles['skip-btn']} onClick={endSplash}>{t('auth.skip')} →</button>
        <div className={styles['splash-brand']}>
          <div className={styles['splash-brand-text']}>DRUGBOX</div>
          <div className={styles['splash-tagline']}>{t('auth.tagline')}</div>
        </div>
      </div>

      <div id="loginPage" className={splashEnded ? styles['show'] : ''}>
        <div className={styles['hero']}>
          <div className={styles['db-overlay']}></div>
          <div className={styles['db-content']}>
            <div className={styles['db-brand']}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>DRUGBOX</div>
              <div className={styles['db-tagline']}>{t('auth.tagline')}</div>
            </div>
            <div className={styles['db-h1']}>{t('auth.heroLogin')}</div>
            <div className={styles['db-p']}>{t('auth.heroSub')}</div>
            <div className={styles['db-feat']}><div className={styles['db-fic']}>⚗️</div><span>{t('auth.feat1')}</span></div>
            <div className={styles['db-feat']}><div className={styles['db-fic']}>📋</div><span>{t('auth.feat2')}</span></div>
            <div className={styles['db-feat']}><div className={styles['db-fic']}>🏭</div><span>{t('auth.feat3')}</span></div>
            <div className={styles['db-feat']}><div className={styles['db-fic']}>💼</div><span>{t('auth.feat4')}</span></div>
            <div className={styles['db-feat']}><div className={styles['db-fic']}>🎓</div><span>{t('auth.feat5')}</span></div>
            <div className={styles['db-stats']}>
              <div><div className={styles['db-sn']}>150K+</div><div className={styles['db-sl']}>{t('auth.statPros')}</div></div>
              <div><div className={styles['db-sn']}>1,200+</div><div className={styles['db-sl']}>{t('auth.statListings')}</div></div>
              <div><div className={styles['db-sn']}>18</div><div className={styles['db-sl']}>{t('auth.statCountries')}</div></div>
            </div>
          </div>
        </div>

        <div className={styles['db-form']}>
          <div className={styles['db-box']}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}><LangSwitch /></div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1a56db', marginBottom: 6 }}>DRUGBOX</div>
            <div className={styles['db-ftitle']}>{t('auth.welcomeBack')}</div>
            <div className={styles['db-fsub']}>{t('auth.signInSub')}</div>
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <div className={styles['db-field']}><label>{t('auth.email')}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSignIn()} placeholder="you@company.com" /></div>
            <div className={styles['db-field']}><label>{t('auth.password')}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSignIn()} placeholder="••••••••" /></div>
            <button className={styles['db-btn']} onClick={handleSignIn} disabled={loading}>{loading ? t('auth.signingIn') : t('auth.signIn')}</button>
            <div className={styles['db-footer']}>{t('auth.noAccount')} <Link href="/signup">{t('auth.createOne')}</Link></div>
            <div className={styles['db-demo']}>
              <div className={styles['lbl']}>{t('auth.demoAccount')}</div>
              <div className={styles['val']}>haytham@drugbox.app<br />Drugbox2026!</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
