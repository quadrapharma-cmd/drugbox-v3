'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getConversation, sendMessage } from '@/actions/messages'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'

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
      <div className="topbar">
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className="sw"><span className="si-ic">🔍</span><input className="si" placeholder={t('msg.searchPlaceholder')} /></div>
        <div className="tnav-wrap">
          <Link href="/feed" className="tnav" style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className="tnav" style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className="tnav" style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className="tnav active" style={{ textDecoration: 'none' }}>💬</Link>
          <div className="tnav" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Not built yet">🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className="av" style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>U</Link>
      </div>

      <div className="layout">
        <div className="thread-panel">
          <div className="tp-head">
            <div className="tp-title">{t('msg.title')} <button className="tp-new" title="New message">✎</button></div>
            <input className="tp-search" placeholder={`🔍 ${t('msg.searchConversations')}`} />
          </div>
          <div className="tp-filter-row">
            <div className={`tp-filter ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>{t('msg.all')}</div>
            <div className={`tp-filter ${filter === 'unread' ? 'on' : ''}`} onClick={() => setFilter('unread')}>{t('msg.unread')} ({threads.filter((t) => t.unread > 0).length})</div>
            <div className="tp-filter">🤝 {t('msg.deals')}</div>
            <div className="tp-filter">📋 {t('msg.services')}</div>
          </div>

          {threads.length > 0 && (
            <div className="online-strip">
              <div className="online-strip-title"><span className="online-strip-dot"></span> {t('msg.onlineNow')} ({threads.length})</div>
              <div className="online-avatars">
                {threads.slice(0, 4).map((th, i) => (
                  <div className="online-avatar-item" key={th.partnerId} onClick={() => openThread(th.partnerId)}>
                    <div className="av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>{initials(th.partner.name)}<div className="online-dot"></div></div>
                    <div className="online-avatar-name">{th.partner.name.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="thread-list">
            {filteredThreads.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No conversations yet</div>
            ) : (
              filteredThreads.map((th, i) => (
                <div
                  key={th.partnerId}
                  className={`thread ${activePartner?.id === th.partnerId ? 'active' : ''} ${th.unread > 0 ? 'unread' : ''}`}
                  onClick={() => openThread(th.partnerId)}
                >
                  <div className="av" style={{ background: AV_COLORS[i % AV_COLORS.length], width: 44, height: 44, fontSize: 15 }}>{initials(th.partner.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-row"><div className="t-name">{th.partner.name} {th.partner.verified && <span style={{ color: '#1a56db', fontSize: 10 }}>✓</span>}</div><div className="t-time">{th.last ? timeAgo(th.last.created_at) : ''}</div></div>
                    <div className={`t-preview ${th.unread > 0 ? 'unread-text' : ''}`}>{th.last?.body || ''}</div>
                  </div>
                  {th.unread > 0 && <div className="t-badge">{th.unread}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-panel">
          {!activePartner ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('msg.selectConversation')}</div>
          ) : (
            <>
              <div className="chat-head">
                <div className="av" style={{ background: '#0E8C66', width: 40, height: 40, fontSize: 14 }}>{initials(activePartner.name)}</div>
                <div>
                  <div className="ch-name">{activePartner.name} {activePartner.verified && <span style={{ color: '#1a56db', fontSize: 11 }}>✓</span>}</div>
                  <div className="ch-status">● {activePartner.headline || activePartner.company || 'Drugbox member'}</div>
                </div>
                <div className="ch-actions">
                  <button className="ch-action-btn">⋯</button>
                </div>
              </div>

              <div className="messages-area" ref={bodyRef}>
                {messagesLoading && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12.5, padding: 10 }}>Loading messages…</div>}
                {messagesError && <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 12.5, padding: 10 }}>Couldn&apos;t load this conversation. Please try again.</div>}
                {messages.map((m) => (
                  <div className={`msg-row ${m.sender_id === currentUserId ? 'mine' : 'theirs'}`} key={m.id}>
                    {m.sender_id !== currentUserId && <div className="av" style={{ background: '#0E8C66', width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>{initials(activePartner.name)}</div>}
                    <div>
                      <div className={`bubble ${m.sender_id === currentUserId ? 'mine' : 'theirs'}`}>{m.body}</div>
                      <div className="bubble-time" style={m.sender_id === currentUserId ? { textAlign: 'right' } : {}}>{timeAgo(m.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="quick-replies">
                <div className="qr-chip" onClick={() => quickReply('📄 Could you send the COA / Certificate of Analysis?')}>📄 {t('msg.requestCOA')}</div>
                <div className="qr-chip" onClick={() => quickReply('📋 Would it be possible to get a sample first?')}>📋 {t('msg.askSamples')}</div>
                <div className="qr-chip" onClick={() => quickReply('💰 Is there any flexibility on the price?')}>💰 {t('msg.negotiatePrice')}</div>
                <div className="qr-chip" onClick={() => quickReply('📅 Could we schedule a call to discuss further?')}>📅 {t('msg.scheduleCall')}</div>
              </div>

              <div className="compose-bar">
                <div className="compose-attach">
                  <button className="attach-btn" title="Attach file">📎</button>
                  <button className="attach-btn" title="Attach photo">📷</button>
                </div>
                <textarea className="compose-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder={t('msg.typeMessage')} rows={1} />
                <button className="send-btn" onClick={handleSend}>➤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
