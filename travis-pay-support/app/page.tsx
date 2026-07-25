'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/header'
import ChatContainer from '@/components/chat-container'

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <ChatContainer />
    </main>
  )
}
