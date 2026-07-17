import { BadgeCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { AccountMarketplace } from "@/components/account-marketplace"

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient light so the glass surfaces have something to refract */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-chart-2/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/4 translate-y-1/4 rounded-full bg-chart-4/20 blur-[150px]" />
      </div>

      <div className="pt-4">
        <SiteHeader />
      </div>

      <main>
        <AccountMarketplace />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-3 text-primary-foreground">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <span className="font-display font-bold tracking-tight">Travis Pay</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Travis Pay. Escrow-protected transfers.
          </p>
        </div>
      </footer>
    </div>
  )
}
