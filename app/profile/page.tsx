import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/profile'
import ProfileShell from '@/components/ProfileShell'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
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
  const inits = initials(profile.name)

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, body, category, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const posts = recentPosts ?? []
  const timeAgoList = posts.map((p: any) => timeAgo(p.created_at))

  return (
    <ProfileShell
      profile={profile}
      stats={stats}
      listings={listings}
      recentPosts={posts}
      inits={inits}
      timeAgoList={timeAgoList}
    />
  )
}
