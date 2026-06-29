'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/actions/posts'
import styles from '@/app/feed/feed-approved.module.css'

export default function FeedComposer({ inits }: { inits: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [posting, setPosting] = useState(false)

  async function handlePost() {
    if (!body.trim()) return
    setPosting(true)
    try {
      const res = await createPost({ body, category })
      if (res.error) throw new Error(res.error)
      setBody('')
      setCategory('general')
      setOpen(false)
      router.refresh()
    } catch (e: any) {
      alert(e.message || 'Could not publish your post. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className={styles['composer']}>
      <div className={styles['composer-top']}>
        <div className={styles['sb-av']} style={{ width: 40, height: 40 }}>{inits}</div>
        {open ? (
          <textarea
            className={styles['composer-input']}
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: 14 }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share an update, ask a question..."
            rows={3}
            autoFocus
          />
        ) : (
          <div className={styles['composer-input']} onClick={() => setOpen(true)} style={{ cursor: 'text' }}>
            Share an update, ask a question...
          </div>
        )}
      </div>
      <div className={styles['composer-actions']}>
        {open ? (
          <>
            <select className={styles['composer-action']} style={{ border: '1px solid #e4e6eb', cursor: 'pointer' }} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="general">General</option>
              <option value="regulatory">Regulatory</option>
              <option value="market">Market</option>
              <option value="innovation">Innovation</option>
              <option value="job">Job</option>
            </select>
            <div className={styles['composer-action']} style={{ background: '#1a56db', color: '#fff', cursor: posting ? 'wait' : 'pointer', marginLeft: 'auto' }} onClick={handlePost}>
              {posting ? 'Posting…' : 'Post'}
            </div>
          </>
        ) : (
          <>
            <div className={`${styles['composer-action']} ${styles['photo']}`}>📷 Photo</div>
            <div className={`${styles['composer-action']} ${styles['product']}`} onClick={() => setOpen(true)}>🛒 List Product</div>
            <div className={`${styles['composer-action']} ${styles['job']}`} onClick={() => setOpen(true)}>💼 Post Job</div>
            <div className={`${styles['composer-action']} ${styles['regulatory']}`} onClick={() => setOpen(true)}>📋 Regulatory</div>
          </>
        )}
      </div>
    </div>
  )
}
