'use client'

import React, { useEffect } from 'react'
import { 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  MessageSquare, 
  Radio, 
  Lock, 
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface WhatsAppLiquidModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToPlatform: (platform: string) => void
}

export function WhatsAppLiquidModal({
  isOpen,
  onClose,
  onSwitchToPlatform,
}: WhatsAppLiquidModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      {/* Blurred Liquid Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Liquid Glass Modal Surface */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-[#100d17]/90 p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(245,158,11,0.35),inset_0_2px_1px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.6)] backdrop-blur-3xl animate-in zoom-in-95 duration-200">
        
        {/* Curved liquid specular glare line */}
        <div 
          aria-hidden 
          className="pointer-events-none absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/40 via-amber-400/25 to-transparent [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"
        />

        {/* Liquid luminous orbs */}
        <div 
          aria-hidden 
          className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-amber-500/40 via-rose-500/25 to-transparent blur-3xl opacity-80 animate-pulse" 
          style={{ animationDuration: '5s' }}
        />
        <div 
          aria-hidden 
          className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-600/35 via-amber-600/20 to-transparent blur-3xl opacity-75 animate-pulse"
          style={{ animationDuration: '7s' }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-amber-300 bg-amber-500/15 border border-amber-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Route Restriction Notice
            </span>
          </div>

          {/* Heading */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/25 via-amber-600/15 to-transparent text-amber-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_25px_rgba(245,158,11,0.25)] backdrop-blur-xl">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 id="whatsapp-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                WhatsApp is Currently Unavailable
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Rentals for WhatsApp foreign numbers have been temporarily paused to safeguard our customers from non-delivery and immediate account bans.
              </p>
            </div>
          </div>

          {/* Smart Rationale Cards */}
          <div className="space-y-2.5 my-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md flex items-start gap-3">
              <Radio className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Global Carrier Filtering</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  WhatsApp’s anti-spam engine is automatically flagging shared VoIP routing blocks across all major SMS providers.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md flex items-start gap-3">
              <Lock className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Zero Charge Protection</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  We have locked checkout so you never spend money on a number that cannot successfully receive verification OTP codes.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md flex items-start gap-3">
              <RefreshCw className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Dedicated SIM Route Upgrades</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  Our telecommunications partners are provisioning dedicated, non-VoIP physical SIM gateways. WhatsApp will be re-enabled once reliability hits 100%.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onSwitchToPlatform('Telegram')
                onClose()
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_25px_rgba(14,165,233,0.35)] backdrop-blur-md transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Switch to Telegram (99.8% Success Rate)</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-center"
              >
                Choose Another App
              </button>

              <Link
                href="/support?subject=WhatsApp%20Number%20Inquiry"
                className="flex-1 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all text-center inline-flex items-center justify-center gap-1.5"
              >
                <span>Contact Support</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
