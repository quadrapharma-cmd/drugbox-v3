import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCompany } from '@/actions/company'
import CompanyManagePanel from '@/components/CompanyManagePanel'
import styles from './company.module.css'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
const CAT_ICON: Record<string, string> = {
  supply: '⚗️', demand: '🔍', cmo: '🏭', equipment: '🔧',
  license: '📜', service: '📋', job: '💼', training: '🎓',
}
const ROLE_BADGE: Record<string, string> = {
  admin: styles.badgeAdmin, subadmin: styles.badgeSubadmin, member: styles.badgeMember,
}

export default async function CompanyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const res = await getCompany()
  if (res.error || !res.company) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h2>No company page yet</h2>
        <p style={{ color: '#64748b', marginTop: 8 }}>Create one from your profile.</p>
        <Link href="/profile" style={{ color: '#1a56db', fontWeight: 700 }}>← Back to profile</Link>
      </div>
    )
  }

  const { company, team, products, viewerRole } = res
  const teamList = team ?? []
  const productList = products ?? []

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/feed" className={styles.navBack}>← Drugbox</Link>
        <div className={styles.navBrand}>
          <span className={styles.navMark}>{initials(company.name)}</span>
          {company.name}
        </div>
        <div className={styles.navCta}>
          <button className={styles.btnFollow}>Follow</button>
        </div>
      </nav>

      <div className={styles.hero}>
        <div className={styles.heroLogo}>{initials(company.name)}</div>
        <div className={styles.heroName}>{company.name}</div>
        <div className={styles.heroTagline}>{company.tagline || 'Pharmaceutical excellence'}</div>
        <div className={styles.heroStats}>
          <div><div className={styles.hsN}>{company.followers_count}</div><div className={styles.hsL}>Followers</div></div>
          <div><div className={styles.hsN}>{productList.length}</div><div className={styles.hsL}>Listings</div></div>
          <div><div className={styles.hsN}>{teamList.length}</div><div className={styles.hsL}>Team</div></div>
        </div>
      </div>

      <CompanyManagePanel companyId={company.id} viewerRole={viewerRole || 'visitor'} />

      {productList.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Products &amp; Listings</div>
          <div className={styles.prodGrid}>
            {productList.map((p: any) => (
              <Link key={p.id} href="/marketplace" className={styles.prodCard}>
                <div className={styles.prodIcon}>{CAT_ICON[p.category] || '📦'}</div>
                <div className={styles.prodCat}>{p.category}</div>
                <div className={styles.prodName}>{p.title}</div>
                <div className={styles.prodPrice}>
                  {p.price_amount ? `From $${p.price_amount}${p.price_unit ? ` / ${p.price_unit}` : ''}` : 'Inquire'}
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.liveNote}>🔗 Listings are pulled directly from this company&apos;s Marketplace page</div>
        </div>
      )}

      <div className={styles.section} style={{ background: '#f5f7fc', borderRadius: 24 }}>
        <div className={styles.sectionTitle}>About</div>
        <p className={styles.aboutText}>{company.about || 'No description yet.'}</p>
      </div>

      {teamList.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Our Team</div>
          <div className={styles.teamGrid}>
            {teamList.map((t: any) => (
              <div key={t.user_id} className={styles.teamMember}>
                <div className={styles.tmAv}>{t.member ? initials(t.member.name) : '?'}</div>
                <div className={styles.tmName}>{t.member?.name}</div>
                <div className={styles.tmRole}>{t.member?.headline || ''}</div>
                <span className={`${styles.tmBadge} ${ROLE_BADGE[t.role] || styles.badgeMember}`}>{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
