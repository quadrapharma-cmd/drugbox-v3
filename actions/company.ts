'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// BUG FIX: "Follow" buttons on the Company page had no backend at all —
// these three actions add real follow/unfollow + status checking.
export async function getFollowStatus(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', following: false, count: 0 }

  const [{ data: existing }, { data: count }] = await Promise.all([
    supabase.from('company_followers').select('id').eq('company_id', companyId).eq('user_id', user.id).maybeSingle(),
    supabase.rpc('get_company_followers_count', { p_company_id: companyId }),
  ])

  return { following: !!existing, count: count ?? 0 }
}

export async function followCompany(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('company_followers').insert({ company_id: companyId, user_id: user.id })
  if (error) return { error: error.message }

  revalidatePath('/company')
  return { success: true }
}

export async function unfollowCompany(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('company_followers').delete().eq('company_id', companyId).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/company')
  return { success: true }
}

// Get a company page by id, or the first company the user manages (for the demo /company route)
export async function getCompany(companyId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  let targetId = companyId
  if (!targetId) {
    // Find a company this user is a member of, else the most recent company
    const { data: membership } = await supabase
      .from('company_team')
      .select('company_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (membership) {
      targetId = membership.company_id
    } else {
      const { data: anyCompany } = await supabase
        .from('companies')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      targetId = anyCompany?.id
    }
  }

  if (!targetId) return { error: 'No company found', company: null }

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', targetId)
    .maybeSingle()

  if (error || !company) return { error: 'Company not found', company: null }

  // Team members
  const { data: team } = await supabase
    .from('company_team')
    .select('role, user_id, member:profiles!company_team_user_id_fkey ( id, name, headline, avatar_url, verified )')
    .eq('company_id', targetId)

  // This company's active listings (products)
  const { data: products } = await supabase
    .from('listings')
    .select('id, title, category, role, price_amount, price_unit, boosted')
    .eq('company_id', targetId)
    .eq('status', 'active')
    .limit(12)

  // Determine the viewer's role for role-based UI
  const myMembership = (team || []).find((t) => t.user_id === user.id)
  const viewerRole = myMembership?.role || 'visitor'

  return {
    company,
    team: team || [],
    products: products || [],
    viewerRole, // 'admin' | 'subadmin' | 'member' | 'visitor'
    currentUserId: user.id,
  }
}

// Create a company page (creator becomes Admin via DB trigger)
export async function createCompany(form: { name: string; tagline?: string; about?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = sanitizeText(form.name, 160)
  if (!name) return { error: 'Company name is required' }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      created_by: user.id,
      name,
      tagline: sanitizeText(form.tagline || '', 200),
      about: sanitizeText(form.about || '', 3000),
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/company')
  return { success: true, companyId: data.id }
}

// Update company info — RLS enforces manager-only
export async function updateCompany(companyId: string, form: {
  tagline?: string; about?: string; contact_email?: string; contact_phone?: string; website?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const clean: Record<string, string> = {}
  if (form.tagline !== undefined) clean.tagline = sanitizeText(form.tagline, 200)
  if (form.about !== undefined) clean.about = sanitizeText(form.about, 3000)
  if (form.contact_email !== undefined) clean.contact_email = sanitizeText(form.contact_email, 160)
  if (form.contact_phone !== undefined) clean.contact_phone = sanitizeText(form.contact_phone, 40)
  if (form.website !== undefined) clean.website = sanitizeText(form.website, 200)

  const { error } = await supabase.from('companies').update(clean).eq('id', companyId)
  if (error) return { error: error.message }
  revalidatePath('/company')
  return { success: true }
}

// Delete a company page entirely — RLS also enforces admin-only at the DB
// level (companies_delete_admin_only), this is a defence-in-depth check.
export async function deleteCompany(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: membership } = await supabase
    .from('company_team')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || membership.role !== 'admin') {
    return { error: 'Only an Admin can delete this company page' }
  }

  const { error } = await supabase.from('companies').delete().eq('id', companyId)
  if (error) return { error: error.message }

  revalidatePath('/company')
  return { success: true }
}

// Leave company team — with SOLE-ADMIN GUARD enforced server-side
export async function leaveCompany(companyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: membership } = await supabase
    .from('company_team')
    .select('id, role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return { error: 'You are not part of this company team' }

  if (membership.role === 'admin') {
    const { data: otherCount } = await supabase.rpc('other_admin_count', {
      p_company_id: companyId,
      p_excluding_user_id: user.id,
    })
    if ((otherCount ?? 0) === 0) {
      return {
        error: 'You are the only Admin. Promote another team member to Admin before leaving — otherwise the company page would have no one to manage it.',
      }
    }
  }

  const { error } = await supabase.from('company_team').delete().eq('id', membership.id)
  if (error) return { error: error.message }
  revalidatePath('/company')
  return { success: true }
}
