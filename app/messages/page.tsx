import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getThreads } from '@/actions/messages'
import MessagesApproved from '@/components/MessagesApproved'

// BUG FIX: previously there was no way to deep-link into a specific
// conversation (e.g. after clicking "Contact" on a listing or job), so the
// page always opened whichever thread happened to be first. Now it accepts
// ?with=<partnerId> and opens that conversation directly.
export default async function MessagesPage({ searchParams }: { searchParams: { with?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { threads, currentUserId } = await getThreads()

  return (
    <MessagesApproved
      initialThreads={threads || []}
      currentUserId={currentUserId || user.id}
      openPartnerId={searchParams?.with}
    />
  )
}
