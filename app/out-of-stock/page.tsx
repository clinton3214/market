import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { AlertCircle } from 'lucide-react';

export default function OutOfStockPage({
  searchParams,
}: {
  searchParams: { platform?: string };
}) {
  const platform = searchParams.platform || 'facebook';
  
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col items-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="pt-4 w-full">
        <SiteHeader />
      </div>

      <main className="flex-1 flex items-center justify-center w-full px-4 pt-24 pb-12">
        <div className="bg-white/[0.04] border border-white/10 p-8 rounded-3xl backdrop-blur-xl text-center max-w-md w-full shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">Item Unavailable</h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Sorry, this account was just sold or is currently reserved by another buyer. Please check out our other available accounts.
          </p>
          <Link
            href={`/accounts?platform=${platform}`}
            className="block w-full bg-gradient-to-r from-primary to-chart-4 text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Browse Other Accounts
          </Link>
        </div>
      </main>
    </div>
  );
}
