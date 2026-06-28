'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TERMS_SECTIONS } from './terms-content'
import './terms-approved.css'

const AR_NUM = ['', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤']

export default function TermsPage() {
  const router = useRouter()
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [confirmAge, setConfirmAge] = useState(false)

  const canAgree = agreeTerms && confirmAge

  function handleAgree() {
    if (!canAgree) return
    router.push('/login')
  }
  function handleDecline() {
    if (confirm('هل أنت متأكد؟ بدون الموافقة على الاتفاقية لا يمكن إنشاء حساب على Drugbox.')) {
      router.push('/login')
    }
  }

  return (
    <div dir="rtl">
      <div className="topbar"><div className="brand">DRUGBOX</div></div>

      <div className="page-wrap">
        <div className="page-title">📋 اتفاقية المستخدم وشروط الاستخدام</div>
        <div className="page-sub">آخر تحديث: 23 يونيو 2026 — برجاء القراءة بعناية قبل إنشاء حسابك</div>

        <div className="toc">
          <div className="toc-title">محتويات الاتفاقية</div>
          {TERMS_SECTIONS.map((s, i) => (
            <a key={s.id} className="toc-item" href={`#${s.id}`}>{AR_NUM[i + 1]}. {s.title}</a>
          ))}
        </div>

        {TERMS_SECTIONS.map((s, i) => (
          <div className="section" id={s.id} key={s.id}>
            <span className="section-num">القسم {AR_NUM[i + 1]}</span>
            <div className="section-title">{s.title}</div>
            <div className="section-body" dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
          </div>
        ))}
      </div>

      <div className="consent-bar">
        <div className="consent-inner">
          <div className="consent-row" onClick={() => setAgreeTerms(!agreeTerms)}>
            <div className={`consent-checkbox ${agreeTerms ? 'checked' : ''}`}>{agreeTerms ? '✓' : ''}</div>
            <div className="consent-text">قرأت وأوافق على <a href="#s1">اتفاقية المستخدم</a> وسياسة الخصوصية الخاصة بـ Drugbox</div>
          </div>
          <div className="consent-row" onClick={() => setConfirmAge(!confirmAge)}>
            <div className={`consent-checkbox ${confirmAge ? 'checked' : ''}`}>{confirmAge ? '✓' : ''}</div>
            <div className="consent-text">أؤكد أن عمري 18 عامًا أو أكثر، وأن البيانات التي سأقدمها صحيحة</div>
          </div>
          <div className="consent-actions">
            <button className="btn-decline" onClick={handleDecline}>رفض والخروج</button>
            <button className={`btn-agree ${canAgree ? 'enabled' : ''}`} onClick={handleAgree} disabled={!canAgree}>أوافق وأنشئ حسابي ←</button>
          </div>
        </div>
      </div>
    </div>
  )
}
