'use client'

import { useState, useEffect } from 'react'
import { getFollowStatus, followCompany, unfollowCompany } from '@/actions/company'
import { useLang } from '@/lib/i18n/LanguageProvider'

export default function FollowButton({ companyId, className }: { companyId: string; className?: string }) {
  const { t } = useLang()
  // BUG FIX: this used to start as `null` and show "…" until the status
  // fetch resolved — if that request hung or failed, the button was stuck
  // showing "…" forever. Default to "not following" immediately (the most
  // common real case for a visitor) and correct it once the real status
  // loads, instead of blocking the button on a network round-trip.
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    getFollowStatus(companyId).then((res) => {
      if (mounted && !('error' in res && res.error)) setFollowing(res.following)
    }).catch(() => {})
    return () => { mounted = false }
  }, [companyId])

  async function handleClick() {
    setBusy(true)
    try {
      if (following) {
        const res = await unfollowCompany(companyId)
        if (res.error) throw new Error(res.error)
        setFollowing(false)
      } else {
        const res = await followCompany(companyId)
        if (res.error) throw new Error(res.error)
        setFollowing(true)
      }
    } catch (e: any) {
      alert(e.message || 'Could not update follow status. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className={className} onClick={handleClick} disabled={busy}>
      {following ? `✓ ${t('company.following')}` : t('company.follow')}
    </button>
  )
}
