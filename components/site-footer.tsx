import { ShieldCheck } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/brand-icons'

const quickLinks = [
  { label: 'Instagram', href: '#categories' },
  { label: 'Facebook', href: '#categories' },
  { label: 'X', href: '#categories' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Support', href: '#support' },
]

const socials = [
  { label: 'Instagram', Icon: InstagramIcon, href: '#' },
  { label: 'Facebook', Icon: FacebookIcon, href: '#' },
  { label: 'X', Icon: XIcon, href: '#' },
]

export function SiteFooter() {
  return (
    <footer id="support" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent">
                <ShieldCheck className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Travis Pay
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The secure marketplace for buying and selling established social
              media accounts.
            </p>
          </div>

          {/* Quick links */}
          <nav className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">Follow us</h3>
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Travis Pay. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
