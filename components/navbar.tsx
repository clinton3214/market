'use client'

import { useState } from 'react'
import { Menu, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const links = [
  { label: 'Instagram', href: '#categories' },
  { label: 'Facebook', href: '#categories' },
  { label: 'X', href: '#categories' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Support', href: '#support' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3 backdrop-blur-xl sm:px-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent">
              <ShieldCheck className="h-5 w-5 text-white" />
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
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Login
            </Button>
            <Button className="gradient-accent border-0 text-white shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03]">
              Sign Up
            </Button>
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
              <Button variant="ghost" className="w-full">
                Login
              </Button>
              <Button className="w-full gradient-accent border-0 text-white">
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
