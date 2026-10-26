'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { Navbar } from '@/components/navbar'
import { WhatsAppLiquidWarning } from '@/components/whatsapp-liquid-warning'
import { WhatsAppLiquidModal } from '@/components/whatsapp-liquid-modal'

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

// 5sim API requires specific identifiers
function normalizeCountry(c: string) {
  const map: Record<string, string> = {
    'united states': 'usa',
    'united kingdom': 'england',
    'ivory coast': 'ivorycoast',
    'sierra leone': 'sierraleone',
  };
  const lower = c.toLowerCase();
  return map[lower] || lower.replace(/ /g, '');
}

function normalizeProduct(p: string) {
  const map: Record<string, string> = {
    'playstation': 'playstation',
    'xbox': 'xbox',
    'riot games': 'riotgames',
    'epic games': 'epicgames',
    'booking.com': 'booking',
    'just eat': 'justeat',
    'crypto.com': 'crypto',
  };
  const lower = p.toLowerCase();
  return map[lower] || lower.replace(/ /g, '');
}

function Selector({ 
  label, 
  value, 
  setValue, 
  options, 
  grouped = false,
  isOpenExternal,
  onExternalChange,
}: { 
  label: string; 
  value: string; 
  setValue: (v: string) => void; 
  options: string[] | Group[]; 
  grouped?: boolean;
  isOpenExternal?: boolean;
  onExternalChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isOpenExternal !== undefined ? isOpenExternal : internalOpen
  const setOpen = (o: boolean) => {
    setInternalOpen(o)
    if (onExternalChange) onExternalChange(o)
  }
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => grouped ? (options as Group[]).map((group) => ({ ...group, platforms: group.platforms.filter((item) => item.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.platforms.length) : (options as string[]).filter((item) => item.toLowerCase().includes(query.toLowerCase())), [options, query, grouped])
  
  return (
    <div className="selector-field">
      <label>{label}</label>
      <button type="button" className={`selector-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={value ? 'selected-value' : 'placeholder'}>{value || `Select ${label.toLowerCase()}`}</span><Chevron />
      </button>
      {open && (
        <div className="selector-menu">
          <div className="selector-search"><SearchIcon /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} /></div>
          <div className="selector-options">
            {grouped ? (filtered as Group[]).map((group) => (
              <div key={group.label}>
                <p className="group-label">{group.label}</p>
                {group.platforms.map((item) => {
                  const isWhatsApp = item.toLowerCase() === 'whatsapp';
                  return (
                    <button 
                      type="button" 
                      key={item} 
                      onClick={() => { setValue(item); setOpen(false); setQuery('') }}
                      className={`flex items-center justify-between w-full text-left ${isWhatsApp ? 'hover:bg-amber-500/10' : ''}`}
                    >
                      <span>{item}</span>
                      {isWhatsApp && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Paused
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )) : (filtered as string[]).map((item) => {
              const isWhatsApp = item.toLowerCase() === 'whatsapp';
              return (
                <button 
                  type="button" 
                  key={item} 
                  onClick={() => { setValue(item); setOpen(false); setQuery('') }}
                  className={`flex items-center justify-between w-full text-left ${isWhatsApp ? 'hover:bg-amber-500/10' : ''}`}
                >
                  <span>{item}</span>
                  {isWhatsApp && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Paused
                    </span>
                  )}
                </button>
              )
            })}
            {!filtered.length && <p className="empty-option">No matches found. You can type your own.</p>}
          </div>
          <div className="custom-entry"><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={`Or type a custom ${label.toLowerCase()}`} /></div>
        </div>
      )}
    </div>
  )
}

export default function OtpPurchasePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [country, setCountry] = useState('')
  const [service, setService] = useState('')
  const [email, setEmail] = useState('')
  const [priceInfo, setPriceInfo] = useState<any>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [platformSelectorOpen, setPlatformSelectorOpen] = useState(false)

  // Detect if user selects or tries to buy WhatsApp
  const isWhatsApp = useMemo(() => {
    if (!service) return false;
    const clean = service.trim().toLowerCase().replace(/\s+/g, '');
    return clean === 'whatsapp' || clean.includes('whatsapp') || normalizeProduct(service) === 'whatsapp';
  }, [service]);

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Show nothing while checking auth
  if (loading || !user) {
    return (
      <main className="selector-page">
        <Navbar />
        <section className="selector-hero flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </section>
      </main>
    )
  }

  const fetchPrice = async () => {
    if (!country || !service) return;

    if (isWhatsApp) {
      setShowWhatsAppModal(true);
      return;
    }

    setLoadingPrice(true);
    setError('');
    setPriceInfo(null);
    try {
      const apiCountry = normalizeCountry(country);
      const apiService = normalizeProduct(service);
      const res = await fetch(`/api/otp/price?country=${encodeURIComponent(apiCountry)}&service=${encodeURIComponent(apiService)}`);
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

    if (isWhatsApp) {
      setShowWhatsAppModal(true);
      return;
    }

    setCheckingOut(true);
    setError('');
    try {
      const apiCountry = normalizeCountry(country);
      const apiService = normalizeProduct(service);
      const res = await fetch('/api/otp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, country: apiCountry, service: apiService }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details ? `${data.error}: ${data.details}` : data.error || 'Checkout failed');
      }
      
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
      <Navbar />
      <section className="selector-hero" id="top">
        <div className="eyebrow"><span /> Instant delivery</div>
        <h1 className="hero-h1">Rent a <span>foreign number</span><br />in seconds</h1>
        <p className="hero-copy">Get an instant, disposable phone number for verification on any platform.</p>
        <div className="selection-panel" id="platforms">
          <Selector 
            label="Country" 
            value={country} 
            setValue={(v) => { setCountry(v); setPriceInfo(null); setError('') }} 
            options={countries} 
          />
          <Selector 
            label="Platform" 
            value={service} 
            setValue={(v) => { 
              setService(v); 
              setPriceInfo(null); 
              setError('');
            }} 
            options={groups} 
            grouped 
            isOpenExternal={platformSelectorOpen}
            onExternalChange={setPlatformSelectorOpen}
          />

          {/* LIQUID GLASS WARNING FOR WHATSAPP */}
          {isWhatsApp && (
            <div className="mt-6 mb-2">
              <WhatsAppLiquidWarning 
                onSwitchToPlatform={(plat) => {
                  setService(plat);
                  setPriceInfo(null);
                  setError('');
                }}
                onDismiss={() => {
                  setService('');
                  setPriceInfo(null);
                  setError('');
                }}
                onOpenSelector={() => {
                  setPlatformSelectorOpen(true);
                }}
              />
            </div>
          )}
          
          <div className="selection-footer">
            <div className="selection-status">
              {isWhatsApp ? (
                <span className="flex items-center gap-2 text-amber-300">
                  <span className="status-dot" style={{ backgroundColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
                  <span>WhatsApp route paused — select Telegram or another platform</span>
                </span>
              ) : country && service ? (
                <>
                  <span className="status-dot active" />
                  <span>Ready to check <strong>{service}</strong> in {country}</span>
                </>
              ) : (
                <>
                  <span className="status-dot" />
                  <span>Select both fields to continue</span>
                </>
              )}
            </div>
            
            {!priceInfo && (
              isWhatsApp ? (
                <button 
                  type="button"
                  onClick={() => setShowWhatsAppModal(true)}
                  className="browse-button flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(105deg, rgba(245, 158, 11, 0.85), rgba(217, 119, 6, 0.85))',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 10px 28px rgba(245, 158, 11, 0.35)',
                    cursor: 'pointer'
                  }}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span>Route Paused • View Notice</span>
                </button>
              ) : (
                <button 
                  className="browse-button flex items-center justify-center gap-2" 
                  disabled={!country || !service || loadingPrice} 
                  onClick={fetchPrice}
                >
                  {loadingPrice ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Check Availability <span>→</span>
                </button>
              )
            )}
          </div>

          {error && !isWhatsApp && (
            <div className="mt-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {priceInfo && !isWhatsApp && (
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

      {/* Interactive Liquid Glass Modal */}
      <WhatsAppLiquidModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onSwitchToPlatform={(plat) => {
          setService(plat);
          setPriceInfo(null);
          setError('');
        }}
      />
    </main>
  )
}
