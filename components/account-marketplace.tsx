"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, ShieldCheck, Zap, Sparkles } from "lucide-react"
import { platformMeta, type Platform, type Account } from "@/lib/accounts"
import { AccountCard } from "@/components/account-card"
import { PlatformIcon } from "@/components/platform-icon"

type Filter = "all" | Platform

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All accounts" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X" },
  { value: "telegram", label: "Telegram" },
]

export function AccountMarketplace() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [active, setActive] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/listings")
        if (res.ok) {
          const data = await res.json()
          setAccounts(data)
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return accounts.filter((a) => {
      const matchPlatform = active === "all" || a.platform === active
      const matchQuery =
        q === "" ||
        a.handle.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      return matchPlatform && matchQuery
    })
  }, [active, query])

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: accounts.length, instagram: 0, facebook: 0, x: 0, telegram: 0 }
    for (const a of accounts) {
      if (c[a.platform] !== undefined) {
        c[a.platform] += 1
      }
    }
    return c
  }, [accounts])

  const totalFollowers = useMemo(() => {
    // rough sum for display flavor
    return accounts.reduce((sum, a) => {
      const n = Number.parseFloat(a.followers)
      const mult = a.followers.toUpperCase().includes("M") ? 1_000_000 : a.followers.toUpperCase().includes("K") ? 1_000 : 1
      return sum + (Number.isNaN(n) ? 0 : n * mult)
    }, 0)
  }, [accounts])

  const stats = [
    { icon: Sparkles, label: "Live listings", value: accounts.length.toString() },
    { icon: Zap, label: "Combined reach", value: `${(totalFollowers / 1_000_000).toFixed(1)}M+` },
    { icon: ShieldCheck, label: "Escrow protected", value: "100%" },
  ]

  return (
    <section id="listings" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-28 sm:pt-32">
      {/* Glass intro panel */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The verified account marketplace
          </span>

          <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Browse premium accounts,{" "}
            <span className="bg-gradient-to-r from-primary via-chart-4 to-chart-2 bg-clip-text text-transparent">
              transferred instantly
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Hand-vetted Instagram, Facebook, X, and Telegram accounts with real followers and verified handles.
            Delivered the moment you pay.
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-3 sm:max-w-lg">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md"
              >
                <s.icon className="h-5 w-5 text-primary" />
                <dt className="mt-3 text-xs text-muted-foreground">{s.label}</dt>
                <dd className="font-display text-xl font-bold tracking-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const isActive = active === f.value
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setActive(f.value)}
                className={
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md transition-all " +
                  (isActive
                    ? "border-transparent bg-gradient-to-r from-primary to-chart-4 text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)]"
                    : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground")
                }
              >
                {f.value !== "all" ? <PlatformIcon platform={f.value} className="h-4 w-4" /> : null}
                {f.label}
                <span className={isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"}>
                  {counts[f.value]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search handle or niche"
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-foreground outline-none backdrop-blur-md transition-colors placeholder:text-muted-foreground focus:border-primary"
            aria-label="Search accounts"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-md">
          <p className="text-muted-foreground animate-pulse">Loading accounts...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-md">
          <p className="text-muted-foreground">No accounts match your search.</p>
        </div>
      )}

      <p className="sr-only">
        Browse accounts across {Object.values(platformMeta).map((p) => p.label).join(", ")}.
      </p>
    </section>
  )
}
