'use server'

import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import {
  sanitizeText,
  isOneOf,
  LISTING_CATEGORIES,
  LISTING_ROLES,
  PRODUCT_SUBTYPES,
  SENIORITY_LEVELS,
  EMPLOYMENT_TYPES,
} from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// Browse listings, optionally filtered by category. Excludes the 'job' category
// by default for the Marketplace view (jobs have their own page) unless asked.
export async function getListings(opts?: { category?: string; includeJobs?: boolean }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', listings: [] }

  let query = supabase
    .from('listings')
    .select(`
      id, title, category, role, product_subtype, price_amount, price_unit, moq,
      certifications, photo_url, boosted, views_count, created_at, user_id,
      seller:profiles!listings_user_id_fkey ( id, name, company, country, verified )
    `)
    .eq('status', 'active')
    .order('boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(60)

  if (opts?.category && opts.category !== 'all') {
    query = query.eq('category', opts.category)
  } else if (!opts?.includeJobs) {
    query = query.neq('category', 'job')
  }

  const { data, error } = await query
  if (error) return { error: error.message, listings: [] }
  return { listings: data || [], currentUserId: user.id }
}

// Get the current user's own listings (any status) for the "My Listings" tab
export async function getMyListings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', listings: [] }

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, category, role, status, price_amount, price_unit, boosted, views_count, inquiries_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, listings: [] }
  return { listings: data || [] }
}

// Create a listing (the unified create used by Marketplace, Jobs, and Company products)
export async function createListing(form: {
  category: string
  role: string
  title: string
  description?: string
  product_subtype?: string
  price_amount?: number
  price_unit?: string
  moq?: string
  certifications?: string
  employment_type?: string
  seniority_level?: string
  department?: string
  company_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Rate limit: 15 new listings per hour per user (anti-spam)
  const rl = await rateLimit(`listing:${user.id}`, 15, 3600)
  if (!rl.success) return { error: 'You are creating listings too quickly. Please wait.' }

  // Validate enums against the DB check constraints
  if (!isOneOf(form.category, LISTING_CATEGORIES)) return { error: 'Invalid category' }
  if (!isOneOf(form.role, LISTING_ROLES)) return { error: 'Invalid intent (offering/seeking)' }

  const title = sanitizeText(form.title, 200)
  if (!title) return { error: 'Title is required' }

  const row: Record<string, unknown> = {
    user_id: user.id,
    category: form.category,
    role: form.role,
    title,
    description: sanitizeText(form.description || '', 5000),
    status: 'active',
  }

  // Conditional fields, validated
  if (form.product_subtype && isOneOf(form.product_subtype, PRODUCT_SUBTYPES)) {
    row.product_subtype = form.product_subtype
  }
  if (typeof form.price_amount === 'number' && form.price_amount >= 0) row.price_amount = form.price_amount
  if (form.price_unit) row.price_unit = sanitizeText(form.price_unit, 40)
  if (form.moq) row.moq = sanitizeText(form.moq, 80)
  if (form.certifications) row.certifications = sanitizeText(form.certifications, 200)

  // Job-specific
  if (form.category === 'job') {
    if (form.employment_type && isOneOf(form.employment_type, EMPLOYMENT_TYPES)) row.employment_type = form.employment_type
    if (form.seniority_level && isOneOf(form.seniority_level, SENIORITY_LEVELS)) row.seniority_level = form.seniority_level
    if (form.department) row.department = sanitizeText(form.department, 80)
  }

  // If attaching to a company, RLS will also verify the user is a manager
  if (form.company_id) row.company_id = form.company_id

  const { error } = await supabase.from('listings').insert(row)
  if (error) return { error: error.message }

  revalidatePath('/marketplace')
  return { success: true }
}

// Delete own listing (RLS enforces ownership too)
export async function deleteListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: listing } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing) return { error: 'Listing not found' }
  if (listing.user_id !== user.id) return { error: 'You can only delete your own listings' }

  const { error } = await supabase.from('listings').delete().eq('id', listingId)
  if (error) return { error: error.message }
  revalidatePath('/marketplace')
  return { success: true }
}

// Start an inquiry: creates the first message to the seller, with listing context
export async function inquireAboutListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: listing } = await supabase
    .from('listings')
    .select('user_id, title')
    .eq('id', listingId)
    .maybeSingle()

  if (!listing) return { error: 'Listing not found' }
  if (listing.user_id === user.id) return { error: "You can't inquire about your own listing" }

  // Increment inquiry count
  await supabase.rpc('increment_listing_inquiries', { p_listing_id: listingId }).then(() => {}, () => {})

  return { success: true, sellerId: listing.user_id, listingTitle: listing.title }
}
