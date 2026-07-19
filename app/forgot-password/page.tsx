'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { Field } from '@/components/auth/field'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell
        badge="Check your email"
        title="Password reset link sent"
        subtitle="If an account exists for that email, we've sent a password reset link. Please check your inbox for the most recent link."
        footer={
          <>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Return to login
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent an email to <span className="font-medium text-white">{email}</span>.
            It contains a magic link that will let you reset your password.
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      badge="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email address and we will send you a link to reset your password."
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <Field
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="size-4" />}
        />

        <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-sm">
          {loading ? 'Sending link…' : 'Send reset link'}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>
    </AuthShell>
  )
}
