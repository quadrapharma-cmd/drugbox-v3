'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup, joinGroup, leaveGroup } from '@/actions/groups'
import styles from '@/app/groups/groups.module.css'

export default function GroupsClient({ initialGroups }: { initialGroups: any[] }) {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>(initialGroups)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👥')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleJoin(id: string) {
    const res = await joinGroup(id)
    if (res.error) { alert(res.error); return }
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, joined: true, myRole: 'member', memberCount: g.memberCount + 1 } : g)))
  }

  async function handleLeave(id: string) {
    const res = await leaveGroup(id)
    if (res.error) { alert(res.error); return } // shows sole-admin guard message
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, joined: false, myRole: null, memberCount: Math.max(0, g.memberCount - 1) } : g)))
  }

  async function handleCreate() {
    if (!name.trim()) { alert('Group name is required'); return }
    setSubmitting(true)
    const res = await createGroup({ name, emoji, description })
    setSubmitting(false)
    if (res.error) { alert(res.error); return }
    setShowModal(false)
    setName(''); setEmoji('👥'); setDescription('')
    router.refresh()
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.pageTitle}>Groups</div>
          <div className={styles.pageDesc}>Join professional communities in your field</div>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>+ Create Group</button>
      </div>

      <div className={styles.card}>
        {groups.length === 0 ? (
          <div className={styles.empty}>👥 No groups yet. Create the first one!</div>
        ) : (
          groups.map((g) => (
            <div key={g.id} className={styles.row}>
              <div className={styles.thumb}>{g.emoji}</div>
              <div className={styles.body}>
                <div className={styles.title}>
                  {g.name}
                  {g.myRole === 'admin' && <span className={styles.adminTag}>Admin</span>}
                </div>
                <div className={styles.sub}>
                  {g.description} · {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
                </div>
              </div>
              {g.joined ? (
                <button className={styles.btnLeave} onClick={() => handleLeave(g.id)}>Leave</button>
              ) : (
                <button className={styles.btnJoin} onClick={() => handleJoin(g.id)}>Join</button>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modalBg} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>Create a Group</h3>
              <button className={styles.modalX} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Group name *</label>
                <input className={styles.fieldInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sterile Manufacturing" />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Emoji</label>
                <input className={styles.fieldInput} value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea className={styles.fieldTextarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this group about?" />
              </div>
              <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
