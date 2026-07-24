'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { TravisPayLogo } from '@/components/travis-pay-logo'

const links = [
  { label: 'Instagram', href: '#categories' },
  { label: 'Facebook', href: '#categories' },
  { label: 'X', href: '#categories' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Support', href: '#support' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, setUser } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <TravisPayLogo className="h-6 w-auto" />
            </span>
            <span className="text-lg font-bold tracking-tight">Travis Pay</span>
          </a>

          {/* Center links */}
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="hidden items-center gap-2 md:flex">
            {!user ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="gradient-accent border-0 text-white shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03]">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="mt-2 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-xl md:hidden">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2">
              {!user ? (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full gradient-accent border-0 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <Button variant="ghost" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
