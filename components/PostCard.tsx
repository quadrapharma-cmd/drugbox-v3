'use client'

import { useState } from 'react'
import { toggleReaction, deletePost, getComments, addComment } from '@/actions/posts'
import styles from './PostCard.module.css'

interface Author {
  id: string
  name: string
  headline?: string
  company?: string
  avatar_url?: string
  verified?: boolean
}
interface Post {
  id: string
  body: string
  category: string
  image_urls?: string[] | null
  created_at: string
  user_id: string
  author: Author | null
  reactionCount: number
  commentCount: number
  myReaction: boolean
}

const CAT_STYLE: Record<string, string> = {
  regulatory: styles.catRegulatory,
  market: styles.catMarket,
  general: styles.catGeneral,
  innovation: styles.catInnovation,
  job: styles.catJob,
}
const CAT_LABEL: Record<string, string> = {
  regulatory: 'Regulatory',
  market: 'Market',
  general: 'General',
  innovation: 'Innovation',
  job: 'Job',
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

export default function PostCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const [liked, setLiked] = useState(post.myReaction)
  const [likeCount, setLikeCount] = useState(post.reactionCount)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [deleted, setDeleted] = useState(false)

  const a = post.author

  async function handleLike() {
    // optimistic
    setLiked((v) => !v)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
    const res = await toggleReaction(post.id)
    if (res.error) {
      // rollback
      setLiked((v) => !v)
      setLikeCount((c) => (liked ? c + 1 : c - 1))
    }
  }

  async function handleToggleComments() {
    if (!showComments) {
      const res = await getComments(post.id)
      if (!res.error) setComments(res.comments)
    }
    setShowComments((v) => !v)
  }

  async function handleAddComment() {
    const body = newComment.trim()
    if (!body) return
    const res = await addComment(post.id, body)
    if (!res.error) {
      setNewComment('')
      setCommentCount((c) => c + 1)
      const r = await getComments(post.id)
      if (!r.error) setComments(r.comments)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    const res = await deletePost(post.id)
    if (!res.error) setDeleted(true)
  }

  if (deleted) return null
  if (!a) return null

  return (
    <div className={styles.post}>
      <div className={styles.postHead}>
        <div className={styles.postAv}>{a.avatar_url ? '' : initials(a.name)}</div>
        <div>
          <div className={styles.postAuthor}>
            {a.name} {a.verified && <span className={styles.tick}>✓</span>}
          </div>
          <div className={styles.postMeta}>
            {a.headline}
            {a.company ? ` · ${a.company}` : ''} · {timeAgo(post.created_at)}
          </div>
        </div>
        <span className={`${styles.postCat} ${CAT_STYLE[post.category] || styles.catGeneral}`}>
          {CAT_LABEL[post.category] || 'General'}
        </span>
      </div>

      {post.body && <div className={styles.postBody}>{post.body}</div>}

      <div className={styles.postStats}>
        <span>👍 {likeCount} reactions</span>
        <span>{commentCount} comments</span>
      </div>

      <div className={styles.postActions}>
        <button className={`${styles.actionBtn} ${liked ? styles.liked : ''}`} onClick={handleLike}>
          👍 Like
        </button>
        <button className={styles.actionBtn} onClick={handleToggleComments}>
          💬 Comment
        </button>
        {post.user_id === currentUserId && (
          <button className={styles.actionBtn} onClick={handleDelete} style={{ marginLeft: 'auto' }}>
            🗑️
          </button>
        )}
      </div>

      {showComments && (
        <div className={styles.comments}>
          {comments.map((c) => (
            <div key={c.id} className={styles.comment}>
              <div className={styles.commentAv}>{c.author ? initials(c.author.name) : '?'}</div>
              <div className={styles.commentBody}>
                <div className={styles.commentName}>
                  {c.author?.name} {c.author?.verified && <span className={styles.tick}>✓</span>}
                </div>
                <div className={styles.commentText}>{c.body}</div>
              </div>
            </div>
          ))}
          <div className={styles.commentBox}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment…"
            />
            <button onClick={handleAddComment}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
