'use server'

import { createClient } from '@/lib/supabase/server'

// Jobs are listings with category='job'. This fetches them with job-specific
// fields and supports filtering by seniority + employment type.
export async function getJobs(opts?: { seniority?: string; employmentType?: string; role?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', jobs: [] }

  let query = supabase
    .from('listings')
    .select(`
      id, title, role, department, seniority_level, employment_type, description,
      created_at, user_id, company_id, boosted,
      poster:profiles!listings_user_id_fkey ( id, name, company, country, verified )
    `)
    .eq('category', 'job')
    .eq('status', 'active')
    .order('boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (opts?.seniority && opts.seniority !== 'all') {
    query = query.eq('seniority_level', opts.seniority)
  }
  if (opts?.employmentType && opts.employmentType !== 'all') {
    query = query.eq('employment_type', opts.employmentType)
  }
  // role: 'offering' = hiring, 'seeking' = job seekers
  if (opts?.role && opts.role !== 'all') {
    query = query.eq('role', opts.role)
  }

  const { data, error } = await query
  if (error) return { error: error.message, jobs: [] }
  return { jobs: data || [], currentUserId: user.id }
}

// Start contact with a job poster (or applicant)
export async function contactJobPoster(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: job } = await supabase
    .from('listings')
    .select('user_id, title, role')
    .eq('id', jobId)
    .eq('category', 'job')
    .maybeSingle()

  if (!job) return { error: 'Job not found' }
  if (job.user_id === user.id) return { error: "This is your own posting" }

  // BUG FIX: this used to return ids without ever creating a message, so
  // clicking "Apply Now" / "Contact" silently did nothing and dropped the
  // user on whichever thread happened to be first in their inbox.
  const openingLine =
    job.role === 'offering'
      ? `Hi, I'd like to apply for "${job.title}". Could you share more details about the role?`
      : `Hi, I saw your profile for "${job.title}". We may have an opening that fits — are you open to a quick chat?`

  const { error: msgError } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: job.user_id,
    body: openingLine,
    listing_id: jobId,
  })
  if (msgError) return { error: msgError.message }

  return { success: true, posterId: job.user_id, jobTitle: job.title }
}
