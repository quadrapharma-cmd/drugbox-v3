import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFeed } from '@/actions/posts'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Composer from '@/components/Composer'
import PostCard from '@/components/PostCard'
import styles from './feed.module.css'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, headline, company')
    .eq('id', user.id)
    .maybeSingle()

  const name = profile?.name || 'User'
  const inits = initials(name)

  const { posts, currentUserId } = await getFeed()

  return (
    <div className={styles.shell}>
      <Sidebar userName={name} userHeadline={profile?.headline || profile?.company || 'Member'} userInitials={inits} />

      <div className={styles.main}>
        <Topbar />
        <div className={styles.content}>
          <div className={styles.feedCol}>
            <Composer userInitials={inits} />
            {(posts ?? []).length === 0 ? (
              <div className={styles.empty}>No posts yet. Be the first to share something!</div>
            ) : (
              (posts ?? []).map((p: any) => (
                <PostCard key={p.id} post={p} currentUserId={currentUserId || user.id} />
              ))
            )}
          </div>

          <div className={styles.rightCol}>
            <div className={styles.rCard}>
              <div className={styles.rCardTitle}>Market Today</div>
              <div className={styles.statRow}><span>🟢 Active Supply</span><b>312</b></div>
              <div className={styles.statRow}><span>🟠 Open Demand</span><b>187</b></div>
              <div className={styles.statRow}><span>💼 Open Jobs</span><b>76</b></div>
              <div className={styles.statRow}><span>🏭 CMO Listings</span><b>43</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
