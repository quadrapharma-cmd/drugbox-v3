'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleReaction, getComments, addComment } from '@/actions/posts'

const CAT_CLASS: Record<string, string> = {
  general: 'cat-general', regulatory: 'cat-regulatory', market: 'cat-market',
  innovation: 'cat-innovation', job: 'cat-job',
}
const CAT_LABEL: Record<string, string> = {
  general: 'General', regulatory: 'Regulatory', market: 'Market', innovation: 'Innovation', job: 'Job',
}
function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

export default function FeedPost({ post }: { post: any }) {
  const a = post.author
  const [liked, setLiked] = useState(!!post.myReaction)
  const [reactionCount, setReactionCount] = useState(post.reactionCount)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState(false)
  const [newComment, setNewComment] = useState('')

  if (!a) return null

  async function handleLike() {
    setLiked((v) => !v)
    setReactionCount((c: number) => (liked ? c - 1 : c + 1))
    try {
      const res = await toggleReaction(post.id)
      if (res.error) throw new Error(res.error)
    } catch {
      // rollback on failure (network error or rejected request)
      setLiked((v) => !v)
      setReactionCount((c: number) => (liked ? c + 1 : c - 1))
    }
  }

  async function handleToggleComments() {
    // BUG FIX: previously this awaited the comments fetch BEFORE toggling
    // visibility, so a slow or failed request left the box silently closed
    // with no feedback. Now the box opens immediately (optimistic), and the
    // fetch fills it in afterward; failures show an inline message instead
    // of leaving the user wondering if their click did anything.
    setShowComments((v) => !v)
    if (!showComments) {
      setCommentsLoading(true)
      try {
        const res = await getComments(post.id)
        if (!res.error) setComments(res.comments)
        else setCommentsError(true)
      } catch {
        setCommentsError(true)
      } finally {
        setCommentsLoading(false)
      }
    }
  }

  async function handleAddComment() {
    const body = newComment.trim()
    if (!body) return
    try {
      const res = await addComment(post.id, body)
      if (res.error) throw new Error(res.error)
      setNewComment('')
      setCommentCount((c: number) => c + 1)
      const r = await getComments(post.id)
      if (!r.error) setComments(r.comments)
    } catch {
      alert('Could not post your comment. Please try again.')
    }
  }

  return (
    <div className="post">
      <div className="post-head">
        <div className="post-av" style={{ background: '#1a56db' }}>{initials(a.name)}</div>
        <div>
          <Link href="/profile" className="post-author" style={{ textDecoration: 'none' }}>
            {a.name} {a.verified && <span style={{ color: '#1a56db', fontSize: 11 }}>✓</span>}
          </Link>
          <div className="post-meta">{a.headline}{a.company ? `, ${a.company}` : ''} · {timeAgo(post.created_at)}</div>
        </div>
        <span className={`post-cat ${CAT_CLASS[post.category] || 'cat-general'}`}>{CAT_LABEL[post.category] || 'General'}</span>
      </div>
      <div className="post-body">{post.body}</div>
      <div className="post-stats"><span>👍 {reactionCount} reactions</span><span>{commentCount} comments</span></div>
      <div className="post-actions">
        <div className={`post-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike} style={{ cursor: 'pointer' }}>👍 Like</div>
        <div className="post-action-btn" onClick={handleToggleComments} style={{ cursor: 'pointer' }}>💬 Comment</div>
        <div className="post-action-btn" style={{ cursor: 'pointer' }}>↗️ Share</div>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f4fb' }}>
          {commentsLoading && <div style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 8 }}>Loading comments…</div>}
          {commentsError && <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 8 }}>Couldn&apos;t load comments. Please try again.</div>}
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div className="post-av" style={{ width: 30, height: 30, fontSize: 11, background: '#64748b' }}>{c.author ? initials(c.author.name) : '?'}</div>
              <div style={{ flex: 1, background: '#f0f4fb', borderRadius: 11, padding: '8px 12px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.author?.name} {c.author?.verified && <span style={{ color: '#1a56db' }}>✓</span>}</div>
                <div style={{ fontSize: 13 }}>{c.body}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment…"
              style={{ flex: 1, height: 36, border: '1px solid #e4e6eb', borderRadius: 18, padding: '0 14px', background: '#f0f4fb', outline: 'none', fontSize: 13 }}
            />
            <button onClick={handleAddComment} style={{ height: 36, padding: '0 16px', borderRadius: 9, background: '#1a56db', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
