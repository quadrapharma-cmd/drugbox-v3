'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createListing, inquireAboutListing } from '@/actions/listings'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n/LanguageProvider'
import LangSwitch from '@/components/LangSwitch'
import styles from '@/app/marketplace/market-approved.module.css'

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
      <div className={styles['topbar']}>
        <Link href="/feed" style={{ fontSize: 20, fontWeight: 900, color: '#1a56db', textDecoration: 'none' }}>DRUGBOX</Link>
        <div className={styles['sw']} style={{ marginLeft: 20 }}><span className={styles['si-ic']}>🔍</span><input className={styles['si']} placeholder={t('mk.searchPlaceholder')} /></div>
        <div className={styles['tnav-wrap']}>
          <Link href="/feed" className={styles['tnav']} style={{ textDecoration: 'none' }}>🏠</Link>
          <Link href="/marketplace" className={`${styles['tnav']} ${styles['active']}`} style={{ textDecoration: 'none' }}>🛒</Link>
          <Link href="/groups" className={styles['tnav']} style={{ textDecoration: 'none' }}>👥</Link>
          <Link href="/messages" className={styles['tnav']} style={{ textDecoration: 'none' }}>💬</Link>
          <div className={styles['tnav']} style={{ opacity: 0.5, cursor: 'not-allowed' }} title={t('common.notBuiltYet')}>🔔</div>
        </div>
        <LangSwitch />
        <Link href="/profile" className={styles['av']} style={{ background: '#1a56db', width: 36, height: 36, fontSize: 13, textDecoration: 'none' }}>{inits}</Link>
      </div>

      <div className={styles['master-tabs']}>
        <div className={`${styles['master-tab']} ${tab === 'browse' ? styles['active'] : ''}`} onClick={() => setTab('browse')}>🛒 {t('mk.browse')}</div>
        <div className={`${styles['master-tab']} ${tab === 'create' ? styles['active'] : ''}`} onClick={() => setTab('create')}>➕ {t('mk.create')}</div>
        <div className={`${styles['master-tab']} ${tab === 'manage' ? styles['active'] : ''}`} onClick={() => setTab('manage')}>📦 {t('mk.myListings')}</div>
        <div className={`${styles['master-tab']} ${tab === 'intents' ? styles['active'] : ''}`} onClick={() => setTab('intents')}>🎯 {t('mk.myIntents')}</div>
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
    <div className={`${styles['main-tab']} ${styles['active']}`}>
      <div>
        <div className={styles['pricing-banner']}>
          <div className={styles['pb-text']}>
            <div className={styles['title']}>⭐ Boost your listing — reach 150,000+ pharmacists &amp; scientists across the Gulf &amp; Africa</div>
            <div className={styles['sub']}>Sponsored listings get 8× more views and 5× more inquiries than free listings</div>
          </div>
          <div className={styles['pb-plans']}>
            <div className={styles['plan']}><div className={styles['plan-name']}>🆓 Free</div></div>
            <div className={styles['plan']} style={{ cursor: 'pointer' }}><div className={styles['plan-name']}>⚡ Boost</div></div>
            <div className={`${styles['plan']} ${styles['gold']}`} style={{ cursor: 'pointer' }}><div className={styles['plan-name']}>⭐ Featured</div></div>
          </div>
        </div>

        <div className={styles['hero']}>
          <div className={styles['hero-left']}>
            <div className={styles['hero-title']}>⬡ Drugbox Marketplace</div>
            <div className={styles['hero-main']}>The B2B Pharma Trading Hub</div>
            <div className={styles['hero-sub']}>Source · Supply · License · Manufacture · Services · Hire · Train</div>
            <div className={styles['hero-stats']}>
              <div className={styles['hstat']}><div className={styles['hstat-n']}>1.2K</div><div className={styles['hstat-l']}>Listings</div></div>
              <div className={styles['hstat']}><div className={styles['hstat-n']}>340</div><div className={styles['hstat-l']}>Suppliers</div></div>
              <div className={styles['hstat']}><div className={styles['hstat-n']}>76</div><div className={styles['hstat-l']}>Jobs</div></div>
              <div className={styles['hstat']}><div className={styles['hstat-n']}>54</div><div className={styles['hstat-l']}>Services</div></div>
            </div>
          </div>
          <div className={styles['activity']}>
            <div className={styles['act-title']}><div className={styles['act-dot']}></div> Live Now</div>
            <div className={styles['act-item']}><span>📨</span><b>Allison Wang</b> listed Neomycin Sulphate</div>
            <div className={styles['act-item']}><span>💼</span><b>New job:</b> QA Manager · Cairo</div>
            <div className={styles['act-item']}><span>🛠</span><b>New service:</b> EDA Registration by Dr. Asmaa</div>
            <div className={styles['act-item']}><span>✅</span><b>Deal closed:</b> Amoxicillin 500kg</div>
            <div className={styles['act-item']}><span>🔍</span><b>Demand:</b> Retinol 97% from UAE</div>
          </div>
        </div>

        <div className={styles['cat-grid']}>
          <div className={`${styles['cat-item']} ${styles['on']}`}><div className={styles['cat-ic']}>🟢</div><div className={styles['cat-label']}>Supply</div><div className={styles['cat-count']}>312</div></div>
          <div className={styles['cat-item']}><div className={styles['cat-ic']}>🟠</div><div className={styles['cat-label']}>Demand</div><div className={styles['cat-count']}>187</div></div>
          <div className={styles['cat-item']}><div className={styles['cat-ic']}>📋</div><div className={styles['cat-label']}>Licenses</div><div className={styles['cat-count']}>54</div></div>
          <div className={styles['cat-item']}><div className={styles['cat-ic']}>🏭</div><div className={styles['cat-label']}>CMO/Toll</div><div className={styles['cat-count']}>43</div></div>
          <div className={styles['cat-item']}><div className={styles['cat-ic']}>⚙️</div><div className={styles['cat-label']}>Equipment</div><div className={styles['cat-count']}>98</div></div>
          <div className={styles['cat-item']}><div className={styles['cat-ic']}>🛠️</div><div className={styles['cat-label']}>Services</div><div className={styles['cat-count']}>54</div></div>
          <div className={styles['cat-item']}><div className={styles['cat-ic']}>💼</div><div className={styles['cat-label']}>Jobs</div><div className={styles['cat-count']}>76</div></div>
        </div>

        <div className={styles['layout']}>
          <div className={styles['filters']}>
            <div className={styles['f-sec']}>
              <div className={styles['f-hdr']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Category</span>
                <span style={{ display: 'flex', gap: 6, fontWeight: 600, fontSize: 10 }}><span style={{ color: '#1a56db', cursor: 'pointer' }}>All</span><span style={{ color: '#cbd5e1' }}>·</span><span style={{ color: '#94a3b8', cursor: 'pointer' }}>None</span></span>
              </div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🟢 Supply <span className={styles['f-count']}>312</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🟠 Demand <span className={styles['f-count']}>187</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🏭 CMO <span className={styles['f-count']}>43</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> ⚙️ Equipment <span className={styles['f-count']}>98</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 📋 License <span className={styles['f-count']}>54</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🛠️ Service <span className={styles['f-count']}>54</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 💼 Job <span className={styles['f-count']}>76</span></div>
              <div className={styles['f-opt']}><input type="checkbox" defaultChecked /> 🎓 Training <span className={styles['f-count']}>29</span></div>
            </div>
            <div className={styles['fdiv']}></div>
            <div className={styles['f-sec']}>
              <div className={styles['f-hdr']}>Sort by</div>
              <div className={`${styles['sort-opt']} ${styles['on']}`}>⭐ Most Relevant</div>
              <div className={styles['sort-opt']}>🔥 Most Viewed</div>
              <div className={styles['sort-opt']}>🆕 Newest</div>
              <div className={styles['sort-opt']}>💰 Price ↑</div>
            </div>
            <div className={styles['fdiv']}></div>
            <div className={styles['f-sec']}>
              <div className={styles['f-hdr']}>Sector</div>
              <div className={`${styles['f-tag']} ${styles['on']}`}>All</div>
              <div className={styles['f-tag']}>💊 Pharma</div>
              <div className={styles['f-tag']}>💄 Cosmetics</div>
              <div className={styles['f-tag']}>🥗 Supplements</div>
              <div className={styles['f-tag']}>🏥 Medical Devices</div>
            </div>
            <div className={styles['fdiv']}></div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Showing</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{listings.length}</div>
              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>listings match your filters</div>
            </div>
          </div>

          <div className={styles['main']}>
            <div>
              <div className={styles['sec-hdr']}>
                <div className={styles['sec-title']}>⭐ {t('mk.sponsoredListings')}</div>
                <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>Featured placements — top visibility</div>
              </div>
              <div className={styles['sponsored-card']}>
                <div className={styles['sp-ribbon']}>
                  <div className={styles['sp-label']}>⭐ SPONSORED · FEATURED</div>
                  <div className={styles['sp-analytics']}><div className={styles['sp-stat']}>👁 247 views</div><div className={styles['sp-stat']}>📨 18 inquiries</div><div className={styles['sp-stat']}>⚡ 8× avg reach</div></div>
                </div>
                <div className={styles['sp-body']}>
                  <div className={styles['sp-header']}>
                    <div className={styles['sp-img']}>⚗️</div>
                    <div className={styles['sp-meta']}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span className={`${styles['role-badge']} ${styles['have']}`}>📦 For Sale</span><span className={`${styles['lt']} ${styles['lt-s']}`}>SUPPLY</span><span className={`${styles['cert']} ${styles['c-gmp']}`}>WHO-GMP</span><span className={`${styles['cert']} ${styles['c-cep']}`}>CEP</span><span className={`${styles['cert']} ${styles['c-fda']}`}>USFDA DMF</span>
                      </div>
                      <div className={styles['sp-title']}>Metformin HCl BP/USP — Premium GMP Grade</div>
                      <div className={styles['sp-desc']}>New production batch. Compacted &amp; regular form available. HPLC CoA, DMF filing, CEP documentation included.</div>
                    </div>
                  </div>
                  <div className={styles['sp-trust']}><span className={`${styles['ti']} ${styles['g']}`}>✓ WHO-GMP certified</span><span className={`${styles['ti']} ${styles['b']}`}>✓ USFDA DMF filed</span><span className={`${styles['ti']} ${styles['g']}`}>✓ CEP available</span></div>
                  <div className={styles['sp-seller']}>
                    <div className={styles['av']} style={{ background: '#0E8C66', width: 40, height: 40, fontSize: 13 }}>AW</div>
                    <div><div className={styles['seller-name']}>Allison Wang <span style={{ color: '#1a56db', fontSize: 11 }}>✓ Verified</span></div><div className={styles['seller-sub']}>🇨🇳 Shandong Hope Biotech · Export Sales Director</div></div>
                  </div>
                  <div className={styles['sp-footer']}>
                    <div><div className={styles['sp-price']}>$5.80<span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>/kg</span></div><div className={styles['sp-moq']}>MOQ: 500 kg · FOB Shanghai</div></div>
                    <div className={styles['sp-cta']}><div className={styles['btn-save']}>🔖</div><button className={styles['btn-contact-gold']}>✉️ {t('mk.contactSupplier')} →</button></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className={styles['sec-hdr']}>
                <div className={styles['sec-title']}>🆓 {t('mk.freeListings')} <span className={styles['sec-count']}>{listings.length} listings</span></div>
                <div className={styles['sec-all']}>View all →</div>
              </div>
              <div className={styles['supply-grid']}>
                {listings.length === 0 ? (
                  <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>No supply listings yet — be the first to create one.</div>
                ) : (
                  listings.map((l: any) => (
                    <div className={styles['lcard']} key={l.id}>
                      <div className={styles['lc-inner']}>
                        <div className={styles['lc-top']}>
                          <div className={`${styles['lc-em']} ${styles['em-supply']}`}>{CAT_EMOJI[l.category] || '📦'}</div>
                          <div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span className={`${styles['role-badge']} ${styles['have']}`}>{l.role === 'offering' ? '📦 For Sale' : '🔍 Seeking'}</span>
                              <span className={`${styles['lt']} ${styles['lt-s']}`}>{l.category.toUpperCase()}</span>
                              {l.certifications && <span className={styles['cert-p']}>{l.certifications}</span>}
                            </div>
                            <div className={styles['lc-title']}>{l.title}</div>
                            <div className={styles['lc-desc']}>{l.description || ''}</div>
                          </div>
                        </div>
                        <div className={styles['trust-bar']}><span className={`${styles['ti']} ${styles['o']}`}>👁 {l.views_count || 0} views</span></div>
                        <div className={styles['lc-foot']}>
                          <div><div className={styles['price']}>{l.price_amount ? `$${l.price_amount}${l.price_unit ? '/' + l.price_unit : ''}` : 'Inquire'}</div><div className={styles['moq']}>{l.moq ? `MOQ: ${l.moq}` : ''} {l.seller?.country ? `· ${l.seller.country}` : ''}</div></div>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <div className={styles['btn-save']}>🔖</div>
                            {l.user_id !== currentUserId && <button className={styles['btn-contact']} onClick={() => onInquire(l.id)}>{t('mk.contact')} →</button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={styles['compare-section']}>
              <div className={styles['cs-header']}><div className={styles['cs-title']}>📊 {t('mk.compareTitle')}</div></div>
              <div className={styles['compare-grid']}>
                <div className={styles['cg-header']} style={{ background: '#f8fafc', color: '#475569' }}>Feature</div>
                <div className={styles['cg-header']} style={{ background: '#f0f4fb', color: '#64748b' }}>🆓 Free</div>
                <div className={`${styles['cg-header']} ${styles['cg-paid-header']}`}>⭐ Sponsored</div>
                <div className={styles['cg-feature']}>📍 Listing placement</div><div className={styles['cg-free']}>Bottom of list</div><div className={styles['cg-paid']} style={{ color: '#d97706', fontWeight: 700 }}>Top of page always</div>
                <div className={styles['cg-feature']}>📸 Media &amp; description</div><div className={styles['cg-free']}>Basic text only</div><div className={styles['cg-paid']}><span className={styles['check']}>✓</span> Image + full desc</div>
                <div className={styles['cg-feature']}>✓ Trust badges</div><div className={styles['cg-free']}><span className={styles['cross']}>—</span></div><div className={styles['cg-paid']}><span className={styles['check']}>✓</span> All certs shown</div>
                <div className={styles['cg-feature']}>⭐ Seller rating</div><div className={styles['cg-free']}><span className={styles['cross']}>—</span></div><div className={styles['cg-paid']}><span className={styles['check']}>✓</span> Stars + deal count</div>
                <div className={styles['cg-feature']}>📊 Analytics dashboard</div><div className={styles['cg-free']}><span className={styles['cross']}>—</span></div><div className={styles['cg-paid']}><span className={styles['check']}>✓</span> Views, inquiries, CTR</div>
                <div className={styles['cg-feature']}>🔔 Demand alerts</div><div className={styles['cg-free']}><span className={styles['cross']}>—</span></div><div className={styles['cg-paid']}><span className={styles['check']}>✓</span> Instant notifications</div>
                <div className={styles['cg-feature']}>👁 Avg monthly views</div><div className={styles['cg-free']} style={{ color: '#94a3b8' }}>~30 views</div><div className={styles['cg-paid']} style={{ color: '#d97706', fontWeight: 700 }}>~240 views (8×)</div>
                <div className={styles['cg-feature']}>📨 Avg inquiries/month</div><div className={styles['cg-free']} style={{ color: '#94a3b8' }}>~2 inquiries</div><div className={styles['cg-paid']} style={{ color: '#d97706', fontWeight: 700 }}>~10 inquiries (5×)</div>
              </div>
            </div>

            <div className={styles['services-section']}>
              <div className={styles['ss-header']}>
                <div><div className={styles['ss-title']}>🛠️ {t('mk.professionalServices')} <span style={{ fontSize: 11, background: 'rgba(255,255,255,.2)', padding: '2px 8px', borderRadius: 10 }}>54 providers</span></div><div className={styles['ss-sub']}>Regulatory · Registration · QA Consulting · Dossier Preparation · Lab Testing</div></div>
                <button className={styles['ss-btn']}>+ Offer Service</button>
              </div>
              <div className={styles['services-grid']}>
                {[
                  { ic: '📋', title: 'EDA Registration — Pharma & Cosmetics', provider: 'Dr. Asmaa Meabed · 🇪🇬 Cairo', tags: ['EDA', 'Dossier', 'Stability'], price: 'Per product', rating: '★ 4.9 · 67 clients' },
                  { ic: '🌍', title: 'GCC Registration — All 6 States', provider: 'M. Musthafa · 🇦🇪 Dubai', tags: ['SFDA', 'DHA', 'MOHAP'], price: 'Per country', rating: '★ 4.8 · 43 clients' },
                  { ic: '🔬', title: 'QA/QC Consulting & GMP Gap Analysis', provider: 'PharmaCons Egypt · 🇪🇬 Cairo', tags: ['GMP', 'CAPA', 'Audit'], price: '$200/day', rating: '★ 5.0 · 28 clients' },
                  { ic: '🧪', title: 'Stability Studies & Accelerated Testing', provider: 'StabilLab Cairo · 🇪🇬 6th Oct', tags: ['ICH Q1A', 'Zone IVb'], price: 'Per product', rating: '★ 4.7 · 52 clients' },
                  { ic: '📝', title: 'CTD Dossier Preparation (ICH M4)', provider: 'RegAffairs Pro · 🇪🇬 Cairo', tags: ['CTD', 'eCTD', 'ICH'], price: 'Per dossier', rating: '★ 4.9 · 38 clients' },
                  { ic: '🏭', title: 'Formulation Development — Cosmetics', provider: 'BeautyLab Egypt · 🇪🇬 Cairo', tags: ['R&D', 'Scale-up', 'EDA'], price: 'Per formula', rating: '★ 4.6 · 19 clients' },
                ].map((s) => (
                  <div className={styles['scard']} key={s.title}>
                    <div className={styles['sc-ic']}>{s.ic}</div>
                    <div className={styles['sc-title']}>{s.title}</div>
                    <div className={styles['sc-provider']}>{s.provider} · <span style={{ color: '#1a56db' }}>✓ Verified</span></div>
                    <div className={styles['sc-tags']}>{s.tags.map((tag) => <span className={styles['sc-tag']} key={tag}>{tag}</span>)}</div>
                    <div className={styles['sc-footer']}>
                      <div><div className={styles['sc-price']}>{s.price}</div><div className={styles['sc-rating']}>{s.rating}</div></div>
                      <button className={styles['sc-btn']}>Inquire</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles['jobs-section']}>
              <div className={styles['js-header']}>
                <div><div className={styles['js-title']}>💼 Jobs &amp; Careers <span style={{ fontSize: 11, background: 'rgba(255,255,255,.2)', padding: '2px 8px', borderRadius: 10 }}>76 open positions</span></div><div className={styles['js-sub']}>Pharma · Cosmetics · Medical Devices · Regulatory · Production · Sales</div></div>
                <Link href="/jobs" className={styles['js-btn']} style={{ textDecoration: 'none' }}>+ Post a Job</Link>
              </div>
              <div className={styles['jobs-list']}>
                {[
                  { logo: 'QP', bg: '#1a56db', title: 'Senior Regulatory Affairs Specialist', company: 'Quadra Pharm', country: '🇪🇬 Giza, Egypt', tags: [['Full-time', 'jt-ft'], ['EDA Experience', ''], ['3–5 yrs exp', '']], desc: 'Lead EDA dossier submissions, manage stability study programs, and coordinate with production for regulatory compliance.', posted: '2h ago', hiring: true },
                  { logo: 'AP', bg: '#B0883F', title: 'QC Analyst (HPLC) — API Division', company: 'Aurobindo Pharma', country: '🇮🇳 Hyderabad, India', tags: [['Full-time', 'jt-ft'], ['HPLC Expert', ''], ['2+ yrs', '']], desc: 'HPLC method validation and batch release testing for API production.', posted: '5h ago', hiring: true },
                  { logo: 'BL', bg: '#7A5680', title: 'Cosmetic Formulation Scientist', company: 'Beauty Lab Egypt', country: '🇪🇬 Cairo, Egypt', tags: [['Full-time', 'jt-ft'], ['Skincare R&D', ''], ['Remote possible', 'jt-re']], desc: 'Develop and scale-up skincare formulations. EDA cosmetics knowledge a strong plus.', posted: '1d ago', hiring: true },
                ].map((j) => (
                  <div className={styles['jcard']} key={j.title}>
                    <div className={styles['jc-logo']} style={{ background: j.bg }}>{j.logo}</div>
                    <div className={styles['jc-body']}>
                      <div className={styles['jc-title']}><span className={`${styles['role-badge']} ${styles['have']}`} style={{ marginRight: 6 }}>{j.hiring ? '🏢 Hiring' : '👤 Looking for a Job'}</span>{j.title}</div>
                      <div className={styles['jc-company']}><span>{j.company}</span> · <span>{j.country}</span> · <span style={{ color: '#1a56db' }}>✓ Verified</span></div>
                      <div className={styles['jc-tags']}>{j.tags.map(([label, cls]) => <span className={`${styles['jt']} ${styles[cls]}`} key={label}>{label}</span>)}</div>
                      <div className={styles['jc-desc']}>{j.desc}</div>
                    </div>
                    <div className={styles['jc-right']}>
                      <div className={styles['jc-posted']}>{j.posted}</div>
                      <Link href="/jobs" className={styles['apply-btn']} style={{ textDecoration: 'none' }}>Apply Now →</Link>
                      <button className={styles['save-btn']}>🔖 Save</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles['demand-board']}>
            <div className={styles['upgrade-cta']}>
              <div className={styles['uc-title']}>⭐ {t('mk.boostListing')}</div>
              <div className={styles['uc-sub']}>Reach 150,000+ pharmacists &amp; scientists across the Gulf &amp; Africa. Get 8× more views.</div>
              <div className={styles['feature-list']}>
                <div className={styles['fl-item']}>✓ Top placement always</div>
                <div className={styles['fl-item']}>✓ Full media &amp; description</div>
                <div className={styles['fl-item']}>✓ Analytics dashboard</div>
                <div className={styles['fl-item']}>✓ Demand alerts</div>
                <div className={styles['fl-item']}>✓ Verified seller badge</div>
              </div>
              <button className={styles['uc-btn']}>⭐ Upgrade Now</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1c1e21', marginBottom: 8 }}>⭐ Featured Suppliers</div>
              <div className={styles['sp-mini']}>
                <div className={styles['sm-label']}>⭐ Sponsored</div>
                <div className={styles['sm-title']}>Metformin HCl GMP Grade</div>
                <div className={styles['sm-price']}>$5.80/kg · MOQ 500kg</div>
                <div className={styles['sm-seller']}>🇨🇳 Shandong Hope · ✓ CEP+DMF</div>
              </div>
              <div className={styles['sp-mini']}>
                <div className={styles['sm-label']}>⭐ Sponsored</div>
                <div className={styles['sm-title']}>EDA Registration Services</div>
                <div className={styles['sm-price']}>Per product · Free consult</div>
                <div className={styles['sm-seller']}>🇪🇬 Dr. Asmaa Meabed · ★ 4.9</div>
              </div>
            </div>

            <div className={styles['db-title']}>🟠 {t('mk.demandBoard')} <span style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>187</span></div>
            <div className={styles['db-sub']}>Submit quotes to open requests</div>

            {[
              { title: 'Ciprofloxacin HCl 2MT/month', badge: 'URGENT', badgeClass: 'urgent', det: '📦 Annual contract · USFDA/EU-GMP<br/>🇪🇬 Egypt · 2h ago', buyer: 'Dr. Haytham ✓', buyerBg: '#1a56db', buyerInit: 'HD' },
              { title: 'MCC PH-102 — 3MT/month', badge: 'HOT', badgeClass: 'hot', det: '📦 WHO-GMP · Annual<br/>🇪🇬 Egypt · 5h ago', buyer: 'Omar K. ✓', buyerBg: '#246C8E', buyerInit: 'OK' },
              { title: 'Retinol 97%+ · 500g/month', badge: 'OPEN', badgeClass: 'open', det: '📦 ISO 22716 · Cosmetic<br/>🇦🇪 UAE · 1h ago', buyer: 'Nour Beauty', buyerBg: '#7A5680', buyerInit: 'NB' },
            ].map((d) => (
              <div className={styles['dcard']} key={d.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className={styles['dc-title']}><span className={`${styles['role-badge']} ${styles['need']}`} style={{ marginRight: 5, fontSize: 8.5, padding: '2px 6px' }}>🔍 Looking to Buy</span>{d.title}</div>
                  <span className={`${styles['db-badge']} ${styles[d.badgeClass]}`}>{d.badge}</span>
                </div>
                <div className={styles['dc-det']} dangerouslySetInnerHTML={{ __html: d.det }} />
                <div className={styles['dc-foot']}><div className={styles['dc-buyer']}><div className={styles['av']} style={{ background: d.buyerBg, width: 17, height: 17, fontSize: 7 }}>{d.buyerInit}</div> {d.buyer}</div><button className={styles['qt-btn']}>Quote →</button></div>
              </div>
            ))}

            <div className={styles['fdiv']}></div>
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
    <div className={`${styles['main-tab']} ${styles['active']}`}>
      <div className={styles['page-wrap']}>
        <div className={styles['page-title']}>Create a Listing</div>
        <div className={styles['page-sub']}>{step === 1 ? 'Step 1 of 2 — Are you seeking or offering?' : 'Step 2 of 2 — Listing details'}</div>

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
            <div className={styles['draft-banner']}><span>💾</span><span className={styles['draft-text']}>Draft auto-saved — you can leave and continue anytime from &quot;My Listings&quot;</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 8, background: role === 'offering' ? '#dcfce7' : '#fff7ed', color: role === 'offering' ? '#15803d' : '#c2410c' }}>{role === 'offering' ? '📦 Offering' : '🔍 Seeking'}</span>
              <span onClick={() => setStep(1)} style={{ fontSize: 11.5, color: '#1a56db', fontWeight: 700, cursor: 'pointer' }}>← Change</span>
            </div>
            <div className={styles['type-selector']}>
              {['supply', 'demand', 'cmo', 'equipment', 'license', 'service', 'job', 'training'].map((tp) => (
                <div key={tp} className={`${styles['type-pill']} ${type === tp ? styles['active'] : ''}`} onClick={() => setType(tp)}>
                  {CAT_EMOJI[tp]} {tp.charAt(0).toUpperCase() + tp.slice(1)}
                </div>
              ))}
            </div>

            <div className={`${styles['wizard']} ${styles['form-section']} ${styles['active']}`}>
              <div className={styles['wizard-head']}>
                <div className={styles['wh-icon']} style={{ background: '#dcfce7' }}>{CAT_EMOJI[type]}</div>
                <div><div className={styles['wizard-title']}>New {type.charAt(0).toUpperCase() + type.slice(1)} Listing</div><div className={styles['wizard-sub']}>For raw materials, APIs, excipients &amp; finished products</div></div>
              </div>
              <div className={styles['wizard-body']}>
                <div className={styles['field']}><label className={styles['field-label']}>Title <span className={styles['req']}>*</span></label><input className={styles['field-input']} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Metformin HCl BP/USP" /></div>
                <div className={styles['row3']}>
                  <div className={styles['field']}><label className={styles['field-label']}>Price per unit</label><input className={styles['field-input']} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$5.80" /></div>
                  <div className={styles['field']}><label className={styles['field-label']}>Unit</label><select className={styles['field-select']} value={unit} onChange={(e) => setUnit(e.target.value)}><option>per kg</option><option>per ton</option><option>per unit</option></select></div>
                  <div className={styles['field']}><label className={styles['field-label']}>MOQ</label><input className={styles['field-input']} value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="500 kg" /></div>
                </div>
              </div>
              <div className={styles['wizard-footer']}><button className={styles['btn-draft']}>Save as Draft</button><button className={styles['btn-create']} onClick={submit} disabled={submitting}>{submitting ? 'Publishing…' : 'Publish Listing →'}</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ManageTab({ listings }: { listings: any[] }) {
  return (
    <div className={`${styles['main-tab']} ${styles['active']}`}>
      <div className={styles['page-wrap']}>
        <div className={styles['page-title']}>My Listings</div>
        <div className={styles['page-sub']}>Manage your active and draft listings</div>
        <div className={styles['card']}>
          {listings.length === 0 ? (
            <div style={{ padding: 30, color: '#94a3b8', fontSize: 13 }}>You have no listings yet.</div>
          ) : (
            listings.map((l: any) => (
              <div className={styles['lcard']} key={l.id} style={{ marginBottom: 12 }}>
                <div className={styles['lc-inner']}>
                  <div className={styles['lc-top']}>
                    <div className={`${styles['lc-em']} ${styles['em-supply']}`}>{CAT_EMOJI[l.category] || '📦'}</div>
                    <div><div className={styles['lc-title']}>{l.title}</div><div className={styles['lc-desc']}>{l.status} · {l.views_count || 0} views · {l.inquiries_count || 0} inquiries</div></div>
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
    <div className={`${styles['main-tab']} ${styles['active']}`}>
      <div className={styles['page-wrap']}>
        <div className={styles['page-title']}>My Marketplace Intents</div>
        <div className={styles['page-sub']}>Tell Drugbox what you have and what you need, per category — this powers your matches, your feed, and what shows on your profile.</div>
        <div className={styles['logic-key']}>
          <b>How to read every toggle below</b>
          One side always means <b style={{ color: '#15803d' }}>&quot;I already HAVE this / I provide this&quot;</b> — shown in green.
          The other side always means <b style={{ color: '#c2410c' }}>&quot;I NEED this / I&apos;m looking for this&quot;</b> — shown in orange.
        </div>
        <div className={styles['card']}>
          <div className={styles['cat-group-title']}>🧪 Materials &amp; Products<div className={styles['cgt-line']}></div></div>
          <div className={styles['category-intent-grid']}>
            <div className={styles['cat-intent-row']}>
              <div className={styles['cir-icon']}>⚗️</div>
              <div className={styles['cir-text']}><div className={styles['cir-name']}>APIs &amp; Raw Materials</div><div className={styles['cir-sub']}>e.g. Metformin HCl, Neomycin Sulphate</div></div>
              <div className={styles['intent-toggle']}>
                <div className={`${styles['it-opt']} ${styles['i-have']} ${styles['active']}`}>📦 I have this to sell</div>
                <div className={`${styles['it-opt']} ${styles['i-need']}`}>🔍 I need to buy this</div>
                <div className={`${styles['it-opt']} ${styles['both']}`}>↔️ Both</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
