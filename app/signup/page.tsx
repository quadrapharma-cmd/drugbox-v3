'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/login.module.css'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setError('')
    if (!name || !email || !password) {
      setError('Name, email, and password are required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!agreed) {
      setError('You must agree to the User Agreement to create an account')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // Enrich the profile created by the trigger
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ headline, company }).eq('id', user.id)
    }
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.dbOverlay} />
        <div className={styles.dbContent}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>
              DRUGBOX
            </div>
            <div className={styles.dbTagline}>Pharma Professional Network</div>
          </div>
          <div className={styles.dbH1}>Join the pharmaceutical professional network</div>
          <div className={styles.dbP}>
            Create your account to source products, post listings, and connect with verified
            industry professionals.
          </div>
          <div className={styles.dbFeat}>
            <div className={styles.dbFic}>✓</div>
            <span>Verified professional profiles</span>
          </div>
          <div className={styles.dbFeat}>
            <div className={styles.dbFic}>🌍</div>
            <span>Reach buyers across MENA &amp; Africa</span>
          </div>
        </div>
      </div>

      <div className={styles.dbForm}>
        <div className={styles.dbBox}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1a56db', letterSpacing: 1, marginBottom: 16 }}>
            DRUGBOX
          </div>
          <div className={styles.dbFtitle}>Create your account</div>
          <div className={styles.dbFsub}>Join Drugbox in under a minute</div>

          {error && <div className={styles.dbErr}>{error}</div>}

          <div className={styles.dbField}>
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" />
          </div>
          <div className={styles.dbField}>
            <label>Headline</label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Regulatory Affairs Manager" />
          </div>
          <div className={styles.dbField}>
            <label>Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Pharma" />
          </div>
          <div className={styles.dbField}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className={styles.dbField}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '10px 0', fontSize: 12, color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
            <span>
              I agree to the{' '}
              <Link href="/terms" style={{ color: '#1a56db', fontWeight: 600 }}>
                User Agreement
              </Link>
            </span>
          </label>

          <button className={styles.dbBtn} onClick={handleSignup} disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>

          <div className={styles.dbFooter}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
