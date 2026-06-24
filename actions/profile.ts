'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// Fetch a profile by id (or the current user if no id) with computed stats.
export async function getProfile(profileId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const targetId = profileId || user.id

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .maybeSingle()

  if (error || !profile) return { error: 'Profile not found' }

  // Compute stats: posts, accepted connections, active listings
  const [{ count: postCount }, { count: connCount }, { count: listingCount }] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', targetId),
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${targetId},addressee_id.eq.${targetId}`),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', targetId).eq('status', 'active'),
  ])

  // Fetch this profile's active listings to show in "My Listings"
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, category, role, price_amount, price_unit, photo_url, views_count')
    .eq('user_id', targetId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return {
    profile,
    isMe: targetId === user.id,
    stats: {
      posts: postCount || 0,
      connections: connCount || 0,
      listings: listingCount || 0,
    },
    listings: listings || [],
  }
}

// Update the current user's own profile (RLS also enforces self-only)
export async function updateProfile(data: {
  name?: string
  headline?: string
  company?: string
  location?: string
  bio?: string
  website?: string
  phone?: string
  certifications?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const clean: Record<string, string> = {}
  if (data.name !== undefined) clean.name = sanitizeText(data.name, 120)
  if (data.headline !== undefined) clean.headline = sanitizeText(data.headline, 160)
  if (data.company !== undefined) clean.company = sanitizeText(data.company, 160)
  if (data.location !== undefined) clean.location = sanitizeText(data.location, 160)
  if (data.bio !== undefined) clean.bio = sanitizeText(data.bio, 2000)
  if (data.website !== undefined) clean.website = sanitizeText(data.website, 200)
  if (data.phone !== undefined) clean.phone = sanitizeText(data.phone, 40)
  if (data.certifications !== undefined) clean.certifications = sanitizeText(data.certifications, 300)

  if (clean.name === '') return { error: 'Name cannot be empty' }

  const { error } = await supabase.from('profiles').update(clean).eq('id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}
