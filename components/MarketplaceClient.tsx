'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getListings, getMyListings, createListing, deleteListing, inquireAboutListing } from '@/actions/listings'
import styles from '@/app/marketplace/marketplace.module.css'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'supply', label: 'Supply' },
  { key: 'demand', label: 'Demand' },
  { key: 'cmo', label: 'CMO' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'license', label: 'License' },
  { key: 'service', label: 'Service' },
  { key: 'training', label: 'Training' },
]
const CAT_ICON: Record<string, string> = {
  supply: '⚗️', demand: '🔍', cmo: '🏭', equipment: '🔧',
  license: '📜', service: '📋', job: '💼', training: '🎓',
}

// First-person dual-intent language per category (the approved pattern)
const INTENT_LABELS: Record<string, { offering: string; seeking: string }> = {
  supply: { offering: 'I am supplying this product', seeking: 'I am looking to buy this product' },
  demand: { offering: 'I am supplying this product', seeking: 'I am looking to buy this product' },
  cmo: { offering: 'I offer contract manufacturing', seeking: 'I need a contract manufacturer' },
  equipment: { offering: 'I am selling equipment', seeking: 'I am looking for equipment' },
  license: { offering: 'I am offering a license', seeking: 'I am seeking a license' },
  service: { offering: 'I provide this service', seeking: 'I need this service' },
  training: { offering: 'I offer this training', seeking: 'I am looking for training' },
}

type Tab = 'browse' | 'create' | 'mine'

export default function MarketplaceClient({ initialListings, currentUserId }: { initialListings: any[]; currentUserId: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('browse')
  const [filter, setFilter] = useState('all')
  const [listings, setListings] = useState<any[]>(initialListings)
  const [myListings, setMyListings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadBrowse = useCallback(async (cat: string) => {
    setLoading(true)
    const res = await getListings({ category: cat })
    if (!res.error) setListings(res.listings)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'mine') {
      getMyListings().then((res) => { if (!res.error) setMyListings(res.listings) })
    }
  }, [tab])

  function handleFilter(cat: string) {
    setFilter(cat)
    loadBrowse(cat)
  }

  async function handleInquire(listingId: string) {
    const res = await inquireAboutListing(listingId)
    if (res.error) { alert(res.error); return }
    router.push('/messages')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing?')) return
    const res = await deleteListing(id)
    if (!res.error) setMyListings((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.pageTitle}>Marketplace</div>
          <div className={styles.pageDesc}>Source pharmaceutical products, APIs, equipment, and services</div>
        </div>
        {tab !== 'create' && (
          <button className={styles.btnPrimary} onClick={() => setTab('create')}>+ Create Listing</button>
        )}
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'browse' ? styles.active : ''}`} onClick={() => setTab('browse')}>Browse</button>
        <button className={`${styles.tab} ${tab === 'create' ? styles.active : ''}`} onClick={() => setTab('create')}>Create Listing</button>
        <button className={`${styles.tab} ${tab === 'mine' ? styles.active : ''}`} onClick={() => setTab('mine')}>My Listings</button>
      </div>

      {tab === 'browse' && (
        <>
          <div className={styles.filters}>
            {CATEGORIES.map((c) => (
              <button key={c.key} className={`${styles.chip} ${filter === c.key ? styles.active : ''}`} onClick={() => handleFilter(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.grid}>
            {loading ? (
              <div className={styles.empty}>Loading…</div>
            ) : listings.length === 0 ? (
              <div className={styles.empty}>📦 No listings in this category yet</div>
            ) : (
              listings.map((l) => (
                <div key={l.id} className={styles.product}>
                  <div className={styles.productImg}>
                    <span>{CAT_ICON[l.category] || '📦'}</span>
                    {l.boosted && <span className={styles.productTag}>⭐ Boosted</span>}
                  </div>
                  <div className={styles.productBody}>
                    <div className={styles.productCat}>
                      {l.category}{' '}
                      <span className={`${styles.intentBadge} ${l.role === 'offering' ? styles.intentOffering : styles.intentSeeking}`}>
                        {l.role === 'offering' ? 'Offering' : 'Seeking'}
                      </span>
                    </div>
                    <div className={styles.productName}>{l.title}</div>
                    <div className={styles.productSupplier}>
                      {l.seller?.company || l.seller?.name} {l.seller?.verified && <span style={{ color: '#1a56db' }}>✓</span>}
                    </div>
                    <div className={styles.productMeta}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{l.views_count} views</div>
                      {l.user_id !== currentUserId && (
                        <button className={styles.inquireBtn} onClick={() => handleInquire(l.id)}>Inquire</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'create' && <CreateForm onCreated={() => { setTab('browse'); loadBrowse('all') }} />}

      {tab === 'mine' && (
        <div className={styles.grid}>
          {myListings.length === 0 ? (
            <div className={styles.empty}>You have no listings yet. Create your first one!</div>
          ) : (
            myListings.map((l) => (
              <div key={l.id} className={styles.product}>
                <div className={styles.productImg}>
                  <span>{CAT_ICON[l.category] || '📦'}</span>
                  {l.boosted && <span className={styles.productTag}>⭐ Boosted</span>}
                </div>
                <div className={styles.productBody}>
                  <div className={styles.productCat}>{l.category} · {l.status}</div>
                  <div className={styles.productName}>{l.title}</div>
                  <div className={styles.productSupplier}>{l.views_count} views · {l.inquiries_count} inquiries</div>
                  <div className={styles.productMeta}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(l.created_at).toLocaleDateString()}</div>
                    <button className={styles.inquireBtn} style={{ background: '#fef2f2', color: '#dc2626' }} onClick={() => handleDelete(l.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [category, setCategory] = useState('supply')
  const [role, setRole] = useState<'offering' | 'seeking'>('offering')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceAmount, setPriceAmount] = useState('')
  const [priceUnit, setPriceUnit] = useState('')
  const [moq, setMoq] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const intentLabels = INTENT_LABELS[category] || INTENT_LABELS.supply

  async function handleSubmit() {
    if (!title.trim()) { alert('Title is required'); return }
    setSubmitting(true)
    const res = await createListing({
      category,
      role,
      title,
      description,
      price_amount: priceAmount ? parseFloat(priceAmount) : undefined,
      price_unit: priceUnit || undefined,
      moq: moq || undefined,
    })
    setSubmitting(false)
    if (res.error) { alert(res.error); return }
    onCreated()
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>What is your intent?</label>
        <div className={styles.intentToggle}>
          <button className={`${styles.intentBtn} ${role === 'offering' ? styles.on : ''}`} onClick={() => setRole('offering')}>
            {intentLabels.offering}
          </button>
          <button className={`${styles.intentBtn} ${role === 'seeking' ? styles.on : ''}`} onClick={() => setRole('seeking')}>
            {intentLabels.seeking}
          </button>
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Category</label>
          <select className={styles.fieldSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="supply">Supply</option>
            <option value="demand">Demand</option>
            <option value="cmo">CMO (Contract Manufacturing)</option>
            <option value="equipment">Equipment</option>
            <option value="license">License</option>
            <option value="service">Service</option>
            <option value="training">Training</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Title *</label>
          <input className={styles.fieldInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Metformin HCl BP/USP" />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Description</label>
        <textarea className={styles.fieldTextarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about your listing…" />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Price (optional)</label>
          <input className={styles.fieldInput} type="number" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} placeholder="5.80" />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Unit</label>
          <input className={styles.fieldInput} value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} placeholder="kg" />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Minimum order (MOQ)</label>
        <input className={styles.fieldInput} value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="500 kg" />
      </div>

      <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Publishing…' : 'Publish Listing'}
      </button>
    </div>
  )
}
