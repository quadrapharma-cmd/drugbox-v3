import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCompany } from '@/actions/company'
import CompanyApproved from '@/components/CompanyApproved'
import './company-approved.css'

export default async function CompanyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const res = await getCompany()
  if (res.error || !res.company) {
    return (
      <div style={{ padding: 60, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>No company page yet</h2>
        <p style={{ color: '#64748b', marginTop: 8 }}>Create one from your profile.</p>
        <Link href="/profile" style={{ color: '#1a56db', fontWeight: 700 }}>← Back to profile</Link>
      </div>
    )
  }

  const { company, team, products, viewerRole, currentUserId } = res
  // Pull this company's job listings too (category='job')
  const { data: jobs } = await supabase
    .from('listings')
    .select('id, title, department, employment_type')
    .eq('company_id', company.id)
    .eq('category', 'job')
    .eq('status', 'active')

  return (
    <CompanyApproved
      company={company}
      team={team || []}
      products={(products || []).filter((p: any) => p.category !== 'job')}
      jobs={jobs || []}
      viewerRole={viewerRole || 'visitor'}
      currentUserId={currentUserId || user.id}
    />
  )
}
