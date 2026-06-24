'use client'

import { useRouter } from 'next/navigation'
import { leaveCompany } from '@/actions/company'
import styles from '@/app/company/company.module.css'

export default function CompanyManagePanel({ companyId, viewerRole }: { companyId: string; viewerRole: string }) {
  const router = useRouter()
  const isManager = viewerRole === 'admin' || viewerRole === 'subadmin'

  if (!isManager) return null

  async function handleLeave() {
    const res = await leaveCompany(companyId)
    if (res.error) { alert(res.error); return } // shows sole-admin guard if applicable
    router.refresh()
  }

  return (
    <div className={styles.managePanel}>
      <div className={styles.mpTitle}>⚙️ Manage Company Page <span style={{ fontSize: 10, background: '#fae8ff', color: '#a21caf', padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase' }}>{viewerRole}</span></div>
      <div className={styles.mpDesc}>You can edit page info, manage products, and manage your team. Listings shown below are pulled from this company&apos;s Marketplace listings.</div>
      <button className={styles.btnLeave} onClick={handleLeave}>🚪 Leave Company Team</button>
    </div>
  )
}
