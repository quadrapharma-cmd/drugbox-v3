'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createListing, inquireAboutListing } from '@/actions/listings'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'

const CAT_EMOJI: Record<string, string> = {
  supply: '⚗️', demand: '🔍', cmo: '🏭', equipment: '🔧', license: '📜', service: '🛠️', job: '💼', training: '🎓',
}

export default function MarketplaceApproved({ userName, listings, currentUserId }: { userName: string; listings: any[]; currentUserId: string }) {
  const router = useRouter()
  const { t } = useLang()
  const [tab, setTab] = useState<'browse' | 'create' | 'intents' | 'manage'>('browse')
  const inits = userName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  async function handleInquire(id: string) {
    try {
      const res = await inquireAboutListing(id)
      if (res.error) throw new Error(res.error)
      router.push(`/messages?with=${res.sellerId}`)
    } catch (e: any) {
      alert(e.message || 'Could not send your inquiry. Please try again.')
    }
  }

  const supplyListings = listings.filter((l) => l.category === 'supply')

  return (
    <>
      <div className="topbar">
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className="sw" style={{ marginLeft: 20 }}><span className="si-ic">🔍</span><input className="si" placeholder={t('mk.searchPlaceholder')} /></div>
        <div className="tnav-wrap">
          <Link href="/feed" className="tnav" style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className="tnav active" style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className="tnav" style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className="tnav" style={{ textDecoration: 'none' }}>💬</Link>
          <div className="tnav" style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className="av" style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>{inits}</Link>
      </div>

      <div className="master-tabs">
        <div className={`master-tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>🛒 {t('mk.browse')}</div>
        <div className={`master-tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>➕ {t('mk.create')}</div>
        <div className={`master-tab ${tab === 'manage' ? 'active' : ''}`} onClick={() => setTab('manage')}>📦 {t('mk.myListings')}</div>
        <div className={`master-tab ${tab === 'intents' ? 'active' : ''}`} onClick={() => setTab('intents')}>🎯 {t('mk.myIntents')}</div>
      </div>

      {tab === 'browse' && <BrowseTab listings={supplyListings} onInquire={handleInquire} currentUserId={currentUserId} />}
      {tab === 'create' && <CreateTab onCreated={() => { setTab('browse'); router.refresh() }} />}
      {tab === 'manage' && <ManageTab listings={listings.filter((l) => l.user_id === currentUserId)} />}
      {tab === 'intents' && <IntentsTab />}
    </>
  )
}

function BrowseTab({ listings, onInquire, currentUserId }: { listings: any[]; onInquire: (id: string) => void; currentUserId: string }) {
  const { t } = useLang()
  return (
    <div className="main-tab active">
      <div>
        <div className="pricing-banner">
          <div className="pb-text">
            <div className="title">⭐ Boost your listing — reach 150,000+ pharmacists &amp; scientists across the Gulf &amp; Africa</div>
            <div className="sub">Sponsored listings get 8× more views and 5× more inquiries than free listings</div>
          </div>
          <div className="pb-plans">
            <div className="plan"><div className="plan-name">🆓 Free</div></div>
            <div className="plan" style={{ cursor: 'pointer' }}><div className="plan-name">⚡ Boost</div></div>
            <div className="plan gold" style={{ cursor: 'pointer' }}><div className="plan-name">⭐ Featured</div></div>
          </div>
        </div>

        <div className="hero">
          <div className="hero-left">
            <div className="hero-title">⬡ Drugbox Marketplace</div>
            <div className="hero-main">The B2B Pharma Trading Hub</div>
            <div className="hero-sub">Source · Supply · License · Manufacture · Services · Hire · Train</div>
            <div className="hero-stats">
              <div className="hstat"><div className="hstat-n">1.2K</div><div className="hstat-l">Listings</div></div>
              <div className="hstat"><div className="hstat-n">340</div><div className="hstat-l">Suppliers</div></div>
              <div className="hstat"><div className="hstat-n">76</div><div className="hstat-l">Jobs</div></div>
              <div className="hstat"><div className="hstat-n">54</div><div className="hstat-l">Services</div></div>
            </div>
          </div>
          <div className="activity">
            <div className="act-title"><div className="act-dot"></div> Live Now</div>
            <div className="act-item"><span>📨</span><b>Allison Wang</b> listed Neomycin Sulphate</div>
            <div className="act-item"><span>💼</span><b>New job:</b> QA Manager · Cairo</div>
            <div className="act-item"><span>🛠</span><b>New service:</b> EDA Registration by Dr. Asmaa</div>
            <div className="act-item"><span>✅</span><b>Deal closed:</b> Amoxicillin 500kg</div>
            <div className="act-item"><span>🔍</span><b>Demand:</b> Retinol 97% from UAE</div>
          </div>
        </div>

        <div className="cat-grid">
          <div className="cat-item on"><div className="cat-ic">🟢</div><div className="cat-label">Supply</div><div className="cat-count">312</div></div>
          <div className="cat-item"><div className="cat-ic">🟠</div><div className="cat-label">Demand</div><div className="cat-count">187</div></div>
          <div className="cat-item"><div className="cat-ic">📋</div><div className="cat-label">Licenses</div><div className="cat-count">54</div></div>
          <div className="cat-item"><div className="cat-ic">🏭</div><div className="cat-label">CMO/Toll</div><div className="cat-count">43</div></div>
          <div className="cat-item"><div className="cat-ic">⚙️</div><div className="cat-label">Equipment</div><div className="cat-count">98</div></div>
          <div className="cat-item"><div className="cat-ic">🛠️</div><div className="cat-label">Services</div><div className="cat-count">54</div></div>
          <div className="cat-item"><div className="cat-ic">💼</div><div className="cat-label">Jobs</div><div className="cat-count">76</div></div>
        </div>

        <div className="layout">
          <div className="filters">
            <div className="f-sec">
              <div className="f-hdr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Category</span>
                <span style={{ display: 'flex', gap: 6, fontWeight: 600, fontSize: 10 }}><span style={{ color: '#1a56db', cursor: 'pointer' }}>All</span><span style={{ color: '#cbd5e1' }}>·</span><span style={{ color: '#94a3b8', cursor: 'pointer' }}>None</span></span>
              </div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 🟢 Supply <span className="f-count">312</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 🟠 Demand <span className="f-count">187</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 🏭 CMO <span className="f-count">43</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> ⚙️ Equipment <span className="f-count">98</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 📋 License <span className="f-count">54</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 🛠️ Service <span className="f-count">54</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 💼 Job <span className="f-count">76</span></div>
              <div className="f-opt"><input type="checkbox" defaultChecked /> 🎓 Training <span className="f-count">29</span></div>
            </div>
            <div className="fdiv"></div>
            <div className="f-sec">
              <div className="f-hdr">Sort by</div>
              <div className="sort-opt on">⭐ Most Relevant</div>
              <div className="sort-opt">🔥 Most Viewed</div>
              <div className="sort-opt">🆕 Newest</div>
              <div className="sort-opt">💰 Price ↑</div>
            </div>
            <div className="fdiv"></div>
            <div className="f-sec">
              <div className="f-hdr">Sector</div>
              <div className="f-tag on">All</div>
              <div className="f-tag">💊 Pharma</div>
              <div className="f-tag">💄 Cosmetics</div>
              <div className="f-tag">🥗 Supplements</div>
              <div className="f-tag">🏥 Medical Devices</div>
            </div>
            <div className="fdiv"></div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Showing</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{listings.length}</div>
              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>listings match your filters</div>
            </div>
          </div>

          <div className="main">
            <div>
              <div className="sec-hdr">
                <div className="sec-title">⭐ {t('mk.sponsoredListings')}</div>
                <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Featured placements — top visibility</div>
              </div>
              <div className="sponsored-card">
                <div className="sp-ribbon">
                  <div className="sp-label">⭐ SPONSORED · FEATURED</div>
                  <div className="sp-analytics"><div className="sp-stat">👁 247 views</div><div className="sp-stat">📨 18 inquiries</div><div className="sp-stat">⚡ 8× avg reach</div></div>
                </div>
                <div className="sp-body">
                  <div className="sp-header">
                    <div className="sp-img">⚗️</div>
                    <div className="sp-meta">
                      <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span className="role-badge have">📦 For Sale</span><span className="lt lt-s">SUPPLY</span><span className="cert c-gmp">WHO-GMP</span><span className="cert c-cep">CEP</span><span className="cert c-fda">USFDA DMF</span>
                      </div>
                      <div className="sp-title">Metformin HCl BP/USP — Premium GMP Grade</div>
                      <div className="sp-desc">New production batch. Compacted &amp; regular form available. HPLC CoA, DMF filing, CEP documentation included.</div>
                    </div>
                  </div>
                  <div className="sp-trust"><span className="ti g">✓ WHO-GMP certified</span><span className="ti b">✓ USFDA DMF filed</span><span className="ti g">✓ CEP available</span></div>
                  <div className="sp-seller">
                    <div className="av" style={{ background: '#0E8C66', width: 40, height: 40, fontSize: 13 }}>AW</div>
                    <div><div className="seller-name">Allison Wang <span style={{ color: '#1a56db', fontSize: 11 }}>✓ Verified</span></div><div className="seller-sub">🇨🇳 Shandong Hope Biotech · Export Sales Director</div></div>
                  </div>
                  <div className="sp-footer">
                    <div><div className="sp-price">$5.80<span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/kg</span></div><div className="sp-moq">MOQ: 500 kg · FOB Shanghai</div></div>
                    <div className="sp-cta"><div className="btn-save">🔖</div><button className="btn-contact-gold">✉️ {t('mk.contactSupplier')} →</button></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="sec-hdr">
                <div className="sec-title">🆓 {t('mk.freeListings')} <span className="sec-count">{listings.length} listings</span></div>
                <div className="sec-all">View all →</div>
              </div>
              <div className="supply-grid">
                {listings.length === 0 ? (
                  <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>No supply listings yet — be the first to create one.</div>
                ) : (
                  listings.map((l: any) => (
                    <div className="lcard" key={l.id}>
                      <div className="lc-inner">
                        <div className="lc-top">
                          <div className="lc-em em-supply">{CAT_EMOJI[l.category] || '📦'}</div>
                          <div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span className="role-badge have">{l.role === 'offering' ? '📦 For Sale' : '🔍 Seeking'}</span>
                              <span className="lt lt-s">{l.category.toUpperCase()}</span>
                              {l.certifications && <span className="cert-p">{l.certifications}</span>}
                            </div>
                            <div className="lc-title">{l.title}</div>
                            <div className="lc-desc">{l.description || ''}</div>
                          </div>
                        </div>
                        <div className="trust-bar"><span className="ti o">👁 {l.views_count || 0} views</span></div>
                        <div className="lc-foot">
                          <div><div className="price">{l.price_amount ? `$${l.price_amount}${l.price_unit ? '/' + l.price_unit : ''}` : 'Inquire'}</div><div className="moq">{l.moq ? `MOQ: ${l.moq}` : ''} {l.seller?.country ? `· ${l.seller.country}` : ''}</div></div>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <div className="btn-save">🔖</div>
                            {l.user_id !== currentUserId && <button className="btn-contact" onClick={() => onInquire(l.id)}>{t('mk.contact')} →</button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="compare-section">
              <div className="cs-header"><div className="cs-title">📊 {t('mk.compareTitle')}</div></div>
              <div className="compare-grid">
                <div className="cg-header" style={{ background: '#f8fafc', color: '#475569' }}>Feature</div>
                <div className="cg-header" style={{ background: '#f0f4fb', color: '#64748b' }}>🆓 Free</div>
                <div className="cg-header cg-paid-header">⭐ Sponsored</div>
                <div className="cg-feature">📍 Listing placement</div><div className="cg-free">Bottom of list</div><div className="cg-paid" style={{ color: '#d97706', fontWeight: 700 }}>Top of page always</div>
                <div className="cg-feature">📸 Media &amp; description</div><div className="cg-free">Basic text only</div><div className="cg-paid"><span className="check">✓</span> Image + full desc</div>
                <div className="cg-feature">✓ Trust badges</div><div className="cg-free"><span className="cross">—</span></div><div className="cg-paid"><span className="check">✓</span> All certs shown</div>
                <div className="cg-feature">⭐ Seller rating</div><div className="cg-free"><span className="cross">—</span></div><div className="cg-paid"><span className="check">✓</span> Stars + deal count</div>
                <div className="cg-feature">📊 Analytics dashboard</div><div className="cg-free"><span className="cross">—</span></div><div className="cg-paid"><span className="check">✓</span> Views, inquiries, CTR</div>
                <div className="cg-feature">🔔 Demand alerts</div><div className="cg-free"><span className="cross">—</span></div><div className="cg-paid"><span className="check">✓</span> Instant notifications</div>
                <div className="cg-feature">👁 Avg monthly views</div><div className="cg-free" style={{ color: '#94a3b8' }}>~30 views</div><div className="cg-paid" style={{ color: '#d97706', fontWeight: 700 }}>~240 views (8×)</div>
                <div className="cg-feature">📨 Avg inquiries/month</div><div className="cg-free" style={{ color: '#94a3b8' }}>~2 inquiries</div><div className="cg-paid" style={{ color: '#d97706', fontWeight: 700 }}>~10 inquiries (5×)</div>
              </div>
            </div>

            <div className="services-section">
              <div className="ss-header">
                <div><div className="ss-title">🛠️ {t('mk.professionalServices')} <span style={{ fontSize: 11, background: 'rgba(255,255,255,.2)', padding: '2px 8px', borderRadius: 10 }}>54 providers</span></div><div className="ss-sub">Regulatory · Registration · QA Consulting · Dossier Preparation · Lab Testing</div></div>
                <button className="ss-btn">+ Offer Service</button>
              </div>
              <div className="services-grid">
                {[
                  { ic: '📋', title: 'EDA Registration — Pharma & Cosmetics', provider: 'Dr. Asmaa Meabed · 🇪🇬 Cairo', tags: ['EDA', 'Dossier', 'Stability'], price: 'Per product', rating: '★ 4.9 · 67 clients' },
                  { ic: '🌍', title: 'GCC Registration — All 6 States', provider: 'M. Musthafa · 🇦🇪 Dubai', tags: ['SFDA', 'DHA', 'MOHAP'], price: 'Per country', rating: '★ 4.8 · 43 clients' },
                  { ic: '🔬', title: 'QA/QC Consulting & GMP Gap Analysis', provider: 'PharmaCons Egypt · 🇪🇬 Cairo', tags: ['GMP', 'CAPA', 'Audit'], price: '$200/day', rating: '★ 5.0 · 28 clients' },
                  { ic: '🧪', title: 'Stability Studies & Accelerated Testing', provider: 'StabilLab Cairo · 🇪🇬 6th Oct', tags: ['ICH Q1A', 'Zone IVb'], price: 'Per product', rating: '★ 4.7 · 52 clients' },
                  { ic: '📝', title: 'CTD Dossier Preparation (ICH M4)', provider: 'RegAffairs Pro · 🇪🇬 Cairo', tags: ['CTD', 'eCTD', 'ICH'], price: 'Per dossier', rating: '★ 4.9 · 38 clients' },
                  { ic: '🏭', title: 'Formulation Development — Cosmetics', provider: 'BeautyLab Egypt · 🇪🇬 Cairo', tags: ['R&D', 'Scale-up', 'EDA'], price: 'Per formula', rating: '★ 4.6 · 19 clients' },
                ].map((s) => (
                  <div className="scard" key={s.title}>
                    <div className="sc-ic">{s.ic}</div>
                    <div className="sc-title">{s.title}</div>
                    <div className="sc-provider">{s.provider} · <span style={{ color: '#1a56db' }}>✓ Verified</span></div>
                    <div className="sc-tags">{s.tags.map((tag) => <span className="sc-tag" key={tag}>{tag}</span>)}</div>
                    <div className="sc-footer">
                      <div><div className="sc-price">{s.price}</div><div className="sc-rating">{s.rating}</div></div>
                      <button className="sc-btn">Inquire</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="jobs-section">
              <div className="js-header">
                <div><div className="js-title">💼 Jobs &amp; Careers <span style={{ fontSize: 11, background: 'rgba(255,255,255,.2)', padding: '2px 8px', borderRadius: 10 }}>76 open positions</span></div><div className="js-sub">Pharma · Cosmetics · Medical Devices · Regulatory · Production · Sales</div></div>
                <Link href="/jobs" className="js-btn" style={{ textDecoration: 'none' }}>+ Post a Job</Link>
              </div>
              <div className="jobs-list">
                {[
                  { logo: 'QP', bg: '#1a56db', title: 'Senior Regulatory Affairs Specialist', company: 'Quadra Pharm', country: '🇪🇬 Giza, Egypt', tags: [['Full-time', 'jt-ft'], ['EDA Experience', ''], ['3–5 yrs exp', '']], desc: 'Lead EDA dossier submissions, manage stability study programs, and coordinate with production for regulatory compliance.', posted: '2h ago', hiring: true },
                  { logo: 'AP', bg: '#B0883F', title: 'QC Analyst (HPLC) — API Division', company: 'Aurobindo Pharma', country: '🇮🇳 Hyderabad, India', tags: [['Full-time', 'jt-ft'], ['HPLC Expert', ''], ['2+ yrs', '']], desc: 'HPLC method validation and batch release testing for API production.', posted: '5h ago', hiring: true },
                  { logo: 'BL', bg: '#7A5680', title: 'Cosmetic Formulation Scientist', company: 'Beauty Lab Egypt', country: '🇪🇬 Cairo, Egypt', tags: [['Full-time', 'jt-ft'], ['Skincare R&D', ''], ['Remote possible', 'jt-re']], desc: 'Develop and scale-up skincare formulations. EDA cosmetics knowledge a strong plus.', posted: '1d ago', hiring: true },
                ].map((j) => (
                  <div className="jcard" key={j.title}>
                    <div className="jc-logo" style={{ background: j.bg }}>{j.logo}</div>
                    <div className="jc-body">
                      <div className="jc-title"><span className="role-badge have" style={{ marginRight: 6 }}>{j.hiring ? '🏢 Hiring' : '👤 Looking for a Job'}</span>{j.title}</div>
                      <div className="jc-company"><span>{j.company}</span> · <span>{j.country}</span> · <span style={{ color: '#1a56db' }}>✓ Verified</span></div>
                      <div className="jc-tags">{j.tags.map(([label, cls]) => <span className={`jt ${cls}`} key={label}>{label}</span>)}</div>
                      <div className="jc-desc">{j.desc}</div>
                    </div>
                    <div className="jc-right">
                      <div className="jc-posted">{j.posted}</div>
                      <Link href="/jobs" className="apply-btn" style={{ textDecoration: 'none' }}>Apply Now →</Link>
                      <button className="save-btn">🔖 Save</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="demand-board">
            <div className="upgrade-cta">
              <div className="uc-title">⭐ {t('mk.boostListing')}</div>
              <div className="uc-sub">Reach 150,000+ pharmacists &amp; scientists across the Gulf &amp; Africa. Get 8× more views.</div>
              <div className="feature-list">
                <div className="fl-item">✓ Top placement always</div>
                <div className="fl-item">✓ Full media &amp; description</div>
                <div className="fl-item">✓ Analytics dashboard</div>
                <div className="fl-item">✓ Demand alerts</div>
                <div className="fl-item">✓ Verified seller badge</div>
              </div>
              <button className="uc-btn">⭐ Upgrade Now</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1c1e21', marginBottom: 8 }}>⭐ Featured Suppliers</div>
              <div className="sp-mini">
                <div className="sm-label">⭐ Sponsored</div>
                <div className="sm-title">Metformin HCl GMP Grade</div>
                <div className="sm-price">$5.80/kg · MOQ 500kg</div>
                <div className="sm-seller">🇨🇳 Shandong Hope · ✓ CEP+DMF</div>
              </div>
              <div className="sp-mini">
                <div className="sm-label">⭐ Sponsored</div>
                <div className="sm-title">EDA Registration Services</div>
                <div className="sm-price">Per product · Free consult</div>
                <div className="sm-seller">🇪🇬 Dr. Asmaa Meabed · ★ 4.9</div>
              </div>
            </div>

            <div className="db-title">🟠 {t('mk.demandBoard')} <span style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>187</span></div>
            <div className="db-sub">Submit quotes to open requests</div>

            {[
              { title: 'Ciprofloxacin HCl 2MT/month', badge: 'URGENT', badgeClass: 'urgent', det: '📦 Annual contract · USFDA/EU-GMP<br/>🇪🇬 Egypt · 2h ago', buyer: 'Dr. Haytham ✓', buyerBg: '#1a56db', buyerInit: 'HD' },
              { title: 'MCC PH-102 — 3MT/month', badge: 'HOT', badgeClass: 'hot', det: '📦 WHO-GMP · Annual<br/>🇪🇬 Egypt · 5h ago', buyer: 'Omar K. ✓', buyerBg: '#246C8E', buyerInit: 'OK' },
              { title: 'Retinol 97%+ · 500g/month', badge: 'OPEN', badgeClass: 'open', det: '📦 ISO 22716 · Cosmetic<br/>🇦🇪 UAE · 1h ago', buyer: 'Nour Beauty', buyerBg: '#7A5680', buyerInit: 'NB' },
            ].map((d) => (
              <div className="dcard" key={d.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className="dc-title"><span className="role-badge need" style={{ marginRight: 5, fontSize: 8.5, padding: '2px 6px' }}>🔍 Looking to Buy</span>{d.title}</div>
                  <span className={`db-badge ${d.badgeClass}`}>{d.badge}</span>
                </div>
                <div className="dc-det" dangerouslySetInnerHTML={{ __html: d.det }} />
                <div className="dc-foot"><div className="dc-buyer"><div className="av" style={{ background: d.buyerBg, width: 17, height: 17, fontSize: 7 }}>{d.buyerInit}</div> {d.buyer}</div><button className="qt-btn">Quote →</button></div>
              </div>
            ))}

            <div className="fdiv"></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1e21', marginBottom: 8 }}>💼 {t('mk.latestJobs')}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
              <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f4fb' }}>→ Sr. RA Specialist · Quadra Pharm 🇪🇬</div>
              <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f4fb' }}>→ QC Analyst HPLC · Aurobindo 🇮🇳</div>
              <div style={{ padding: '4px 0', borderBottom: '1px solid #f0f4fb' }}>→ GCC Coordinator · Epione 🇦🇪</div>
              <div style={{ padding: '4px 0' }}>→ Formulation Scientist · BeautyLab 🇪🇬</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateTab({ onCreated }: { onCreated: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<'offering' | 'seeking'>('offering')
  const [type, setType] = useState('supply')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('per kg')
  const [moq, setMoq] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function chooseIntent(v: 'offering' | 'seeking') { setRole(v); setStep(2) }

  async function submit() {
    if (!title.trim()) { alert('Title is required'); return }
    setSubmitting(true)
    try {
      const res = await createListing({ category: type, role, title, price_amount: parseFloat(price) || undefined, price_unit: unit, moq })
      if (res.error) throw new Error(res.error)
      onCreated()
    } catch (e: any) {
      alert(e.message || 'Could not publish your listing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="main-tab active">
      <div className="page-wrap">
        <div className="page-title">Create a Listing</div>
        <div className="page-sub">{step === 1 ? 'Step 1 of 2 — Are you seeking or offering?' : 'Step 2 of 2 — Listing details'}</div>

        {step === 1 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #eef0f4', padding: 24, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Are you seeking something, or offering something?</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => chooseIntent('offering')} style={{ flex: 1, maxWidth: 220, padding: 20, borderRadius: 14, border: '2px solid #86efac', background: '#f0fdf4', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>I&apos;m Offering</div>
                <div style={{ fontSize: 11, color: '#15803d', opacity: 0.8, marginTop: 4 }}>I have something to give</div>
              </button>
              <button onClick={() => chooseIntent('seeking')} style={{ flex: 1, maxWidth: 220, padding: 20, borderRadius: 14, border: '2px solid #fed7aa', background: '#fff7ed', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#c2410c' }}>I&apos;m Seeking</div>
                <div style={{ fontSize: 11, color: '#c2410c', opacity: 0.8, marginTop: 4 }}>I need something</div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="draft-banner"><span>💾</span><span className="draft-text">Draft auto-saved — you can leave and continue anytime from &quot;My Listings&quot;</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 8, background: role === 'offering' ? '#dcfce7' : '#fff7ed', color: role === 'offering' ? '#15803d' : '#c2410c' }}>{role === 'offering' ? '📦 Offering' : '🔍 Seeking'}</span>
              <span onClick={() => setStep(1)} style={{ fontSize: 11.5, color: '#1a56db', fontWeight: 700, cursor: 'pointer' }}>← Change</span>
            </div>
            <div className="type-selector">
              {['supply', 'demand', 'cmo', 'equipment', 'license', 'service', 'job', 'training'].map((tp) => (
                <div key={tp} className={`type-pill ${type === tp ? 'active' : ''}`} onClick={() => setType(tp)}>
                  {CAT_EMOJI[tp]} {tp.charAt(0).toUpperCase() + tp.slice(1)}
                </div>
              ))}
            </div>

            <div className="wizard form-section active">
              <div className="wizard-head">
                <div className="wh-icon" style={{ background: '#dcfce7' }}>{CAT_EMOJI[type]}</div>
                <div><div className="wizard-title">New {type.charAt(0).toUpperCase() + type.slice(1)} Listing</div><div className="wizard-sub">For raw materials, APIs, excipients &amp; finished products</div></div>
              </div>
              <div className="wizard-body">
                <div className="field"><label className="field-label">Title <span className="req">*</span></label><input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Metformin HCl BP/USP" /></div>
                <div className="row3">
                  <div className="field"><label className="field-label">Price per unit</label><input className="field-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$5.80" /></div>
                  <div className="field"><label className="field-label">Unit</label><select className="field-select" value={unit} onChange={(e) => setUnit(e.target.value)}><option>per kg</option><option>per ton</option><option>per unit</option></select></div>
                  <div className="field"><label className="field-label">MOQ</label><input className="field-input" value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="500 kg" /></div>
                </div>
              </div>
              <div className="wizard-footer"><button className="btn-draft">Save as Draft</button><button className="btn-create" onClick={submit} disabled={submitting}>{submitting ? 'Publishing…' : 'Publish Listing →'}</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ManageTab({ listings }: { listings: any[] }) {
  return (
    <div className="main-tab active">
      <div className="page-wrap">
        <div className="page-title">My Listings</div>
        <div className="page-sub">Manage your active and draft listings</div>
        <div className="card">
          {listings.length === 0 ? (
            <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>You have no listings yet.</div>
          ) : (
            listings.map((l: any) => (
              <div className="lcard" key={l.id} style={{ marginBottom: 12 }}>
                <div className="lc-inner">
                  <div className="lc-top">
                    <div className="lc-em em-supply">{CAT_EMOJI[l.category] || '📦'}</div>
                    <div><div className="lc-title">{l.title}</div><div className="lc-desc">{l.status} · {l.views_count || 0} views · {l.inquiries_count || 0} inquiries</div></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function IntentsTab() {
  return (
    <div className="main-tab active">
      <div className="page-wrap">
        <div className="page-title">My Marketplace Intents</div>
        <div className="page-sub">Tell Drugbox what you have and what you need, per category — this powers your matches, your feed, and what shows on your profile.</div>
        <div className="logic-key">
          <b>How to read every toggle below</b>
          One side always means <b style={{ color: '#15803d' }}>&quot;I already HAVE this / I provide this&quot;</b> — shown in green.
          The other side always means <b style={{ color: '#c2410c' }}>&quot;I NEED this / I&apos;m looking for this&quot;</b> — shown in orange.
        </div>
        <div className="card">
          <div className="cat-group-title">🧪 Materials &amp; Products<div className="cgt-line"></div></div>
          <div className="category-intent-grid">
            <div className="cat-intent-row">
              <div className="cir-icon">⚗️</div>
              <div className="cir-text"><div className="cir-name">APIs &amp; Raw Materials</div><div className="cir-sub">e.g. Metformin HCl, Neomycin Sulphate</div></div>
              <div className="intent-toggle">
                <div className="it-opt i-have active">📦 I have this to sell</div>
                <div className="it-opt i-need">🔍 I need to buy this</div>
                <div className="it-opt both">↔️ Both</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
