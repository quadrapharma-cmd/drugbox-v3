'use server'

import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/validation'

// Build the list of conversation threads for the current user
export async function getThreads() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', threads: [] }

  // Get all messages involving the user (RLS already restricts to participant-only)
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, body, image_url, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return { error: error.message, threads: [] }

  // Group by the "other" participant
  const partnerMap = new Map<string, any>()
  for (const m of messages || []) {
    const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id
    if (!partnerMap.has(partnerId)) {
      partnerMap.set(partnerId, {
        partnerId,
        last: m,
        unread: 0,
      })
    }
    // Count unread (messages TO me, not yet read)
    if (m.receiver_id === user.id && !m.read_at) {
      partnerMap.get(partnerId).unread++
    }
  }

  const partnerIds = Array.from(partnerMap.keys())
  if (partnerIds.length === 0) return { threads: [], currentUserId: user.id }

  const { data: partners } = await supabase
    .from('profiles')
    .select('id, name, company, headline, avatar_url, verified')
    .in('id', partnerIds)

  const threads = partnerIds.map((pid) => {
    const t = partnerMap.get(pid)
    const partner = (partners || []).find((p) => p.id === pid)
    return { ...t, partner }
  }).filter((t) => t.partner)

  return { threads, currentUserId: user.id }
}

// Get the full message history with one partner (and mark their messages read)
export async function getConversation(partnerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', messages: [] }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, body, image_url, listing_id, read_at, created_at')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message, messages: [] }

  // Mark partner's messages to me as read
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('sender_id', partnerId)
    .eq('receiver_id', user.id)
    .is('read_at', null)

  const { data: partner } = await supabase
    .from('profiles')
    .select('id, name, company, headline, avatar_url, verified')
    .eq('id', partnerId)
    .maybeSingle()

  return { messages: messages || [], partner, currentUserId: user.id }
}

// Send a message (RLS enforces sender_id = self)
export async function sendMessage(partnerId: string, body: string, listingId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Rate limit: 60 messages per minute (anti-spam)
  const rl = await rateLimit(`msg:${user.id}`, 60, 60)
  if (!rl.success) return { error: 'You are sending messages too quickly.' }

  const clean = sanitizeText(body, 4000)
  if (!clean) return { error: 'Message cannot be empty' }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: partnerId,
      body: clean,
      listing_id: listingId || null,
    })
    .select('id, sender_id, receiver_id, body, created_at')
    .single()

  if (error) return { error: error.message }
  return { success: true, message: data }
}
