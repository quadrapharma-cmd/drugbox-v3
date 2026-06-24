'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TERMS_SECTIONS } from './terms-content'
import styles from './terms.module.css'

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
    <div className={styles.page} dir="rtl">
      <div className={styles.topbar}>
        <div className={styles.brand}>DRUGBOX</div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.pageTitle}>📋 اتفاقية المستخدم وشروط الاستخدام</div>
        <div className={styles.pageSub}>آخر تحديث: 23 يونيو 2026 — برجاء القراءة بعناية قبل إنشاء حسابك</div>

        <div className={styles.toc}>
          <div className={styles.tocTitle}>محتويات الاتفاقية</div>
          {TERMS_SECTIONS.map((s, i) => (
            <a key={s.id} className={styles.tocItem} href={`#${s.id}`}>
              {i + 1}. {s.title}
            </a>
          ))}
        </div>

        {TERMS_SECTIONS.map((s, i) => (
          <div key={s.id} className={styles.section} id={s.id}>
            <span className={styles.sectionNum}>القسم {i + 1}</span>
            <div className={styles.sectionTitle}>{s.title}</div>
            <div
              className={styles.sectionBody}
              dangerouslySetInnerHTML={{ __html: s.bodyHtml }}
            />
          </div>
        ))}

        <div className={styles.metaNote}>© 2026 Drugbox — جميع الحقوق محفوظة</div>
      </div>

      <div className={styles.consentBar}>
        <div className={styles.consentInner}>
          <label className={styles.consentRow}>
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
            <span className={styles.consentText}>
              قرأت وأوافق على اتفاقية المستخدم وسياسة الخصوصية الخاصة بـ Drugbox
            </span>
          </label>
          <label className={styles.consentRow}>
            <input type="checkbox" checked={confirmAge} onChange={(e) => setConfirmAge(e.target.checked)} />
            <span className={styles.consentText}>
              أؤكد أن عمري 18 عامًا أو أكثر، وأن البيانات التي سأقدمها صحيحة
            </span>
          </label>
          <div className={styles.consentActions}>
            <button className={styles.btnDecline} onClick={handleDecline}>
              رفض والخروج
            </button>
            <button
              className={`${styles.btnAgree} ${canAgree ? styles.btnAgreeOn : ''}`}
              onClick={handleAgree}
              disabled={!canAgree}
            >
              أوافق وأنشئ حسابي ←
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
