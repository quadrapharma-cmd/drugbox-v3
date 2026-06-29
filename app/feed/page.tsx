import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFeed } from '@/actions/posts'
import FeedShell from '@/components/FeedShell'

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
  const { posts } = await getFeed()

  return (
    <FeedShell
      name={name}
      inits={inits}
      headlineOrCompany={profile?.headline || profile?.company || ''}
      posts={posts ?? []}
    />
  )
}
