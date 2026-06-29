'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TERMS_SECTIONS } from './terms-content'
import styles from './terms-approved.module.css'

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
      <div className={styles['topbar']}><div className={styles['brand']}>DRUGBOX</div></div>

      <div className={styles['page-wrap']}>
        <div className={styles['page-title']}>📋 اتفاقية المستخدم وشروط الاستخدام</div>
        <div className={styles['page-sub']}>آخر تحديث: 23 يونيو 2026 — برجاء القراءة بعناية قبل إنشاء حسابك</div>

        <div className={styles['toc']}>
          <div className={styles['toc-title']}>محتويات الاتفاقية</div>
          {TERMS_SECTIONS.map((s, i) => (
            <a key={s.id} className={styles['toc-item']} href={`#${s.id}`}>{AR_NUM[i + 1]}. {s.title}</a>
          ))}
        </div>

        {TERMS_SECTIONS.map((s, i) => (
          <div className={styles['section']} id={s.id} key={s.id}>
            <span className={styles['section-num']}>القسم {AR_NUM[i + 1]}</span>
            <div className={styles['section-title']}>{s.title}</div>
            <div className={styles['section-body']} dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
          </div>
        ))}
      </div>

      <div className={styles['consent-bar']}>
        <div className={styles['consent-inner']}>
          <div className={styles['consent-row']} onClick={() => setAgreeTerms(!agreeTerms)}>
            <div className={`${styles['consent-checkbox']} ${agreeTerms ? styles['checked'] : ''}`}>{agreeTerms ? '✓' : ''}</div>
            <div className={styles['consent-text']}>قرأت وأوافق على <a href="#s1">اتفاقية المستخدم</a> وسياسة الخصوصية الخاصة بـ Drugbox</div>
          </div>
          <div className={styles['consent-row']} onClick={() => setConfirmAge(!confirmAge)}>
            <div className={`${styles['consent-checkbox']} ${confirmAge ? styles['checked'] : ''}`}>{confirmAge ? '✓' : ''}</div>
            <div className={styles['consent-text']}>أؤكد أن عمري 18 عامًا أو أكثر، وأن البيانات التي سأقدمها صحيحة</div>
          </div>
          <div className={styles['consent-actions']}>
            <button className={styles['btn-decline']} onClick={handleDecline}>رفض والخروج</button>
            <button className={`${styles['btn-agree']} ${canAgree ? styles['enabled'] : ''}`} onClick={handleAgree} disabled={!canAgree}>أوافق وأنشئ حسابي ←</button>
          </div>
        </div>
      </div>
    </div>
  )
}
