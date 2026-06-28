'use server'

import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'

// BUG FIX: the Profile page's "Connect" button called nothing — there was no
// server action anywhere to send, accept, or check a connection request.
// This file adds that missing functionality.

// Get the connection status between the current user and another profile.
// Returns 'none' | 'pending_sent' | 'pending_received' | 'accepted'
export async function getConnectionStatus(otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 'none' as const }

  if (user.id === otherUserId) return { status: 'self' as const }

  const { data } = await supabase
    .from('connections')
    .select('id, requester_id, addressee_id, status')
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${user.id})`
    )
    .maybeSingle()

  if (!data) return { status: 'none' as const }
  if (data.status === 'accepted') return { status: 'accepted' as const, connectionId: data.id }
  // pending
  if (data.requester_id === user.id) return { status: 'pending_sent' as const, connectionId: data.id }
  return { status: 'pending_received' as const, connectionId: data.id }
}

// Send a connection request
export async function sendConnectionRequest(addresseeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === addresseeId) return { error: "You can't connect with yourself" }

  const rl = await rateLimit(`connect:${user.id}`, 30, 3600)
  if (!rl.success) return { error: 'You are sending too many connection requests. Please wait.' }

  // Check there isn't already a request between these two users
  const existing = await getConnectionStatus(addresseeId)
  if (existing.status !== 'none') return { error: 'A connection already exists or is pending with this person.' }

  const { error } = await supabase.from('connections').insert({
    requester_id: user.id,
    addressee_id: addresseeId,
    status: 'pending',
  })
  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}

// Accept a pending connection request
export async function acceptConnectionRequest(connectionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: conn } = await supabase
    .from('connections')
    .select('id, addressee_id, status')
    .eq('id', connectionId)
    .maybeSingle()

  if (!conn) return { error: 'Connection request not found' }
  if (conn.addressee_id !== user.id) return { error: 'Only the recipient can accept this request' }
  if (conn.status !== 'pending') return { error: 'This request is no longer pending' }

  const { error } = await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId)
  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}
