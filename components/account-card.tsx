"use client"

import { useState } from "react"
import { BadgeCheck, TrendingUp, Users, Loader2 } from "lucide-react"
import type { Account } from "@/lib/accounts"
import { platformMeta } from "@/lib/accounts"
import { PlatformIcon } from "@/components/platform-icon"
import { Button } from "@/components/ui/button"

export function AccountCard({ account }: { account: Account }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id })
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Checkout failed')
        setLoading(false)
      }
    } catch (err) {
      alert('Error connecting to backend')
      setLoading(false)
    }
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
      {/* glass sheen on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-foreground backdrop-blur-md">
          <PlatformIcon platform={account.platform} className="h-5 w-5" />
        </span>
        {account.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">Unverified</span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="text-xs text-muted-foreground">{platformMeta[account.platform].label}</p>
        <h3 className="mt-1 truncate text-lg font-semibold tracking-tight">{account.handle}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {account.followers}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            {account.engagement}
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-md">
          {account.category}
        </span>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <p className="font-display text-xl font-bold">₦{account.price.toLocaleString()}</p>
        <Button 
          onClick={handleCheckout} 
          disabled={loading}
          className="rounded-full bg-gradient-to-r from-primary to-chart-4 px-5 font-semibold text-primary-foreground hover:opacity-90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
        </Button>
      </div>
    </article>
  )
}
