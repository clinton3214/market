'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import ChatBubble from './chat-bubble'

interface Message {
  id: string
  text: string
  isSender: boolean
  timestamp: string
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isSender: false,
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'Hi! I have a question about my account.',
      isSender: true,
      timestamp: '10:31 AM',
    },
    {
      id: '3',
      text: 'Of course! I\'d be happy to help. What\'s your question?',
      isSender: false,
      timestamp: '10:32 AM',
    },
    {
      id: '4',
      text: 'I\'m having trouble resetting my password. Can you assist?',
      isSender: true,
      timestamp: '10:33 AM',
    },
    {
      id: '5',
      text: 'Absolutely! Let me guide you through the reset process step by step.',
      isSender: false,
      timestamp: '10:34 AM',
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
        isSender: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      setMessages([...messages, newMessage])
      setInputValue('')

      // Simulate admin response
      setTimeout(() => {
        const adminResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thanks for your message! I\'m looking into this for you.',
          isSender: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
        setMessages((prev) => [...prev, adminResponse])
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen flex flex-col pt-24 pb-6">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-2">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              isSender={message.isSender}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Chat input area */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-6 z-40">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-full">
            {/* Gradient glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-50 blur-3xl" />
            
            {/* Glass effect card */}
            <div className="relative backdrop-blur-xl bg-black/40 border border-white/20 px-6 py-4">
              <div className="flex gap-3 items-center">
                {/* Attachment and emoji buttons */}
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white flex-shrink-0"
                    aria-label="Add attachment"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white flex-shrink-0"
                    aria-label="Add emoji"
                  >
                    <Smile size={18} />
                  </button>
                </div>

                {/* Input field */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-white/30 transition text-sm"
                />

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all active:scale-95 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
