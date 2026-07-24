"use client"

import { useState } from "react"
import Link from "next/link"
import { BadgeCheck, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Instagram", href: "#listings" },
  { label: "Facebook", href: "#listings" },
  { label: "X", href: "#listings" },
  { label: "Telegram", href: "#listings" },
  { label: "How It Works", href: "#listings" },
  { label: "Support", href: "#listings" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent">
              <BadgeCheck className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">Travis Pay</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="mt-2 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-xl md:hidden">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
