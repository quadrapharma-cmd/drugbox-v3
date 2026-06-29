'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getConversation, sendMessage } from '@/actions/messages'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import styles from '@/app/messages/messages-approved.module.css'

function initials(n: string) {
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000
  if (s < 60) return 'now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}
const AV_COLORS = ['#0E8C66', '#7A5680', '#246C8E', '#B0883F', '#A24B57', '#1a56db']

export default function MessagesApproved({ initialThreads, currentUserId, openPartnerId }: { initialThreads: any[]; currentUserId: string; openPartnerId?: string }) {
  const { t } = useLang()
  const supabase = createClient()
  const [threads, setThreads] = useState<any[]>(initialThreads)
  const [activePartner, setActivePartner] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const bodyRef = useRef<HTMLDivElement>(null)

  const scrollDown = useCallback(() => {
    setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, 50)
  }, [])

  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState(false)

  async function openThread(partnerId: string) {
    // BUG FIX: this used to await getConversation() before showing anything,
    // so a slow or failed request made clicking a thread look like it did
    // nothing at all. Now the panel switches to this partner immediately
    // (using the data we already have from the thread list) and shows a
    // loading state while the full message history loads in the background.
    const known = threads.find((t) => t.partnerId === partnerId)?.partner
    if (known) setActivePartner(known)
    setMessages([])
    setMessagesError(false)
    setMessagesLoading(true)
    setThreads((prev) => prev.map((th) => (th.partnerId === partnerId ? { ...th, unread: 0 } : th)))

    try {
      const res = await getConversation(partnerId)
      if (res.error) throw new Error(res.error)
      setActivePartner(res.partner)
      setMessages(res.messages)
      scrollDown()
    } catch {
      setMessagesError(true)
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    if (openPartnerId) {
      openThread(openPartnerId)
    } else if (threads.length && !activePartner) {
      openThread(threads[0].partnerId)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUserId}` }, (payload) => {
        const m = payload.new as any
        if (activePartner && m.sender_id === activePartner.id) {
          setMessages((prev) => [...prev, m])
          scrollDown()
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, currentUserId, activePartner, scrollDown])

  async function handleSend() {
    const body = input.trim()
    if (!body || !activePartner) return
    setInput('')
    const optimistic = { id: `tmp-${Date.now()}`, sender_id: currentUserId, receiver_id: activePartner.id, body, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, optimistic])
    scrollDown()
    try {
      const res = await sendMessage(activePartner.id, body)
      if (res.error) throw new Error(res.error)
    } catch (e: any) {
      alert(e.message || 'Could not send your message. Please try again.')
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    }
  }

  function quickReply(text: string) { setInput(text) }

  const filteredThreads = threads.filter((t) => filter === 'all' || (filter === 'unread' && t.unread > 0))

  return (
    <>
      <div className={styles['topbar']}>
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className={styles['sw']}><span className={styles['si-ic']}>🔍</span><input className={styles['si']} placeholder={t('msg.searchPlaceholder')} /></div>
        <div className={styles['tnav-wrap']}>
          <Link href="/feed" className={styles['tnav']} style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className={styles['tnav']} style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className={styles['tnav']} style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className={`${styles['tnav']} ${styles['active']}`} style={{ textDecoration: 'none' }}>💬</Link>
          <div className={styles['tnav']} style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Not built yet">🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className={styles['av']} style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>U</Link>
      </div>

      <div className={styles['layout']}>
        <div className={styles['thread-panel']}>
          <div className={styles['tp-head']}>
            <div className={styles['tp-title']}>{t('msg.title')} <button className={styles['tp-new']} title="New message">✎</button></div>
            <input className={styles['tp-search']} placeholder={`🔍 ${t('msg.searchConversations')}`} />
          </div>
          <div className={styles['tp-filter-row']}>
            <div className={`${styles['tp-filter']} ${filter === 'all' ? styles['on'] : ''}`} onClick={() => setFilter('all')}>{t('msg.all')}</div>
            <div className={`${styles['tp-filter']} ${filter === 'unread' ? styles['on'] : ''}`} onClick={() => setFilter('unread')}>{t('msg.unread')} ({threads.filter((t) => t.unread > 0).length})</div>
            <div className={styles['tp-filter']}>🤝 {t('msg.deals')}</div>
            <div className={styles['tp-filter']}>📋 {t('msg.services')}</div>
          </div>

          {threads.length > 0 && (
            <div className={styles['online-strip']}>
              <div className={styles['online-strip-title']}><span className={styles['online-strip-dot']}></span> {t('msg.onlineNow')} ({threads.length})</div>
              <div className={styles['online-avatars']}>
                {threads.slice(0, 4).map((th, i) => (
                  <div className={styles['online-avatar-item']} key={th.partnerId} onClick={() => openThread(th.partnerId)}>
                    <div className={styles['av']} style={{ background: AV_COLORS[i % AV_COLORS.length] }}>{initials(th.partner.name)}<div className={styles['online-dot']}></div></div>
                    <div className={styles['online-avatar-name']}>{th.partner.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles['thread-list']}>
            {filteredThreads.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No conversations yet</div>
            ) : (
              filteredThreads.map((th, i) => (
                <div
                  key={th.partnerId}
                  className={`${styles['thread']} ${activePartner?.id === th.partnerId ? styles['active'] : ''} ${th.unread > 0 ? styles['unread'] : ''}`}
                  onClick={() => openThread(th.partnerId)}
                >
                  <div className={styles['av']} style={{ background: AV_COLORS[i % AV_COLORS.length], width: 44, height: 44, fontSize: 15 }}>{initials(th.partner.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles['t-row']}><div className={styles['t-name']}>{th.partner.name} {th.partner.verified && <span style={{ color: '#1a56db', fontSize: 10 }}>✓</span>}</div><div className={styles['t-time']}>{th.last ? timeAgo(th.last.created_at) : ''}</div></div>
                    <div className={`${styles['t-preview']} ${th.unread > 0 ? styles['unread-text'] : ''}`}>{th.last?.body || ''}</div>
                  </div>
                  {th.unread > 0 && <div className={styles['t-badge']}>{th.unread}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles['chat-panel']}>
          {!activePartner ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('msg.selectConversation')}</div>
          ) : (
            <>
              <div className={styles['chat-head']}>
                <div className={styles['av']} style={{ background: '#0E8C66', width: 40, height: 40, fontSize: 14 }}>{initials(activePartner.name)}</div>
                <div>
                  <div className={styles['ch-name']}>{activePartner.name} {activePartner.verified && <span style={{ color: '#1a56db', fontSize: 11 }}>✓</span>}</div>
                  <div className={styles['ch-status']}>● {activePartner.headline || activePartner.company || 'Drugbox member'}</div>
                </div>
                <div className={styles['ch-actions']}>
                  <button className={styles['ch-action-btn']}>⋯</button>
                </div>
              </div>

              <div className={styles['messages-area']} ref={bodyRef}>
                {messagesLoading && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12.5, padding: 10 }}>Loading messages…</div>}
                {messagesError && <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 12.5, padding: 10 }}>Couldn&apos;t load this conversation. Please try again.</div>}
                {messages.map((m) => (
                  <div className={`${styles['msg-row']} ${m.sender_id === currentUserId ? styles['mine'] : styles['theirs']}`} key={m.id}>
                    {m.sender_id !== currentUserId && <div className={styles['av']} style={{ background: '#0E8C66', width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>{initials(activePartner.name)}</div>}
                    <div>
                      <div className={`${styles['bubble']} ${m.sender_id === currentUserId ? styles['mine'] : styles['theirs']}`}>{m.body}</div>
                      <div className={styles['bubble-time']} style={m.sender_id === currentUserId ? { textAlign: 'right' } : {}}>{timeAgo(m.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles['quick-replies']}>
                <div className={styles['qr-chip']} onClick={() => quickReply('📄 Could you send the COA / Certificate of Analysis?')}>📄 {t('msg.requestCOA')}</div>
                <div className={styles['qr-chip']} onClick={() => quickReply('📋 Would it be possible to get a sample first?')}>📋 {t('msg.askSamples')}</div>
                <div className={styles['qr-chip']} onClick={() => quickReply('💰 Is there any flexibility on the price?')}>💰 {t('msg.negotiatePrice')}</div>
                <div className={styles['qr-chip']} onClick={() => quickReply('📅 Could we schedule a call to discuss further?')}>📅 {t('msg.scheduleCall')}</div>
              </div>

              <div className={styles['compose-bar']}>
                <div className={styles['compose-attach']}>
                  <button className={styles['attach-btn']} title="Attach file">📎</button>
                  <button className={styles['attach-btn']} title="Attach photo">📷</button>
                </div>
                <textarea className={styles['compose-input']} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder={t('msg.typeMessage')} rows={1} />
                <button className={styles['send-btn']} onClick={handleSend}>➤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
