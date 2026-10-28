'use client'

import React from 'react'
import { 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  X, 
  ExternalLink,
  MessageSquare,
  Lock,
  Radio
} from 'lucide-react'

interface WhatsAppLiquidWarningProps {
  onSwitchToPlatform?: (platform: string) => void
  onDismiss?: () => void
  onOpenSelector?: () => void
}

export function WhatsAppLiquidWarning({
  onSwitchToPlatform,
  onDismiss,
  onOpenSelector,
}: WhatsAppLiquidWarningProps) {
  return (
    <div className="whatsapp-liquid-warning relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-[#120f18]/85 p-5 sm:p-7 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.25),inset_0_1.5px_1px_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
      {/* Liquid specular sheen highlight across the curved top/edge */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl p-[1px] bg-gradient-to-br from-white/35 via-amber-400/20 to-transparent [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"
      />

      {/* Floating fluid liquid light orbs animating gently in background */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute -top-16 -left-12 h-44 w-44 rounded-full bg-gradient-to-br from-amber-500/35 to-rose-500/20 blur-3xl opacity-80 animate-pulse" 
        style={{ animationDuration: '6s' }}
      />
      <div 
        aria-hidden 
        className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-gradient-to-tr from-purple-600/30 via-amber-600/20 to-transparent blur-3xl opacity-70 animate-pulse"
        style={{ animationDuration: '8s' }}
      />

      {/* Subtle liquid surface refraction mesh */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.18),transparent_70%)]"
      />

      {/* Close button if dismissible */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss warning"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative z-10">
        {/* Header Pill & Title */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase text-amber-300 bg-amber-500/15 border border-amber-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_0_15px_rgba(245,158,11,0.25)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Route Offline • WhatsApp Unavailable
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Wallet Protection Active
          </span>
        </div>

        {/* Title and main alert summary */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex-shrink-0 mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent text-amber-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_20px_rgba(245,158,11,0.2)] backdrop-blur-xl">
            <AlertTriangle className="h-5 w-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              WhatsApp Numbers Currently Unavailable
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-zinc-300/90 leading-relaxed max-w-2xl">
              We have temporarily paused virtual number rentals for <strong className="text-amber-200 font-semibold">WhatsApp</strong> to prevent you from being charged for numbers that fail activation. Here is why we paused it and what you can do right now:
            </p>
          </div>
        </div>

        {/* Smart Diagnostic Cards in Liquid Glass */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {/* Card 1: Carrier Filtration */}
          <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-lg transition-all hover:bg-white/[0.06] hover:border-white/20">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1.5">
              <Radio className="h-3.5 w-3.5 text-amber-400" />
              <span>Anti-VoIP Filter Spike</span>
            </div>
            <p className="text-[12px] text-zinc-300/80 leading-normal">
              WhatsApp’s security systems are actively blocking shared virtual telecom ranges globally, causing instant SMS timeouts.
            </p>
          </div>

          {/* Card 2: Consumer Protection */}
          <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-lg transition-all hover:bg-white/[0.06] hover:border-white/20">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Loss Guarantee</span>
            </div>
            <p className="text-[12px] text-zinc-300/80 leading-normal">
              Rather than letting you pay for a dead number and wait for refunds, we proactively freeze checkouts until high-reputation pools arrive.
            </p>
          </div>

          {/* Card 3: Route Recovery */}
          <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-lg transition-all hover:bg-white/[0.06] hover:border-white/20">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold mb-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
              <span>Dedicated SIM Routing</span>
            </div>
            <p className="text-[12px] text-zinc-300/80 leading-normal">
              Our infrastructure team is integrating private, non-VoIP physical SIM pools with verified 100% code delivery rates.
            </p>
          </div>
        </div>

        {/* Smart Alternatives & Action Area */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span>
              Recommended live alternative: <strong className="text-white font-semibold">Telegram</strong> (99.8% instant delivery).
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToPlatform && (
              <button
                type="button"
                onClick={() => onSwitchToPlatform('Telegram')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(14,165,233,0.35)] backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Switch to Telegram</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            )}

            {onOpenSelector && (
              <button
                type="button"
                onClick={onOpenSelector}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition-all hover:text-white"
              >
                <span>Browse Other Apps</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
