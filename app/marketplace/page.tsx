import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getListings } from '@/actions/listings'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import MarketplaceClient from '@/components/MarketplaceClient'
import styles from './marketplace.module.css'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, headline, company')
    .eq('id', user.id)
    .maybeSingle()

  const name = profile?.name || 'User'
  const { listings, currentUserId } = await getListings({ category: 'all' })

  return (
    <div className={styles.shell}>
      <Sidebar userName={name} userHeadline={profile?.headline || profile?.company || 'Member'} userInitials={initials(name)} />
      <div className={styles.main}>
        <Topbar />
        <div className={styles.wrap}>
          <MarketplaceClient initialListings={listings || []} currentUserId={currentUserId || user.id} />
        </div>
      </div>
    </div>
  )
}
