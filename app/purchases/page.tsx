'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import styles from './purchases.module.css'

type Credentials = {
  accountEmail?: string
  emailPassword?: string
  accountUsername?: string
  accountPassword?: string
  twoFactorAuth?: string
  backupCode?: string
  note?: string
}

type Purchase = {
  id: string
  platform: string
  category: string
  handle: string
  date?: string
  price: number
  status: 'available' | 'sold'
  purchasedAt: string
  credentials?: Credentials
}

function PlatformIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  return <span className={`${styles.purchasePlatformIcon} ${styles[t] || ''}`} aria-hidden="true">{t === 'instagram' ? '◎' : t === 'whatsapp' ? '◔' : t === 'tiktok' ? '♪' : t === 'telegram' ? '➤' : t === 'facebook' ? 'f' : '𝕏'}</span>
}

export default function PurchasesPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All purchases')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState('')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [revealing, setRevealing] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    fetch('/api/purchases')
      .then(res => {
        if (res.status === 401) {
          router.push('/login?callbackUrl=/purchases')
          throw new Error('Unauthorized')
        }
        return res.json()
      })
      .then(data => {
        if (data.purchases) {
          setPurchases(data.purchases)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [router])

  const filtered = useMemo(() => purchases.filter((purchase) => {
    const matchesQuery = `${purchase.platform} ${purchase.handle}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All purchases' || (filter === 'Delivered' && purchase.status === 'sold')
    return matchesQuery && matchesFilter
  }), [query, filter, purchases])

  async function copyAccount(purchase: Purchase) {
    if (!purchase.credentials || purchase.credentials.accountUsername === '••••••••') return;
    
    const text = `Username: ${purchase.credentials.accountUsername || purchase.handle}\nPassword: ${purchase.credentials.accountPassword || 'N/A'}`;
    await navigator.clipboard?.writeText(text)
    setCopied(purchase.id)
    window.setTimeout(() => setCopied(''), 1800)
  }

  async function revealCredentials(id: string) {
    try {
      setRevealing(id)
      const res = await fetch(`/api/purchases/${id}/credentials`)
      if (res.status === 401) {
        router.push('/login?callbackUrl=/purchases')
        return
      }
      const data = await res.json()
      if (data.success && data.credentials) {
        setPurchases(current => current.map(p => 
          p.id === id ? { ...p, credentials: data.credentials } : p
        ))
      } else {
        alert(data.error || 'Failed to reveal credentials')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setRevealing(null)
    }
  }

  return <main className={styles.purchasesPage}>
    <Navbar />

    <section className={styles.purchasesContent}>
      <div className={styles.purchasesHeading}>
        <div>
          <div className={styles.eyebrow}><span /> Your private library</div>
          <h1>My <span>purchases</span></h1>
          <p className={styles.purchasesCopy}>Everything you have bought, delivered and ready when you need it.</p>
        </div>
        <Link className={`${styles.browseButton} ${styles.compactButton}`} href="/accounts">Browse more <span>→</span></Link>
      </div>
      
      <div className={styles.purchaseStats}>
        <div><strong>{purchases.length}</strong><span>Total accounts</span></div>
        <div><strong>{purchases.filter(p => p.status === 'sold').length}</strong><span>Delivered</span></div>
        <div><strong>₦{purchases.reduce((acc, p) => acc + (p.price || 0), 0).toLocaleString()}</strong><span>Total spent</span></div>
      </div>
      
      <div className={styles.purchasesToolbar}>
        <label className={styles.purchaseSearch}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search handles or platforms" aria-label="Search purchases" />
        </label>
        <div className={styles.filterGroups}>
          <div className={styles.filterGroup} aria-label="Filter by purchase status">
            {['All purchases', 'Delivered'].map((item) => <button type="button" key={item} className={filter === item ? `${styles.filterButton} ${styles.active}` : styles.filterButton} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
      </div>
      
      <div className={styles.purchaseList} aria-live="polite">
        {loading && <div className={styles.emptyPurchases}><strong>Loading purchases...</strong></div>}
        {!loading && filtered.map((purchase) => {
          const isMasked = purchase.credentials?.accountUsername === '••••••••'
          
          return (
          <article className={styles.purchaseCard} key={purchase.id}>
            <div className={styles.purchaseCardMain}>
              <PlatformIcon type={purchase.platform} />
              <div className={styles.purchaseInfo}>
                <div className={styles.purchaseTitleRow}>
                  <h2>{purchase.platform}</h2>
                  <span className={`${styles.purchaseStatus} ${styles.delivered}`}>Delivered</span>
                </div>
                <p>{purchase.category} · Order {purchase.id.slice(-6)}</p>
                <strong className={styles.purchaseAccount}>{purchase.handle}</strong>
              </div>
            </div>
            
            <div className="flex-1 w-full lg:w-auto">
              <div className={styles.purchaseMeta}>
                <div><span>Purchased</span><strong>{new Date(purchase.purchasedAt).toLocaleDateString()}</strong></div>
                <div><span>Price</span><strong>₦{purchase.price.toLocaleString()}</strong></div>
                
                {isMasked ? (
                  <button className={styles.copyButton} onClick={() => revealCredentials(purchase.id)} disabled={revealing === purchase.id}>
                    {revealing === purchase.id ? 'Revealing...' : 'Reveal Credentials'}
                  </button>
                ) : (
                  <button className={styles.copyButton} onClick={() => copyAccount(purchase)}>
                    {copied === purchase.id ? 'Copied' : 'Copy log'}
                  </button>
                )}
              </div>
              
              {!isMasked && purchase.credentials && (
                <div className={styles.credentialsPanel}>
                  {purchase.credentials.accountUsername && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Username</span>
                      <span className={styles.credentialValue}>{purchase.credentials.accountUsername}</span>
                    </div>
                  )}
                  {purchase.credentials.accountPassword && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Password</span>
                      <span className={styles.credentialValue}>{purchase.credentials.accountPassword}</span>
                    </div>
                  )}
                  {purchase.credentials.accountEmail && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Email</span>
                      <span className={styles.credentialValue}>{purchase.credentials.accountEmail}</span>
                    </div>
                  )}
                  {purchase.credentials.emailPassword && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Email Password</span>
                      <span className={styles.credentialValue}>{purchase.credentials.emailPassword}</span>
                    </div>
                  )}
                  {purchase.credentials.twoFactorAuth && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>2FA Key</span>
                      <span className={styles.credentialValue}>{purchase.credentials.twoFactorAuth}</span>
                    </div>
                  )}
                  {purchase.credentials.backupCode && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Backup Code</span>
                      <span className={styles.credentialValue}>{purchase.credentials.backupCode}</span>
                    </div>
                  )}
                  {purchase.credentials.note && (
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Note</span>
                      <span className={styles.credentialValue}>{purchase.credentials.note}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        )})}
        {!loading && !filtered.length && <div className={styles.emptyPurchases}><strong>No purchases found</strong><span>Try another search or filter.</span></div>}
      </div>
    </section>
  </main>
}
