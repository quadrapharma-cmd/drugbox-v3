'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/actions/posts'
import { useLang } from '@/lib/i18n/LanguageProvider'
import styles from './Composer.module.css'

export default function Composer({ userInitials }: { userInitials: string }) {
  const router = useRouter()
  const { t } = useLang()
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [posting, setPosting] = useState(false)
  const [open, setOpen] = useState(false)

  async function handlePost() {
    if (!body.trim()) return
    setPosting(true)
    const res = await createPost({ body, category })
    setPosting(false)
    if (!res.error) {
      setBody('')
      setCategory('general')
      setOpen(false)
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  return (
    <div className={styles.composer}>
      <div className={styles.top}>
        <div className={styles.av}>{userInitials}</div>
        <textarea
          className={styles.input}
          value={body}
          onFocus={() => setOpen(true)}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('feed.composerPlaceholder')}
          rows={open ? 3 : 1}
        />
      </div>
      <div className={styles.actions}>
        <select
          className={styles.catSelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="general">{t('cat.general')}</option>
          <option value="regulatory">{t('cat.regulatory')}</option>
          <option value="market">{t('cat.market')}</option>
          <option value="innovation">{t('cat.innovation')}</option>
          <option value="job">{t('cat.job')}</option>
        </select>
        <button className={styles.postBtn} onClick={handlePost} disabled={posting || !body.trim()}>
          {posting ? t('feed.posting') : t('feed.post')}
        </button>
      </div>
    </div>
  )
}
