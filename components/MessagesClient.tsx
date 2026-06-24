'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getThreads, getConversation, sendMessage } from '@/actions/messages'
import styles from '@/app/messages/messages.module.css'

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000
  if (s < 60) return 'now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}

export default function MessagesClient({ initialThreads, currentUserId }: { initialThreads: any[]; currentUserId: string }) {
  const supabase = createClient()
  const [threads, setThreads] = useState<any[]>(initialThreads)
  const [activePartner, setActivePartner] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, 50)
  }, [])

  async function openThread(partnerId: string) {
    const res = await getConversation(partnerId)
    if (res.error) return
    setActivePartner(res.partner)
    setMessages(res.messages)
    scrollToBottom()
    // Clear unread badge locally
    setThreads((prev) => prev.map((t) => (t.partnerId === partnerId ? { ...t, unread: 0 } : t)))
  }

  // Realtime: subscribe to new messages involving me
  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUserId}` },
        (payload) => {
          const m = payload.new as any
          // If it belongs to the open conversation, append it
          if (activePartner && m.sender_id === activePartner.id) {
            setMessages((prev) => [...prev, m])
            scrollToBottom()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentUserId, activePartner, scrollToBottom])

  async function handleSend() {
    const body = input.trim()
    if (!body || !activePartner) return
    setInput('')
    // optimistic
    const optimistic = { id: `tmp-${Date.now()}`, sender_id: currentUserId, receiver_id: activePartner.id, body, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, optimistic])
    scrollToBottom()
    const res = await sendMessage(activePartner.id, body)
    if (res.error) {
      alert(res.error)
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    }
  }

  return (
    <>
      <div className={styles.pageTitle}>Messages</div>
      <div className={styles.layout}>
        <div className={styles.list}>
          {threads.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No conversations yet</div>
          ) : (
            threads.map((t) => (
              <button
                key={t.partnerId}
                className={`${styles.thread} ${activePartner?.id === t.partnerId ? styles.active : ''}`}
                onClick={() => openThread(t.partnerId)}
              >
                <div className={styles.tAv}>{initials(t.partner.name)}</div>
                <div className={styles.tInfo}>
                  <div className={styles.tName}>
                    <span>{t.partner.name}</span>
                    <span className={styles.tTime}>{t.last ? timeAgo(t.last.created_at) : ''}</span>
                  </div>
                  <div className={styles.tPrev}>{t.last?.body || ''}</div>
                </div>
                {t.unread > 0 && <div className={styles.tBadge}>{t.unread}</div>}
              </button>
            ))
          )}
        </div>

        <div className={styles.panel}>
          {!activePartner ? (
            <div className={styles.msgEmpty}>Select a conversation to start messaging</div>
          ) : (
            <>
              <div className={styles.panelHead}>
                <div className={styles.tAv}>{initials(activePartner.name)}</div>
                <div>
                  <div className={styles.panelName}>{activePartner.name}</div>
                  <div className={styles.panelSub}>{activePartner.company || activePartner.headline || ''}</div>
                </div>
              </div>
              <div className={styles.msgBody} ref={bodyRef}>
                {messages.map((m) => (
                  <div key={m.id} className={`${styles.bubble} ${m.sender_id === currentUserId ? styles.me : styles.them}`}>
                    {m.body}
                    <div className={styles.bTime}>{timeAgo(m.created_at)}</div>
                  </div>
                ))}
              </div>
              <div className={styles.compose}>
                <input
                  className={styles.composeInput}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message…"
                />
                <button className={styles.sendBtn} onClick={handleSend}>➤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
