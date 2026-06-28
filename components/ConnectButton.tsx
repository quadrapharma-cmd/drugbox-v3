'use client'

import { useState, useEffect } from 'react'
import { getConnectionStatus, sendConnectionRequest, acceptConnectionRequest } from '@/actions/connections'

export default function ConnectButton({ profileId }: { profileId: string }) {
  // BUG FIX: this used to start as 'loading' and render nothing (null) until
  // the status fetch resolved — if that request hung or failed, the Connect
  // button never appeared on the page at all, with zero feedback. Default
  // to 'none' (the most common real case) immediately, and correct it once
  // the real status loads, instead of hiding the button on a network wait.
  const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'self'>('none')
  const [resolved, setResolved] = useState(false)
  const [connectionId, setConnectionId] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    getConnectionStatus(profileId).then((res) => {
      if (!mounted) return
      if ('error' in res && res.error) { setResolved(true); return }
      setStatus(res.status as any)
      if ('connectionId' in res) setConnectionId(res.connectionId)
      setResolved(true)
    }).catch(() => { if (mounted) setResolved(true) })
    return () => { mounted = false }
  }, [profileId])

  async function handleConnect() {
    setBusy(true)
    try {
      const res = await sendConnectionRequest(profileId)
      if (res.error) throw new Error(res.error)
      setStatus('pending_sent')
    } catch (e: any) {
      alert(e.message || 'Could not send connection request.')
    } finally {
      setBusy(false)
    }
  }

  async function handleAccept() {
    if (!connectionId) return
    setBusy(true)
    try {
      const res = await acceptConnectionRequest(connectionId)
      if (res.error) throw new Error(res.error)
      setStatus('accepted')
    } catch (e: any) {
      alert(e.message || 'Could not accept connection request.')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'self') return null

  if (status === 'accepted') {
    return <button className="btn btn-ghost" disabled>✓ Connected</button>
  }
  if (status === 'pending_sent') {
    return <button className="btn btn-ghost" disabled>Pending</button>
  }
  if (status === 'pending_received') {
    return <button className="btn btn-primary" onClick={handleAccept} disabled={busy}>{busy ? 'Accepting…' : 'Accept Request'}</button>
  }
  return <button className="btn btn-primary" onClick={handleConnect} disabled={busy}>{busy ? 'Sending…' : '🤝 Connect'}</button>
}
