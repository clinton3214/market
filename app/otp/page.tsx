'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Group = { label: string; platforms: string[] }

const groups: Group[] = [
  { label: 'Messengers & Chat Apps', platforms: ['WhatsApp', 'Telegram', 'WeChat', 'Discord', 'Viber', 'Line', 'Signal', 'Skype', 'Imo', 'KakaoTalk', 'Kik', 'Snapchat', 'ICQ', 'Zalo'] },
  { label: 'Social Media & Content Networks', platforms: ['Facebook', 'Instagram', 'TikTok', 'Twitter', 'Reddit', 'LinkedIn', 'Pinterest', 'VK', 'Tumblr', 'Clubhouse', 'Bigo Live', 'Kwai', 'Twitch'] },
  { label: 'AI, Search Engines & Tech', platforms: ['OpenAI', 'Google', 'Microsoft', 'Apple', 'Yahoo', 'Claude', 'Yandex', 'Mail.ru', 'ProtonMail', 'Zoho', 'AOL'] },
  { label: 'E-Commerce & Marketplaces', platforms: ['Amazon', 'AliExpress', 'Temu', 'SHEIN', 'eBay', 'Walmart', 'Target', 'Craigslist', 'Pinduoduo', 'Mercari', 'Taobao', 'Lazada', 'Shopee', 'Allegro'] },
  { label: 'Entertainment & Gaming', platforms: ['Netflix', 'Spotify', 'Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo', 'Roblox', 'Riot Games', 'Blizzard', 'EA', 'Disney+', 'SoundCloud', 'Deezer'] },
  { label: 'Finance & Payments', platforms: ['PayPal', 'Wise', 'Revolut', 'Stripe', 'Binance', 'Coinbase', 'Crypto.com', 'KuCoin', 'Bybit', 'OKX', 'Paxful', 'Skrill', 'Neteller', 'WebMoney'] },
  { label: 'Ride-Hailing & Delivery', platforms: ['Uber', 'Bolt', 'Yandex Go', 'DiDi', 'Grab', 'Gojek', 'Airbnb', 'Booking.com', 'Deliveroo', 'Just Eat', 'DoorDash', 'Grubhub'] },
  { label: 'Dating & Lifestyle', platforms: ['Tinder', 'Bumble', 'Badoo', 'Hinge', 'OkCupid', 'Grindr', 'Mamba'] },
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

export default function OtpPurchasePage() {
  const router = useRouter()
  const [country, setCountry] = useState('')
  const [service, setService] = useState('')
  const [email, setEmail] = useState('')
  const [priceInfo, setPriceInfo] = useState<any>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')

  const fetchPrice = async () => {
    if (!country || !service) return;
    setLoadingPrice(true);
    setError('');
    setPriceInfo(null);
    try {
      const res = await fetch(`/api/otp/price?country=${encodeURIComponent(country.toLowerCase())}&service=${encodeURIComponent(service.toLowerCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch price');
      setPriceInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setCheckingOut(true);
    setError('');
    try {
      const res = await fetch('/api/otp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, country: country.toLowerCase(), service: service.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      
      if (data.checkoutUrl) {
        localStorage.setItem(`otp_order_${data.orderId}`, data.wsToken);
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message);
      setCheckingOut(false);
    }
  };

  return (
    <main className="selector-page">
      <section className="selector-hero" id="top">
        <div className="eyebrow"><span /> Instant delivery</div>
        <h1 className="hero-h1">Rent a <span>foreign number</span><br />in seconds</h1>
        <p className="hero-copy">Get an instant, disposable phone number for verification on any platform.</p>
        <div className="selection-panel" id="platforms">
          <Selector label="Country" value={country} setValue={(v) => { setCountry(v); setPriceInfo(null); setError('') }} options={countries} />
          <Selector label="Platform" value={service} setValue={(v) => { setService(v); setPriceInfo(null); setError('') }} options={groups} grouped />
          
          <div className="selection-footer">
            <div className="selection-status">
              <span className={country && service ? 'status-dot active' : 'status-dot'} />
              {country && service ? <span>Ready to check <strong>{service}</strong> in {country}</span> : <span>Select both fields to continue</span>}
            </div>
            
            {!priceInfo && (
              <button 
                className="browse-button flex items-center justify-center gap-2" 
                disabled={!country || !service || loadingPrice} 
                onClick={fetchPrice}
              >
                {loadingPrice ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Check Availability <span>→</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {priceInfo && (
            <div className="mt-8 pt-6 border-t border-white/10 space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center bg-[#a947ee]/10 border border-[#a947ee]/20 p-4 rounded-xl">
                <span className="text-[#c9c9d0] font-medium">Total Price</span>
                <span className="text-3xl font-bold text-white">₦{priceInfo.sell_price.toLocaleString()}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#b5b5be] mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email for Receipt & Updates
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.12)] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[rgba(145,84,255,.8)] transition-all"
                />
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={checkingOut || !email}
                className="browse-button w-full flex items-center justify-center py-4 text-lg mt-2"
              >
                {checkingOut ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Pay ₦{priceInfo.sell_price.toLocaleString()} via Paystack
              </button>
            </div>
          )}

        </div>
        <div className="trust-row"><span><b>✓</b> Secure payment</span><span><b>↗</b> Instant delivery</span><span><b>◌</b> 24/7 support</span></div>
      </section>
    </main>
  )
}
