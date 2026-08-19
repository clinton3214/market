'use client'

import { useMemo, useState } from 'react'

type Purchase = {
  id: string
  platform: string
  category: string
  account: string
  country: string
  date: string
  price: string
  status: 'Delivered' | 'Processing'
  accent: string
}

const purchases: Purchase[] = [
  { id: 'TP-10482', platform: 'Instagram', category: 'Social Media', account: '@northstar.studio', country: 'United States', date: 'Aug 16, 2026', price: '$149.00', status: 'Delivered', accent: 'instagram' },
  { id: 'TP-10397', platform: 'WhatsApp', category: 'Messenger', account: '+1 (415) 555-0182', country: 'Canada', date: 'Aug 11, 2026', price: '$89.00', status: 'Delivered', accent: 'whatsapp' },
  { id: 'TP-10264', platform: 'TikTok', category: 'Social Media', account: '@lumen.daily', country: 'United Kingdom', date: 'Aug 03, 2026', price: '$229.00', status: 'Delivered', accent: 'tiktok' },
  { id: 'TP-10188', platform: 'Telegram', category: 'Messenger', account: '+44 7700 900 431', country: 'Germany', date: 'Jul 29, 2026', price: '$74.00', status: 'Processing', accent: 'telegram' },
  { id: 'TP-09931', platform: 'Twitter (X)', category: 'Social Media', account: '@orbitcommerce', country: 'France', date: 'Jul 18, 2026', price: '$179.00', status: 'Delivered', accent: 'twitter' },
]

function PlatformIcon({ type }: { type: string }) {
  return <span className={`purchase-platform-icon ${type}`} aria-hidden="true">{type === 'instagram' ? '◎' : type === 'whatsapp' ? '◔' : type === 'tiktok' ? '♪' : type === 'telegram' ? '➤' : '𝕏'}</span>
}

export default function PurchasesPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All purchases')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState('')

  const filtered = useMemo(() => purchases.filter((purchase) => {
    const matchesQuery = `${purchase.platform} ${purchase.account} ${purchase.country}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All purchases' || purchase.status === filter
    const isNumber = purchase.account.trim().startsWith('+')
    const matchesType = typeFilter === 'All types' || (typeFilter === 'Accounts' && !isNumber) || (typeFilter === 'Numbers' && isNumber)
    return matchesQuery && matchesFilter && matchesType
  }), [query, filter])

  async function copyAccount(purchase: Purchase) {
    await navigator.clipboard?.writeText(purchase.account)
    setCopied(purchase.id)
    window.setTimeout(() => setCopied(''), 1800)
  }

  return <main className="purchases-page">
    <header className="glass-header purchases-header">
      <a className="brand" href="/" aria-label="Travis Pay home"><span className="brand-mark">T</span><span>Travis Pay</span></a>
      <nav className={mobileOpen ? 'mobile-nav open' : 'desktop-nav'}>
        <a href="/">Platforms</a><a className="active-nav" href="/purchases">My Purchases</a><a href="#support">Support</a><a href="#login">Login</a><a className="nav-signup" href="#signup">Sign Up</a>
      </nav>
      <button className="menu-toggle" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}><span /><span /></button>
    </header>

    <section className="purchases-content">
      <div className="purchases-heading"><div><div className="eyebrow"><span /> Your private library</div><h1>My <span>purchases</span></h1><p className="purchases-copy">Everything you have bought, delivered and ready when you need it.</p></div><a className="browse-button compact-button" href="/">Browse more <span>→</span></a></div>
      <div className="purchase-stats"><div><strong>{purchases.length}</strong><span>Total accounts</span></div><div><strong>4</strong><span>Delivered</span></div><div><strong>₦720</strong><span>Total spent</span></div></div>
      <div className="purchases-toolbar"><label className="purchase-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts, platforms or countries" aria-label="Search purchases" /></label><div className="filter-groups"><div className="filter-group" aria-label="Filter by purchase status">{['All purchases', 'Delivered', 'Processing'].map((item) => <button type="button" key={item} className={filter === item ? 'filter-button active' : 'filter-button'} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="filter-group" aria-label="Filter by account type">{['All types', 'Accounts', 'Numbers'].map((item) => <button type="button" key={item} className={typeFilter === item ? 'filter-button active' : 'filter-button'} onClick={() => setTypeFilter(item)}>{item}</button>)}</div></div></div>
      <div className="purchase-list" aria-live="polite">{filtered.map((purchase) => <article className="purchase-card" key={purchase.id}><div className="purchase-card-main"><PlatformIcon type={purchase.accent} /><div className="purchase-info"><div className="purchase-title-row"><h2>{purchase.platform}</h2><span className={`purchase-status ${purchase.status.toLowerCase()}`}>{purchase.status}</span></div><p>{purchase.category} · Order {purchase.id}</p><strong className="purchase-account">{purchase.account}</strong></div></div><div className="purchase-meta"><div><span>Country</span><strong>{purchase.country}</strong></div><div><span>Purchased</span><strong>{purchase.date}</strong></div><div><span>Price</span><strong>{purchase.price}</strong></div><button className="copy-button" onClick={() => copyAccount(purchase)}>{copied === purchase.id ? 'Copied' : 'Copy account'}</button></div></article>)}{!filtered.length && <div className="empty-purchases"><strong>No purchases found</strong><span>Try another search or filter.</span></div>}</div>
    </section>
  </main>
}
