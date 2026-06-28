'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import '../login/login-approved.css'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLang()
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    if (!name || !email || !password) { setError('Name, email, and password are required'); return }
    if (!agreed) { setError('Please agree to the User Agreement to continue'); return }
    setLoading(true)
    setError('')
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, headline, company } },
    })
    setLoading(false)
    if (signUpError) { setError(signUpError.message); return }
    router.push('/feed')
    router.refresh()
  }

  return (
    <div id="loginPage" className="show">
      <div className="hero">
        <div className="db-overlay"></div>
        <div className="db-content">
          <div className="db-brand">
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>DRUGBOX</div>
            <div className="db-tagline">{t('auth.tagline')}</div>
          </div>
          <div className="db-h1">{t('auth.heroSignup')}</div>
          <div className="db-p">{t('auth.heroSub')}</div>
          <div className="db-feat"><div className="db-fic">⚗️</div><span>{t('auth.feat1')}</span></div>
          <div className="db-feat"><div className="db-fic">📋</div><span>{t('auth.feat2')}</span></div>
          <div className="db-feat"><div className="db-fic">🏭</div><span>{t('auth.feat3')}</span></div>
          <div className="db-stats">
            <div><div className="db-sn">150K+</div><div className="db-sl">{t('auth.statPros')}</div></div>
            <div><div className="db-sn">1,200+</div><div className="db-sl">{t('auth.statListings')}</div></div>
            <div><div className="db-sn">18</div><div className="db-sl">{t('auth.statCountries')}</div></div>
          </div>
        </div>
      </div>

      <div className="db-form">
        <div className="db-box">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}><LangSwitch /></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1a56db', marginBottom: 6 }}>DRUGBOX</div>
          <div className="db-ftitle">{t('auth.createAccount')}</div>
          <div className="db-fsub">{t('auth.joinSub')}</div>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <div className="db-field"><label>{t('auth.fullName')}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" /></div>
          <div className="db-field"><label>{t('auth.headline')}</label><input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Regulatory Affairs Manager" /></div>
          <div className="db-field"><label>{t('auth.company')}</label><input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Pharma" /></div>
          <div className="db-field"><label>{t('auth.email')}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></div>
          <div className="db-field"><label>{t('auth.password')}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '4px 0 14px' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
            <label style={{ fontSize: 12.5, color: '#3c3c41', lineHeight: 1.5 }}>
              {t('auth.agreeToThe')} <Link href="/terms" style={{ color: '#1a56db', fontWeight: 700 }}>{t('auth.userAgreement')}</Link>
            </label>
          </div>
          <button className="db-btn" onClick={handleSignup} disabled={loading}>{loading ? t('auth.creating') : t('auth.createAccountBtn')}</button>
          <div className="db-footer">{t('auth.alreadyHaveAccount')} <Link href="/login">{t('auth.signin')}</Link></div>
        </div>
      </div>
    </div>
  )
}
