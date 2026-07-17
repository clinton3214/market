'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, Zap, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'

const trustBadges = [
  { label: 'Secure Payment', icon: ShieldCheck },
  { label: 'Instant Delivery', icon: Zap },
  { label: '24/7 Support', icon: Headphones },
]

export function Hero() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden pt-40 pb-24 sm:pt-48">
      {/* Ambient gradient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full opacity-25 blur-[120px] gradient-accent"
      />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Trusted by 40,000+ creators & brands
        </div>

        <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Buy Verified Social <br className="hidden sm:block" />
          Accounts <span className="gradient-text">Instantly</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          A premium marketplace for established Instagram, Facebook, and X
          accounts. Real followers, verified handles, delivered the moment you
          pay.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <Button
            size="lg"
            onClick={() => {
              if (!user) router.push('/login')
              else router.push('/accounts')
            }}
            className="group h-13 gradient-accent border-0 px-8 text-base font-semibold text-white shadow-xl shadow-primary/25 transition-transform hover:scale-[1.03]"
          >
            Browse Accounts
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {trustBadges.map((badge) => (
            <li
              key={badge.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <badge.icon className="h-4 w-4 text-primary" />
              {badge.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
