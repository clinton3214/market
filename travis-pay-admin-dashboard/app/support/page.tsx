'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Send, Paperclip, Smile, Search, User, MessageSquare, Clock, RefreshCw, CheckCircle2, Shield, LogOut } from 'lucide-react';
import { MAIN_APP_API_URL } from '@/lib/constants';

interface Conversation {
  id: string;
  sessionId: string;
  userEmail?: string;
  userName?: string;
  status: 'open' | 'closed';
  lastMessageAt: string;
  lastMessageText?: string;
  unreadCountAdmin: number;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: string;
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch list of conversations from main app API
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${MAIN_APP_API_URL}/api/admin/support`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!activeConversationId && data.conversations.length > 0) {
          setActiveConversationId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [activeConversationId]);

  // Fetch active conversation messages
  const fetchActiveMessages = useCallback(async () => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`${MAIN_APP_API_URL}/api/admin/support/${activeConversationId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id || m._id,
            text: m.text,
            sender: m.sender,
            createdAt: m.createdAt,
          }))
        );
      }
      if (data.conversation) {
        setActiveConversation(data.conversation);
      }
    } catch (err) {
      console.error(`Failed to fetch messages for conversation ${activeConversationId}:`, err);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversationId]);

  // Initial load and 3s polling for conversation list
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Load and poll active conversation messages
  useEffect(() => {
    if (!activeConversationId) return;
    setLoadingMessages(true);
    fetchActiveMessages();
    const interval = setInterval(fetchActiveMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId, fetchActiveMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    window.location.href = '/';
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeConversationId || sendingReply) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setSendingReply(true);

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: 'opt_' + Date.now(),
      text: textToSend,
      sender: 'admin',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`${MAIN_APP_API_URL}/api/admin/support/${activeConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });
      const data = await res.json();
      if (data.message) {
        fetchActiveMessages();
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.userEmail && c.userEmail.toLowerCase().includes(query)) ||
      (c.userName && c.userName.toLowerCase().includes(query)) ||
      (c.sessionId && c.sessionId.toLowerCase().includes(query)) ||
      (c.lastMessageText && c.lastMessageText.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen bg-background text-foreground pt-20 pb-8 px-4 flex flex-col font-sans">
      {/* Clean Header - Title & Logout only */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-7xl mx-auto glass-header glass-shine rounded-full py-3 px-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-travis-purple to-travis-purple-dark rounded-full flex items-center justify-center shadow-lg shadow-travis-purple/30">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-base">Travis Pay Admin</span>
              <span className="ml-1 text-xs bg-travis-purple/20 text-travis-purple border border-travis-purple/30 px-2.5 py-0.5 rounded-full font-medium">
                Support Workspace
              </span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Support Workspace */}
      <div className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] mt-4">
        {/* Left Pane: Conversations List */}
        <div className="lg:col-span-5 glass-effect rounded-2xl border border-border p-4 flex flex-col h-full overflow-hidden shadow-xl">
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-travis-purple" />
                Conversations
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                {conversations.length} total
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user or email..."
                className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-travis-purple"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingConversations && conversations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-travis-purple" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <MessageSquare className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium">No support tickets found</p>
                <p className="text-xs mt-1">User inquiries will show up here automatically.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const displayName = conv.userEmail || conv.userName || `Guest (${conv.sessionId.slice(0, 8)})`;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 relative group flex items-start justify-between gap-3 ${
                      isActive
                        ? 'bg-travis-purple/15 border-travis-purple/40 text-foreground shadow-lg shadow-travis-purple/10'
                        : 'bg-card/40 border-border/60 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-travis-purple" />
                          {displayName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-relaxed">
                        {conv.lastMessageText || 'No messages yet'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {conv.unreadCountAdmin > 0 && (
                        <span className="bg-travis-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          {conv.unreadCountAdmin} new
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Chat View */}
        <div className="lg:col-span-7 glass-effect rounded-2xl border border-border p-4 flex flex-col h-full overflow-hidden shadow-xl">
          {activeConversationId ? (
            <>
              {/* Chat Header */}
              <div className="pb-3 border-b border-border flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                    {activeConversation?.userEmail || activeConversation?.userName || 'User Conversation'}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({activeConversation?.sessionId})
                    </span>
                  </h3>
                  <p className="text-xs text-status-green flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Active Ticket
                  </p>
                </div>
                <button
                  onClick={fetchActiveMessages}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition"
                  title="Refresh chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Chat History Box */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/20 rounded-xl border border-border/40">
                {loadingMessages && messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-travis-purple" />
                    Loading chat messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No messages in this ticket yet.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed border transition-all ${
                          m.sender === 'admin'
                            ? 'bg-travis-purple text-white border-travis-purple/40 rounded-br-xs shadow-md shadow-travis-purple/20'
                            : 'bg-secondary text-foreground border-border rounded-bl-xs shadow-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <span className="text-[10px] opacity-70 mt-1.5 block text-right">
                          {new Date(m.createdAt).toLocaleTimeString([], {
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
              <div className="mt-4 pt-2">
                <div className="relative flex items-center gap-3 bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-purple-950/60 border border-purple-500/30 rounded-full p-2 px-5 shadow-[0_10px_30px_rgba(147,51,234,0.15)] transition-all focus-within:border-purple-400/60 focus-within:ring-2 focus-within:ring-purple-500/20">
                  
                  {/* Attachment Icon */}
                  <button type="button" className="text-muted-foreground hover:text-travis-purple transition-colors p-1">
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Emoji Icon */}
                  <button type="button" className="text-muted-foreground hover:text-travis-purple transition-colors p-1">
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Capsule Input Field */}
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-900/60 border border-white/10 rounded-full px-5 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-travis-purple/40 transition-all"
                  />

                  {/* Circular Gradient Send Button */}
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 via-travis-purple to-travis-purple-dark hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-travis-purple/40 shrink-0"
                  >
                    <Send className="w-4 h-4 translate-x-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-base font-semibold text-foreground">Select a conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a conversation from the left pane to view message history and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
