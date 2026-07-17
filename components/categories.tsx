import { ArrowUpRight } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/brand-icons'

const categories = [
  {
    name: 'Instagram',
    label: 'Aesthetic & niche pages ready to scale',
    count: '1,240 accounts',
    Icon: InstagramIcon,
    glow: 'group-hover:shadow-[0_0_60px_-12px_rgba(168,85,247,0.55)]',
  },
  {
    name: 'Facebook',
    label: 'Pages, groups & aged profiles',
    count: '860 accounts',
    Icon: FacebookIcon,
    glow: 'group-hover:shadow-[0_0_60px_-12px_rgba(59,130,246,0.55)]',
  },
  {
    name: 'X',
    label: 'Verified handles & engaged audiences',
    count: '520 accounts',
    Icon: XIcon,
    glow: 'group-hover:shadow-[0_0_60px_-12px_rgba(148,163,184,0.45)]',
  },
]

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Shop by platform
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
          Hand-vetted accounts across the platforms that matter most.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href="/accounts"
            className={`group glass-card flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${cat.glow}`}
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary/70 text-foreground">
                <cat.Icon className="h-6 w-6" />
              </span>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-semibold">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.label}</p>
              <p className="mt-4 text-sm font-medium gradient-text">
                {cat.count}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
