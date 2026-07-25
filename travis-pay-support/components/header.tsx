'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      {/* Floating glassmorphic container */}
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-full">
          {/* Gradient glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-50 blur-3xl" />
          
          {/* Glass effect card */}
          <div className="relative backdrop-blur-xl bg-black/40 border border-white/20 px-6 md:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Brand */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  F
                </div>
                <span className="text-base font-bold text-white">Travis Pay</span>
              </div>

              {/* Desktop Logout */}
              <button className="hidden md:block text-gray-400 hover:text-white transition text-sm font-medium">
                Logout
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-gray-400 hover:text-white transition"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-4">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Gradient glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-50 blur-3xl" />
            
            {/* Glass menu */}
            <div className="relative backdrop-blur-xl bg-black/40 border border-white/20 p-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left text-gray-400 hover:text-white transition text-sm font-medium py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
