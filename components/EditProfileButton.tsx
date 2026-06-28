'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/actions/profile'

export default function EditProfileButton({ profile }: { profile: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(profile.name || '')
  const [headline, setHeadline] = useState(profile.headline || '')
  const [company, setCompany] = useState(profile.company || '')
  const [location, setLocation] = useState(profile.location || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [website, setWebsite] = useState(profile.website || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await updateProfile({ name, headline, company, location, bio, website, phone })
      if (res.error) throw new Error(res.error)
      setOpen(false)
      router.refresh()
    } catch (e: any) {
      alert(e.message || 'Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button className="btn btn-ghost" onClick={() => setOpen(true)}>✏️ Edit Profile</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,24,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e4e6eb', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Edit Profile</h3>
              <button onClick={() => setOpen(false)} style={{ fontSize: 22, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {[
                ['Name', name, setName],
                ['Headline', headline, setHeadline],
                ['Company', company, setCompany],
                ['Location', location, setLocation],
                ['Website', website, setWebsite],
                ['Phone', phone, setPhone],
              ].map(([label, value, setter]: any) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{label}</label>
                  <input value={value} onChange={(e) => setter(e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 13px' }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', minHeight: 90, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 13 }} />
              </div>
              <button onClick={handleSave} disabled={saving} style={{ width: '100%', height: 44, borderRadius: 11, background: '#1a56db', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
