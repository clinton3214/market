'use client'

import { BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/brand-icons'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

const accounts = [
  {
    id: '1',
    platform: 'Instagram',
    Icon: InstagramIcon,
    handle: '@travel.frames',
    followers: '182K followers',
    price: '$1,450',
  },
  {
    id: '2',
    platform: 'X',
    Icon: XIcon,
    handle: '@cryptodaily',
    followers: '96.4K followers',
    price: '$980',
  },
  {
    id: '3',
    platform: 'Facebook',
    Icon: FacebookIcon,
    handle: 'Fitness Hub',
    followers: '240K followers',
    price: '$1,120',
  },
  {
    id: '4',
    platform: 'Instagram',
    Icon: InstagramIcon,
    handle: '@street.style',
    followers: '58.2K followers',
    price: '$640',
  },
]

export function FeaturedAccounts() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleCheckout = async (accountId: string) => {
    if (!user) {
      router.push('/login')
      return
    }
    try {
      setLoading(accountId)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const res = await fetch(`${backendUrl}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Checkout failed')
      }
    } catch (e) {
      alert('Failed to connect to checkout server')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Featured accounts
          </h2>
          <p className="mt-3 max-w-lg text-pretty text-muted-foreground">
            Premium listings, escrow-protected and ready for instant transfer.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-border bg-transparent hover:bg-secondary"
          onClick={() => {
            if (!user) router.push('/login')
            else router.push('/accounts')
          }}
        >
          View all listings
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((acc, i) => (
          <article
            key={i}
            className="group glass-card flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary/70">
                <acc.Icon className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Verified
              </span>
            </div>

            <div className="mt-5">
              <p className="text-sm text-muted-foreground">{acc.platform}</p>
              <p className="text-base font-semibold">{acc.handle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {acc.followers}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <span className="text-lg font-bold">{acc.price}</span>
              <Button
                size="sm"
                onClick={() => handleCheckout(acc.id)}
                disabled={loading === acc.id}
                className="gradient-accent border-0 text-white transition-transform group-hover:scale-105"
              >
                {loading === acc.id ? 'Processing...' : 'Buy'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
