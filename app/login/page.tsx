'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { Field } from '@/components/auth/field'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.isVerified === false && data.email) {
          router.push(`/signup?verifyEmail=${encodeURIComponent(data.email)}`)
        } else {
          setError(data.error || 'Something went wrong')
        }
      } else {
        setUser(data.user)
        router.push('/')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in to Travis Pay"
      subtitle="Manage your listings and orders in one place."
      footer={
        <>
          New to Travis Pay?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-sm text-red-500">{error}</p>}
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
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="size-4" />}
          labelAction={
            <Link href="#" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          }
        />

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-white/5 accent-primary"
          />
          Keep me signed in
        </label>

        <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-sm">
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>
    </AuthShell>
  )
}
