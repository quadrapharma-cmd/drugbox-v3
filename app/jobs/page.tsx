import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/actions/jobs'
import JobsApproved from '@/components/JobsApproved'
import './jobs-approved.css'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ jobs: hiringJobs, currentUserId }, { jobs: seekingJobs }] = await Promise.all([
    getJobs({ role: 'offering' }),
    getJobs({ role: 'seeking' }),
  ])

  return <JobsApproved hiringJobs={hiringJobs || []} seekingJobs={seekingJobs || []} currentUserId={currentUserId || user.id} />
}
