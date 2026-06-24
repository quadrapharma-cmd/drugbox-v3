'use server'

import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { sanitizeText, isOneOf, POST_CATEGORIES } from '@/lib/validation'
import { revalidatePath } from 'next/cache'

// Fetch the feed: posts newest-first, with author info, reaction & comment counts.
export async function getFeed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', posts: [] }

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, body, category, image_urls, file_url, file_name, created_at, user_id,
      author:profiles!posts_user_id_fkey ( id, name, headline, company, avatar_url, verified )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { error: error.message, posts: [] }

  // Get reaction + comment counts and the current user's own reaction per post
  const postIds = (posts ?? []).map((p) => p.id)
  const [{ data: reactions }, { data: comments }] = await Promise.all([
    supabase.from('reactions').select('post_id, user_id').in('post_id', postIds.length ? postIds : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('comments').select('post_id').in('post_id', postIds.length ? postIds : ['00000000-0000-0000-0000-000000000000']),
  ])

  const enriched = (posts ?? []).map((p) => {
    const postReactions = (reactions ?? []).filter((r) => r.post_id === p.id)
    return {
      ...p,
      reactionCount: postReactions.length,
      commentCount: (comments ?? []).filter((c) => c.post_id === p.id).length,
      myReaction: postReactions.some((r) => r.user_id === user.id),
    }
  })

  return { posts: enriched, currentUserId: user.id }
}

// Create a post (text + optional category). Images/files handled separately via storage.
export async function createPost(formData: { body: string; category: string; imageUrls?: string[] }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Rate limit: 20 posts per 5 minutes per user (anti-spam)
  const rl = await rateLimit(`post:${user.id}`, 20, 300)
  if (!rl.success) return { error: 'You are posting too frequently. Please wait a moment.' }

  const body = sanitizeText(formData.body, 5000)
  const category = isOneOf(formData.category, POST_CATEGORIES) ? formData.category : 'general'
  const imageUrls = formData.imageUrls ?? []

  if (!body && imageUrls.length === 0) {
    return { error: 'Post cannot be empty' }
  }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    body,
    category,
    image_urls: imageUrls.length ? imageUrls : null,
  })

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { success: true }
}

// Toggle a like on a post (insert/remove). RLS ensures user can only act as themselves.
export async function toggleReaction(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
    return { success: true, liked: false }
  } else {
    const { error } = await supabase.from('reactions').insert({
      post_id: postId,
      user_id: user.id,
      kind: 'like',
    })
    if (error) return { error: error.message }
    return { success: true, liked: true }
  }
}

// Delete own post (RLS also enforces ownership server-side as a second layer)
export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Explicit ownership check before delete (defence in depth alongside RLS)
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .maybeSingle()

  if (!post) return { error: 'Post not found' }
  if (post.user_id !== user.id) return { error: 'You can only delete your own posts' }

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { success: true }
}

// Get comments for a post
export async function getComments(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, body, created_at, user_id,
      author:profiles!comments_user_id_fkey ( id, name, avatar_url, verified )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message, comments: [] }
  return { comments: data ?? [] }
}

// Add a comment
export async function addComment(postId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const rl = await rateLimit(`comment:${user.id}`, 30, 300)
  if (!rl.success) return { error: 'You are commenting too frequently.' }

  const clean = sanitizeText(body, 2000)
  if (!clean) return { error: 'Comment cannot be empty' }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    body: clean,
  })
  if (error) return { error: error.message }
  return { success: true }
}
