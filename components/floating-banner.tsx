"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function FloatingBanner() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 w-[90%] max-w-sm">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-purple-600/90 p-4 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl text-white">
        <p className="text-sm font-medium leading-tight">
          Tap the cards to reveal their content
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
