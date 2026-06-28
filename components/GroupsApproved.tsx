'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createGroup, joinGroup, leaveGroup } from '@/actions/groups'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'

const COVER_COLORS = [
  'linear-gradient(135deg,#1040a0,#2D6BE4)', 'linear-gradient(135deg,#0369a1,#0ea5e9)',
  'linear-gradient(135deg,#065f46,#16a34a)', 'linear-gradient(135deg,#6d28d9,#a78bfa)',
  'linear-gradient(135deg,#be123c,#fb7185)', 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
]

export default function GroupsApproved({ initialGroups, currentUserId }: { initialGroups: any[]; currentUserId: string }) {
  const router = useRouter()
  const { t } = useLang()
  const [groups, setGroups] = useState<any[]>(initialGroups)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [emoji, setEmoji] = useState('👥')
  const [submitting, setSubmitting] = useState(false)

  const myGroups = groups.filter((g) => g.joined)
  const suggested = groups.filter((g) => !g.joined)

  async function handleJoin(id: string) {
    try {
      const res = await joinGroup(id)
      if (res.error) throw new Error(res.error)
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, joined: true, memberCount: g.memberCount + 1 } : g)))
    } catch (e: any) {
      alert(e.message || 'Could not join this group. Please try again.')
    }
  }
  async function handleLeave(id: string) {
    try {
      const res = await leaveGroup(id)
      if (res.error) throw new Error(res.error) // also surfaces the sole-admin guard message
      setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, joined: false, memberCount: Math.max(0, g.memberCount - 1) } : g)))
    } catch (e: any) {
      alert(e.message || 'Could not leave this group. Please try again.')
    }
  }
  async function handleCreate() {
    if (!name.trim()) { alert('Group name is required'); return }
    setSubmitting(true)
    try {
      const res = await createGroup({ name, description: desc, emoji })
      if (res.error) throw new Error(res.error)
      setShowModal(false); setName(''); setDesc(''); setEmoji('👥')
      router.refresh()
    } catch (e: any) {
      alert(e.message || 'Could not create the group. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function GCard({ g, idx, suggested: isSuggested }: { g: any; idx: number; suggested?: boolean }) {
    return (
      <div className="gcard" key={g.id}>
        <div className="gcard-cover" style={{ background: COVER_COLORS[idx % COVER_COLORS.length] }}>{g.emoji}</div>
        <div className="gcard-body">
          <div className="gcard-title">{g.name}</div>
          <div className="gcard-desc">{g.description}</div>
          <div className="gcard-meta"><span className="gtag gtag-discuss">DISCUSS</span><span className="gtag gtag-public">Public</span></div>
          <div className="activity-signal">{g.memberCount} members</div>
          <div className="gcard-footer">
            <div style={{ display: 'flex', alignItems: 'center' }}><span className="member-count">{g.memberCount} members</span></div>
            {g.joined ? (
              <button className="gcard-btn btn-joined" onClick={() => handleLeave(g.id)}>✓ {t('groups.joined')}</button>
            ) : (
              <button className="gcard-btn btn-join" onClick={() => handleJoin(g.id)}>+ {t('groups.join')}</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="topbar">
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className="sw"><span className="si-ic">🔍</span><input className="si" placeholder={t('common.search')} /></div>
        <div className="tnav-wrap">
          <Link href="/feed" className="tnav" style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className="tnav" style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className="tnav active" style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className="tnav" style={{ textDecoration: 'none' }}>💬</Link>
          <div className="tnav" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Not built yet">🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className="av" style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>U</Link>
      </div>

      <div className="hero">
        <div className="hero-content">
          <div>
            <div className="hero-eyebrow">{t('groups.communities')}</div>
            <div className="hero-title">{t('groups.title')}</div>
            <div className="hero-sub">{t('groups.subtitle')}</div>
          </div>
          <button className="hero-btn" onClick={() => setShowModal(true)}>➕ {t('groups.createGroup')}</button>
        </div>
      </div>

      <div className="intel-strip">
        <div className="intel-item"><span className="intel-dot"></span> <b>{myGroups.length}</b> groups joined</div>
        <div className="intel-divider"></div>
        <div className="intel-item">👥 <b>{groups.length}</b> total communities available</div>
      </div>

      <div className="cat-filter">
        <div className="cf-tag on">{t('groups.allGroups')}</div>
        <div className="filter-sep"></div>
        <div className="cf-tag">👤 My Groups ({myGroups.length})</div>
        <div className="cf-tag">💬 {t('groups.discussion')}</div>
        <div className="cf-tag">🤝 {t('groups.dealRooms')}</div>
      </div>

      <div className="layout">
        <div className="sidebar">
          <div className="sb-title">👤 {t('groups.yourGroups')}</div>
          {myGroups.length === 0 ? (
            <div style={{ fontSize: 12.5, color: '#94a3b8', padding: '8px 0' }}>{t('groups.notJoinedYet')}</div>
          ) : (
            myGroups.map((g) => (
              <div className="mygroup" key={g.id}>
                <div className="mg-ic" style={{ background: '#dbeafe' }}>{g.emoji}</div>
                <div><div className="mg-name">{g.name}</div><div className="mg-meta">{g.memberCount} members</div></div>
                {g.myRole === 'admin' && <div className="mg-badge">👑</div>}
              </div>
            ))
          )}

          <div className="sb-divider"></div>
          <div className="create-link" onClick={() => setShowModal(true)}>
            <div className="create-link-ic">➕</div>
            <div>{t('groups.createNewGroup')}</div>
          </div>

          <div className="intel-panel">
            <div className="ip-icon">🧠</div>
            <div className="ip-title">{t('groups.yourActivity')}</div>
            <div className="ip-sub">You&apos;re part of {myGroups.length} communities on Drugbox.</div>
          </div>

          <div className="legend">
            <div className="legend-item"><span className="gtag gtag-discuss">DISCUSS</span> {t('groups.discussLegend')}</div>
            <div className="legend-item"><span className="gtag gtag-deal">DEAL ROOM</span> {t('groups.dealRoomLegend')}</div>
          </div>
        </div>

        <div className="main">
          <div>
            <div className="sec-hdr">
              <div><div className="sec-title">👤 {t('groups.yourGroups')}</div><div className="sec-sub">{t('groups.sortedActivity')}</div></div>
            </div>
            <div className="groups-grid">
              {myGroups.length === 0 ? (
                <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>{t('groups.notJoinedYet')}</div>
              ) : (
                myGroups.map((g, i) => <GCard g={g} idx={i} key={g.id} />)
              )}
            </div>
          </div>

          <div>
            <div className="sec-hdr">
              <div><div className="sec-title">✨ {t('groups.suggested')}</div><div className="sec-sub">{t('groups.notJoinedCommunities')}</div></div>
            </div>
            <div className="groups-grid">
              {suggested.length === 0 ? (
                <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>{t('groups.joinedEvery')}</div>
              ) : (
                suggested.map((g, i) => <GCard g={g} idx={i} suggested key={g.id} />)
              )}
            </div>
          </div>

          <div>
            <div className="sec-hdr">
              <div><div className="sec-title">🤝 {t('groups.dealRoomsRegion')}</div><div className="sec-sub">{t('groups.dealRoomsSub')}</div></div>
            </div>
            <div className="groups-grid">
              {[
                { name: 'Packaging & Logistics Deal Room', desc: 'Blister packs, cartons, cold-chain logistics partners.', emoji: '📦', members: '410', bg: 'linear-gradient(135deg,#1d4ed8,#60a5fa)' },
                { name: 'Careers & Training Egypt', desc: 'Job postings, GMP training events, career advice.', emoji: '🎓', members: '1,850', bg: 'linear-gradient(135deg,#0e7490,#22d3ee)' },
                { name: 'Medical Devices Egypt', desc: 'EDA device registration, distributors, clinical evaluation.', emoji: '🏥', members: '380', bg: 'linear-gradient(135deg,#065f46,#16a34a)' },
              ].map((d) => (
                <div className="gcard" key={d.name}>
                  <div className="gcard-cover" style={{ background: d.bg }}>{d.emoji}</div>
                  <div className="gcard-body">
                    <div className="gcard-title">{d.name}</div>
                    <div className="gcard-desc">{d.desc}</div>
                    <div className="gcard-meta"><span className="gtag gtag-deal">DEAL ROOM</span><span className="gtag gtag-public">Public</span></div>
                    <div className="gcard-footer">
                      <div style={{ display: 'flex', alignItems: 'center' }}><span className="member-count">{d.members} members</span></div>
                      <button className="gcard-btn btn-join">+ {t('groups.join')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,24,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e4e6eb', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Create a Group</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 22, color: '#64748b' }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Group name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sterile Manufacturing" style={{ width: '100%', height: 42, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 13px' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Emoji</label>
                <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} style={{ width: '100%', height: 42, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 13px' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Description</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', minHeight: 80, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 13 }} />
              </div>
              <button onClick={handleCreate} disabled={submitting} className="hero-btn" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                {submitting ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
