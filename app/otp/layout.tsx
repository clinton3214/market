import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'

export default function OtpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <SiteFooter />
    </div>
  )
}
