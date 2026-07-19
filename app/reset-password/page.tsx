'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/components/auth/auth-shell'
import { Field } from '@/components/auth/field'

const passwordRules = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
  { label: 'One uppercase', test: (v: string) => /[A-Z]/.test(v) },
]

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-green-500 mb-4 font-medium">Password has been reset successfully!</p>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-6 text-red-500 text-sm">
        Invalid or missing reset token. Please request a new password reset link.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <Field
        id="password"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
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

      <Button type="submit" size="lg" disabled={loading} className="h-11 w-full text-sm">
        {loading ? 'Resetting…' : 'Reset password'}
        {!loading && <ArrowRight className="size-4" />}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      badge="Secure your account"
      title="Create new password"
      subtitle="Please enter your new password below."
      footer={
        <>
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-center text-sm text-muted-foreground py-6">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
