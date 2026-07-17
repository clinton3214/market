'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { Field } from '@/components/auth/field'

const passwordRules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
  { label: 'One uppercase', test: (v: string) => /[A-Z]/.test(v) },
]

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Get started"
      title="Create your account"
      subtitle="Start buying and selling vetted accounts in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Field
          id="name"
          label="Full name"
          placeholder="Travis Scott"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="size-4" />}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="size-4" />}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="size-4" />}
        />

        <ul className="-mt-1 flex flex-wrap gap-2">
          {passwordRules.map(({ label, test }) => {
            const ok = test(password)
            return (
              <li
                key={label}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  ok
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-white/10 bg-white/5 text-muted-foreground'
                }`}
              >
                <Check className={`size-3 ${ok ? 'opacity-100' : 'opacity-40'}`} />
                {label}
              </li>
            )
          })}
        </ul>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            required
            className="mt-0.5 size-4 rounded border-white/20 bg-white/5 accent-primary"
          />
          <span>
            I agree to the{' '}
            <Link href="#" className="text-primary hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-sm">
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>
    </AuthShell>
  )
}
