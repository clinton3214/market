'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Send, Paperclip, Smile, User, CheckCircle2, RefreshCw, LogOut, Menu, X } from 'lucide-react'
import { TravisPayLogo } from '@/components/travis-pay-logo'

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  createdAt: string
}

export default function SupportPage() {
  const [sessionId, setSessionId] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [emailInput, setEmailInput] = useState<string>('')
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize or retrieve Session ID and Email
  useEffect(() => {
    let existingSession = localStorage.getItem('tp_support_session_id')
    if (!existingSession) {
      existingSession = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem('tp_support_session_id', existingSession)
    }
    setSessionId(existingSession)

    const savedEmail = localStorage.getItem('tp_support_email') || ''
    setUserEmail(savedEmail)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messages from backend API
  const fetchMessages = useCallback(async () => {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/support?sessionId=${sessionId}`)
      const data = await res.json()

      if (data.messages) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id || m._id,
            text: m.text,
            sender: m.sender,
            createdAt: m.createdAt,
          }))
        )
      }
      if (data.conversation?.userEmail && !userEmail) {
        setUserEmail(data.conversation.userEmail)
        localStorage.setItem('tp_support_email', data.conversation.userEmail)
      }
    } catch (err) {
      console.error('Failed to fetch support messages:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId, userEmail])

  // Initial fetch and 3s polling
  useEffect(() => {
    if (!sessionId) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [sessionId, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      // Ignore
    }
    localStorage.removeItem('tp_support_session_id')
    localStorage.removeItem('tp_support_email')
    window.location.href = '/'
  }

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailInput.trim()) {
      setUserEmail(emailInput.trim())
      localStorage.setItem('tp_support_email', emailInput.trim())
      setShowEmailModal(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || sending) return

    const textToSend = inputValue.trim()
    setInputValue('')
    setSending(true)

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: 'opt_' + Date.now(),
      text: textToSend,
      sender: 'user',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userEmail,
          text: textToSend,
        }),
      })
      const data = await res.json()
      if (data.message) {
        fetchMessages()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      {/* Clean Header - Only Logo & Logout */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                <TravisPayLogo className="h-6 w-auto" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">Travis Pay Support</span>
            </Link>

            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setOpenMenu((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
            >
              {openMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu Content */}
          {openMenu && (
            <div className="mt-2 rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl md:hidden flex flex-col gap-2 shadow-2xl">
              <button
                onClick={handleLogout}
                className="flex w-full justify-center items-center gap-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-24 pb-6 flex flex-col h-[calc(100vh-20px)]">
        {/* Chat Messages Box */}
        <div className="flex-1 glass-effect rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Support Banner Info */}
          <div className="p-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  Customer Assistance
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    Online
                  </span>
                </h2>
                <p className="text-slate-400 text-xs">
                  {userEmail ? (
                    <span className="flex items-center gap-1 text-slate-300">
                      <User size={12} /> {userEmail}
                    </span>
                  ) : (
                    'Ask us anything about your social account purchases'
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEmailModal(true)}
              className="text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <User size={14} />
              {userEmail ? 'Edit Email' : 'Add Email'}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {loading && messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
                <RefreshCw size={18} className="animate-spin text-purple-400" />
                Connecting to live support...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-purple-400" />
                </div>
                <p className="font-semibold text-slate-200">How can we help you today?</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Send a message below and our support team will reply immediately.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-200 ${
                      message.sender === 'user'
                        ? 'bg-purple-600/30 border-purple-400/30 text-white rounded-br-xs shadow-lg shadow-purple-950/40'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-100 rounded-bl-xs shadow-lg shadow-black/40'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    <span className="text-[10px] mt-1.5 block opacity-60 text-right">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Pill Glass Input matching design screenshot */}
          <div className="p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="relative flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-purple-950/60 border border-purple-500/30 rounded-full p-1.5 sm:p-2 px-3 sm:px-5 shadow-[0_10px_30px_rgba(147,51,234,0.15)] transition-all focus-within:border-purple-400/60 focus-within:ring-2 focus-within:ring-purple-500/20">
              
              {/* Attachment Icon */}
              <button type="button" className="hidden sm:block text-slate-400 hover:text-purple-300 transition-colors p-1 shrink-0">
                <Paperclip size={18} />
              </button>

              {/* Emoji Icon */}
              <button type="button" className="hidden sm:block text-slate-400 hover:text-purple-300 transition-colors p-1 shrink-0">
                <Smile size={18} />
              </button>

              {/* Capsule Input Field */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-w-0 bg-slate-900/60 border border-white/10 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/40 transition-all"
              />

              {/* Circular Gradient Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sending}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-purple-700 hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-purple-500/40 shrink-0"
              >
                <Send size={16} className="translate-x-0.5 sm:hidden" />
                <Send size={18} className="translate-x-0.5 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Email Identification Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in">
            <h3 className="text-lg font-bold text-white mb-2">Identify Your Account</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your email address so our support agents can find your account details and follow up.
            </p>
            <form onSubmit={handleSaveEmail} className="space-y-4">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                  Save Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
