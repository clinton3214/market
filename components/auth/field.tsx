'use client'

import { useState, type ComponentProps, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type FieldProps = ComponentProps<'input'> & {
  label: string
  icon?: ReactNode
  labelAction?: ReactNode
}

export function Field({
  label,
  icon,
  labelAction,
  id,
  type = 'text',
  className,
  ...props
}: FieldProps) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground/90">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={resolvedType}
          className={cn(
            'h-11 w-full rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur',
            'transition-colors outline-none focus-visible:border-ring focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring/40',
            icon ? 'pl-10' : 'pl-3.5',
            isPassword ? 'pr-10' : 'pr-3.5',
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
