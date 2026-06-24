import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/profile'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import styles from './profile.module.css'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const CAT_ICON: Record<string, string> = {
  supply: '⚗️', demand: '🔍', service: '📋', cmo: '🏭', job: '💼',
  equipment: '🔧', license: '📜', training: '🎓',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const res = await getProfile()
  if (res.error || !res.profile) {
    return <div style={{ padding: 40 }}>Profile not found</div>
  }
  const profile = res.profile
  const stats = res.stats ?? { posts: 0, connections: 0, listings: 0 }
  const listings = res.listings ?? []

  const sidebarName = profile.name || 'User'
  const inits = initials(sidebarName)

  // Derive cert badges from the real certifications field
  const certs = (profile.certifications || '')
    .split(',')
    .map((c: string) => c.trim())
    .filter(Boolean)
  const isVerified = !!profile.certs_verified_at

  return (
    <div className={styles.shell}>
      <Sidebar userName={sidebarName} userHeadline={profile.headline || profile.company || 'Member'} userInitials={inits} />

      <div className={styles.main}>
        <Topbar />
        <div className={styles.wrap}>
          <div className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.cover}>
              <button className={styles.coverEdit}>📷 Edit Cover</button>
            </div>
            <div className={styles.head}>
              <div className={styles.avatar}>{inits}</div>

              <div className={styles.headRow}>
                <div>
                  <div className={styles.name}>
                    {profile.name} {profile.verified && <span className={styles.tick}>✓</span>}
                  </div>
                  <div className={styles.role}>
                    {profile.headline}
                    {profile.company ? ` at ${profile.company}` : ''}
                    {profile.location ? ` · ${profile.location}` : ''}
                  </div>
                </div>
                <div className={styles.headActions}>
                  <button className={`${styles.btn} ${styles.btnGhost}`}>✏️ Edit Profile</button>
                </div>
              </div>

              {certs.length > 0 && (
                <div className={styles.certBadges}>
                  {certs.map((c: string) => (
                    <span key={c} className={styles.certBadge}>
                      {isVerified ? '✓' : '○'} {c}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.marketActivity}>
                <div>
                  <div className={styles.maN}>{stats.posts}</div>
                  <div className={styles.maL}>Posts</div>
                </div>
                <div>
                  <div className={styles.maN}>{stats.connections}</div>
                  <div className={styles.maL}>Connections</div>
                </div>
                <div>
                  <div className={styles.maN}>{stats.listings}</div>
                  <div className={styles.maL}>Active listings</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div>
              <div className={`${styles.card} ${styles.cardPad}`} style={{ marginBottom: 16 }}>
                <div className={styles.cardTitle}>About</div>
                <p className={styles.bioText}>{profile.bio || 'No bio yet.'}</p>
              </div>

              <div className={`${styles.card} ${styles.cardPad}`} style={{ marginBottom: 16 }}>
                <div className={styles.cardTitle}>Details</div>
                {profile.company && (
                  <div className={styles.infoRow}>
                    <div className={styles.infoIco}>🏢</div>
                    <div><div className={styles.infoLabel}>Company</div>
                      <Link href="/company" className={styles.infoVal} style={{ color: '#1a56db' }}>{profile.company} →</Link>
                    </div>
                  </div>
                )}
                {profile.location && (
                  <div className={styles.infoRow}><div className={styles.infoIco}>📍</div>
                    <div><div className={styles.infoLabel}>Location</div><div className={styles.infoVal}>{profile.location}</div></div></div>
                )}
                {profile.website && (
                  <div className={styles.infoRow}><div className={styles.infoIco}>🌐</div>
                    <div><div className={styles.infoLabel}>Website</div><div className={styles.infoVal}>{profile.website}</div></div></div>
                )}
                {profile.phone && (
                  <div className={styles.infoRow}><div className={styles.infoIco}>📞</div>
                    <div><div className={styles.infoLabel}>Phone</div><div className={styles.infoVal}>{profile.phone}</div></div></div>
                )}
              </div>

              <div className={`${styles.card} ${styles.cardPad}`}>
                <div className={styles.cardTitle}>Pages</div>
                <Link href="/company" className={styles.listingRow} style={{ textDecoration: 'none' }}>
                  <div className={styles.listingIco}>🏢</div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.listingTitle}>{profile.company || 'Quadra Pharm'}</div>
                    <div className={styles.listingMeta}>👑 Admin</div>
                  </div>
                  <span style={{ color: '#1a56db' }}>→</span>
                </Link>
                <Link href="/company" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, marginTop: 8, border: '1.5px dashed #cbd5e1', borderRadius: 9, textDecoration: 'none', color: '#1a56db', fontSize: 12.5, fontWeight: 700 }}>
                  ➕ Create Company Page
                </Link>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardPad}`}>
              <div className={styles.cardTitle}>
                My Listings
                <Link href="/marketplace" style={{ fontSize: 11, color: '#1a56db', fontWeight: 700 }}>View all →</Link>
              </div>
              {listings.length === 0 ? (
                <p className={styles.bioText}>No active listings yet.</p>
              ) : (
                listings.map((l: any) => (
                  <div key={l.id} className={styles.listingRow}>
                    <div className={styles.listingIco}>{CAT_ICON[l.category] || '📦'}</div>
                    <div style={{ flex: 1 }}>
                      <div className={styles.listingTitle}>{l.title}</div>
                      <div className={styles.listingMeta}>
                        {l.price_amount ? `$${l.price_amount}${l.price_unit ? `/${l.price_unit}` : ''} · ` : ''}
                        {l.views_count} views
                      </div>
                    </div>
                    <span className={styles.listingType}>{l.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
