'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Verification State
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  useEffect(() => {
    // Check if we were redirected from login for verification
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const verifyEmailParam = params.get('verifyEmail')
      if (verifyEmailParam) {
        setEmail(verifyEmailParam)
        setStep('verify')
        setResendTimer(60) // Assuming a new code was just sent
        // Clean up the URL
        window.history.replaceState({}, '', '/signup')
      }
    }
  }, [])

  async function handleSignupSubmit(e: React.FormEvent) {
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
        setStep('verify')
        setResendTimer(60) // Start 60s countdown
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code')
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return
    setError('')
    
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to resend')
      } else {
        setResendTimer(60)
      }
    } catch (err) {
      setError('Network error')
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  if (step === 'verify') {
    return (
      <AuthShell
        badge="Verify your email"
        title="Enter the 6-digit code"
        subtitle="We sent a verification code to your inbox. Enter it below to confirm your account."
        footer={
          <div className="flex flex-col gap-4 items-center w-full">
            <div className="text-sm text-muted-foreground">
              Didn't get a code?{' '}
              {resendTimer > 0 ? (
                <span className="text-white/60">Resend in {resendTimer}s</span>
              ) : (
                <button onClick={handleResend} className="font-medium text-primary hover:underline">
                  Resend now
                </button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Wrong address?{' '}
              <button onClick={() => setStep('form')} className="font-medium text-primary hover:underline">
                Go back
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleVerifySubmit} className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center size-12 rounded-full bg-white/5 border border-white/10 mb-2">
            <Mail className="size-6 text-primary" />
          </div>
          
          {error && <p className="text-sm text-red-500 w-full text-center">{error}</p>}
          
          <div className="flex gap-2 justify-center w-full">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                className="w-12 h-12 text-center text-xl font-semibold bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                autoComplete="off"
              />
            ))}
          </div>

          <Button type="submit" size="lg" disabled={loading || code.join('').length !== 6} className="h-11 w-full text-sm mt-2">
            {loading ? 'Verifying…' : 'Verify email'}
            {!loading && <ArrowRight className="size-4" />}
          </Button>
        </form>
      </AuthShell>
    )
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
      <form onSubmit={handleSignupSubmit} className="flex flex-col gap-5">
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
