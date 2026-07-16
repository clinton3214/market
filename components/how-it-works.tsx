import { MousePointerClick, CreditCard, Rocket, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: MousePointerClick,
    title: 'Choose Account',
    text: 'Browse vetted listings and pick the account that fits your goals.',
  },
  {
    icon: CreditCard,
    title: 'Pay Securely',
    text: 'Checkout with escrow-backed, encrypted payment protection.',
  },
  {
    icon: Rocket,
    title: 'Get Instant Access',
    text: 'Credentials and ownership transfer land in your inbox instantly.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-12 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
          From browse to ownership in three simple steps.
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-center">
        {steps.map((step, i) => (
          <div key={step.title} className="flex flex-1 items-center gap-6">
            <div className="flex-1 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent text-white">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">
                <span className="mr-2 text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden h-6 w-6 shrink-0 text-muted-foreground lg:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
