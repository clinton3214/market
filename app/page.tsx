import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Categories } from '@/components/categories'
import { FeaturedAccounts } from '@/components/featured-accounts'
import { HowItWorks } from '@/components/how-it-works'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <FeaturedAccounts />
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  )
}
