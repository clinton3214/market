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
    <header className="fixed top-4 inset-x-0 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-card/40 px-4 py-2.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:px-6">
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-3 text-primary-foreground">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Travis Pay</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav
          className="mt-2 flex flex-col gap-1 rounded-3xl border border-white/10 bg-card/60 p-3 backdrop-blur-xl lg:hidden"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
