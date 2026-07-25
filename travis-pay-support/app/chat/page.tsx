'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can we assist you today?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      text: 'I have a question about my account verification',
      sender: 'user',
      timestamp: new Date(Date.now() - 4 * 60000),
    },
    {
      id: '3',
      text: 'No problem! I&apos;d be happy to help. Can you provide me with more details about what you need?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 3 * 60000),
    },
    {
      id: '4',
      text: 'Sure! I submitted my documents but haven&apos;t received confirmation yet.',
      sender: 'user',
      timestamp: new Date(Date.now() - 2 * 60000),
    },
    {
      id: '5',
      text: 'Let me check that for you. Can you provide your account email?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 60000),
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      }

      setMessages([...messages, newMessage])
      setInputValue('')

      // Simulate admin response
      setTimeout(() => {
        const adminResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thanks for your message! Our team will get back to you shortly.',
          sender: 'admin',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, adminResponse])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Travis Pay Support</h1>
              <p className="text-slate-400 text-sm">24/7 Live Support</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-300 hover:text-white transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                  message.sender === 'user'
                    ? 'bg-black/40 border-white/20 text-white shadow-lg hover:shadow-black/50'
                    : 'bg-gradient-to-br from-purple-500/30 to-blue-500/20 border-purple-400/30 text-slate-50 shadow-lg hover:shadow-purple-500/20'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className="text-xs mt-2 block opacity-60">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 backdrop-blur-md bg-black/40 p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 backdrop-blur-sm transition-all"
            />
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-3 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Response time: Usually within 5 minutes
          </p>
        </div>
      </main>
    </div>
  )
}
