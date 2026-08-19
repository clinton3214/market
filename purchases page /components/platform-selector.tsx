'use client'

import { useMemo, useState } from 'react'

type Group = { label: string; platforms: string[] }

const groups: Group[] = [
  { label: 'Messengers & Chat Apps', platforms: ['WhatsApp', 'Telegram', 'WeChat', 'Discord', 'Viber', 'Line', 'Signal', 'Skype', 'Imo', 'KakaoTalk', 'Kik', 'Snapchat', 'ICQ', 'Zalo'] },
  { label: 'Social Media & Content Networks', platforms: ['Facebook / Messenger', 'Instagram / Threads', 'TikTok / Douyin', 'Twitter (X)', 'Reddit', 'LinkedIn', 'Pinterest', 'VK (VKontakte)', 'OK.ru', 'Tumblr', 'Clubhouse', 'Bigo Live', 'Kwai', 'Twitch'] },
  { label: 'AI, Search Engines & Tech Infrastructure', platforms: ['OpenAI / ChatGPT', 'Google (YouTube, Gmail, Drive)', 'Microsoft (Outlook, Hotmail, Azure)', 'Apple ID / iCloud', 'Yahoo', 'Claude AI (Anthropic)', 'Yandex', 'Mail.ru', 'ProtonMail', 'Zoho', 'AOL'] },
  { label: 'E-Commerce, Retail & Marketplaces', platforms: ['Amazon', 'AliExpress / Alibaba', 'Temu', 'SHEIN', 'eBay', 'Walmart', 'Target', 'Craigslist', 'Pinduoduo', 'Mercari', 'Taobao', 'Lazada', 'Shopee', 'Allegro'] },
  { label: 'Entertainment, Streaming & Gaming', platforms: ['Netflix', 'Spotify', 'Steam', 'Epic Games', 'PlayStation Network (PSN)', 'Xbox Live', 'Nintendo', 'Roblox', 'Riot Games (Valorant, League of Legends)', 'Blizzard (Battle.net)', 'EA App (Origin)', 'Disney+', 'SoundCloud', 'Deezer'] },
  { label: 'Finance, Payments & Crypto', platforms: ['PayPal', 'Wise (TransferWise)', 'Revolut', 'Stripe', 'Binance', 'Coinbase', 'Crypto.com', 'KuCoin', 'Bybit', 'OKX', 'Paxful', 'Skrill', 'Neteller', 'WebMoney'] },
  { label: 'Ride-Hailing, Food Delivery & Travel', platforms: ['Uber / Uber Eats', 'Bolt', 'Yandex Go', 'DiDi', 'Grab', 'Gojek', 'Airbnb', 'Booking.com', 'Deliveroo', 'Just Eat', 'DoorDash', 'Grubhub'] },
  { label: 'Dating & Lifestyle Apps', platforms: ['Tinder', 'Bumble', 'Badoo', 'Hinge', 'OkCupid', 'Grindr', 'Mamba'] },
]

const countries = ['United States', 'Canada', 'United Kingdom', 'Sweden', 'Germany', 'France', 'Netherlands', 'Spain', 'Poland', 'Italy', 'Croatia', 'India', 'Indonesia', 'Malaysia', 'Cambodia', 'Mongolia', 'Thailand', 'Vietnam', 'Nigeria', 'Ivory Coast', 'Sierra Leone', 'Benin', 'Ghana', 'Other']

function Chevron() { return <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg> }

function SearchIcon() { return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m13 13 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg> }

function Selector({ label, value, setValue, options, grouped = false }: { label: string; value: string; setValue: (v: string) => void; options: string[] | Group[]; grouped?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => grouped ? (options as Group[]).map((group) => ({ ...group, platforms: group.platforms.filter((item) => item.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.platforms.length) : (options as string[]).filter((item) => item.toLowerCase().includes(query.toLowerCase())), [options, query, grouped])
  return <div className="selector-field">
    <label>{label}</label>
    <button type="button" className={`selector-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className={value ? 'selected-value' : 'placeholder'}>{value || `Select ${label.toLowerCase()}`}</span><Chevron />
    </button>
    {open && <div className="selector-menu">
      <div className="selector-search"><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} /></div>
      <div className="selector-options">
        {grouped ? (filtered as Group[]).map((group) => <div key={group.label}><p className="group-label">{group.label}</p>{group.platforms.map((item) => <button type="button" key={item} onClick={() => { setValue(item); setOpen(false); setQuery('') }}>{item}</button>)}</div>) : (filtered as string[]).map((item) => <button type="button" key={item} onClick={() => { setValue(item); setOpen(false); setQuery('') }}>{item}</button>)}
        {!filtered.length && <p className="empty-option">No matches found. You can type your own.</p>}
      </div>
      <div className="custom-entry"><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={`Or type a custom ${label.toLowerCase()}`} /></div>
    </div>}
  </div>
}

export default function PlatformSelector() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [country, setCountry] = useState('')
  const [platform, setPlatform] = useState('')
  const [submitted, setSubmitted] = useState(false)
  return <main className="selector-page">
    <header className="glass-header">
      <a className="brand" href="#top" aria-label="Travis Pay home"><span className="brand-mark">T</span><span>Travis Pay</span></a>
      <nav className={mobileOpen ? 'mobile-nav open' : 'desktop-nav'}><a href="#platforms">Platforms</a><a href="#how-it-works">How It Works</a><a href="#support">Support</a><a href="#login">Login</a><a className="nav-signup" href="#signup">Sign Up</a></nav>
      <button className="menu-toggle" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}><span /> <span /></button>
    </header>
    <section className="selector-hero" id="top">
      <div className="eyebrow"><span /> Find your next account</div>
      <h1>Choose your <span>platform</span><br />and country</h1>
      <p className="hero-copy">Select where you want to build your presence. Explore verified accounts from the platforms and countries that matter to you.</p>
      <div className="selection-panel" id="platforms">
        <Selector label="Country" value={country} setValue={setCountry} options={countries} />
        <Selector label="Platform" value={platform} setValue={setPlatform} options={groups} grouped />
        <div className="selection-footer"><div className="selection-status"><span className={country && platform ? 'status-dot active' : 'status-dot'} />{country && platform ? <span>Ready to explore <strong>{platform}</strong></span> : <span>Select both fields to continue</span>}</div><button className="browse-button" disabled={!country || !platform} onClick={() => setSubmitted(true)}>Browse Accounts <span>→</span></button></div>
        {submitted && <p className="success-message" role="status">Showing {platform} accounts available in {country}.</p>}
      </div>
      <div className="trust-row"><span><b>✓</b> Secure payment</span><span><b>↗</b> Instant delivery</span><span><b>◌</b> 24/7 support</span></div>
    </section>
  </main>
}

export { groups, countries }
