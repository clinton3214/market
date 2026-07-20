import type { ReactNode } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'

type AuthShellProps = {
  title: string
  subtitle: string
  badge?: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, subtitle, badge, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-10">
      {/* atmospheric background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[18%] top-[12%] size-[26rem] rounded-full bg-primary/40 blur-[120px] transform-gpu" />
        <div className="absolute bottom-[10%] right-[18%] size-[28rem] rounded-full bg-accent/30 blur-[130px] transform-gpu" />
        <div className="absolute left-1/2 top-1/2 size-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[110px] transform-gpu" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(to right, oklch(1 0 0 / 8%) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 8%) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          }}
        />
      </div>

      {/* glass card */}
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              href="/"
              className="mb-6 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur"
            >
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="size-3.5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Travis Pay</span>
            </Link>

            {badge && (
              <span className="mb-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {badge}
              </span>
            )}

            <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </main>
  )
}
