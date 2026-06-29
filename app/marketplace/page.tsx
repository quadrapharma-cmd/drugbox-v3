import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getListings } from '@/actions/listings'
import MarketplaceApproved from '@/components/MarketplaceApproved'

export default async function MarketplacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  const { listings, currentUserId } = await getListings({ category: 'all' })

  return <MarketplaceApproved userName={profile?.name || 'User'} listings={listings || []} currentUserId={currentUserId || user.id} />
}
