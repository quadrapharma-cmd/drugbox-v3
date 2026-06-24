'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// List all groups with member count + whether the current user has joined
export async function getGroups() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', groups: [] }

  const { data: groups, error } = await supabase
    .from('groups')
    .select('id, name, description, emoji, created_at')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, groups: [] }

  const groupIds = (groups || []).map((g) => g.id)
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, user_id, role')
    .in('group_id', groupIds.length ? groupIds : ['00000000-0000-0000-0000-000000000000'])

  const enriched = (groups || []).map((g) => {
    const members = (memberships || []).filter((m) => m.group_id === g.id)
    const mine = members.find((m) => m.user_id === user.id)
    return {
      ...g,
      memberCount: members.length,
      joined: !!mine,
      myRole: mine?.role || null,
    }
  })

  return { groups: enriched, currentUserId: user.id }
}

// Create a group (creator becomes Admin via the DB trigger)
export async function createGroup(form: { name: string; description?: string; emoji?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = sanitizeText(form.name, 120)
  if (!name) return { error: 'Group name is required' }

  const { error } = await supabase.from('groups').insert({
    created_by: user.id,
    name,
    description: sanitizeText(form.description || '', 500),
    emoji: form.emoji || '👥',
  })
  if (error) return { error: error.message }

  revalidatePath('/groups')
  return { success: true }
}

// Join a group
export async function joinGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: user.id,
    role: 'member',
  })
  if (error) return { error: error.message }
  revalidatePath('/groups')
  return { success: true }
}

// Leave a group — with the SOLE-ADMIN GUARD enforced server-side.
export async function leaveGroup(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Find this user's membership
  const { data: membership } = await supabase
    .from('group_members')
    .select('id, role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return { error: 'You are not a member of this group' }

  // SOLE-ADMIN GUARD: if this user is an Admin, ensure another admin exists first
  if (membership.role === 'admin') {
    const { data: otherCount } = await supabase.rpc('other_group_admin_count', {
      p_group_id: groupId,
      p_excluding_user_id: user.id,
    })
    if ((otherCount ?? 0) === 0) {
      return {
        error: 'You are the only Admin. Promote another member to Admin before leaving — otherwise the group would have no one to manage it.',
      }
    }
  }

  const { error } = await supabase.from('group_members').delete().eq('id', membership.id)
  if (error) return { error: error.message }
  revalidatePath('/groups')
  return { success: true }
}
