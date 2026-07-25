'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Edit2, Trash2, Eye, EyeOff, MessageSquare, XCircle } from 'lucide-react';

export default function Page() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let lastChecked = Date.now();
    const fetchMessages = async () => {
      try {
        const MAIN_APP_API_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
        const response = await fetch(`${MAIN_APP_API_URL}/api/admin/support`);
        if (!response.ok) return;
        const data = await response.json();
        
        if (data.conversations) {
          let newNotifs: any[] = [];
          data.conversations.forEach((conv: any) => {
            const msgTime = new Date(conv.lastMessageAt || conv.createdAt).getTime();
            // If message is newer than lastChecked and sent by user
            if (msgTime > lastChecked && conv.lastMessageSender !== 'admin') {
              newNotifs.push({
                id: 'notif_' + Math.random(),
                email: conv.userEmail || 'User',
                text: conv.lastMessageText || 'New message received',
              });
            }
          });
          
          if (newNotifs.length > 0) {
            setNotifications(prev => [...prev, ...newNotifs]);
            lastChecked = Date.now();
          }
        }
      } catch (err) {
        console.error('Failed to fetch admin support:', err);
      }
    };
    
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const togglePassword = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const accounts = [
    {
      id: '1',
      platform: 'Instagram',
      handle: '@aesthetic.vibes',
      followers: '125K',
      price: '$2,499',
      verified: true,
      password: 'pass123secure',
      email: 'account@mail.com',
    },
    {
      id: '2',
      platform: 'Facebook',
      handle: 'Community Leaders',
      followers: '89K',
      price: '$1,899',
      verified: true,
      password: 'fbpass456',
      email: 'fb@mail.com',
    },
    {
      id: '3',
      platform: 'X',
      handle: '@influencer_hub',
      followers: '42K',
      price: '$999',
      verified: true,
      password: 'xpass789',
      email: 'x@mail.com',
    },
  ];

  const filteredAccounts = activeFilter === 'all' ? accounts : accounts.filter((a) => a.platform.toLowerCase() === activeFilter);

  return (
    <main className="min-h-screen bg-background">
      {/* Floating Header */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-7xl mx-auto glass-header glass-shine rounded-full py-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-travis-purple to-travis-purple-dark rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm3.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">Travis Pay</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              Instagram
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              Facebook
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              X
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              How it Works
            </a>
            
            {/* Floating Support Chat Notification Bell */}
            <a
              href="/support"
              className="relative flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400/60 rounded-full px-4 py-2 text-foreground transition-all duration-300 shadow-lg shadow-purple-950/40 group"
              title="Support Desk"
            >
              <svg className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="font-bold text-white text-sm">Support</span>
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse absolute -top-1 -right-1 shadow-md shadow-purple-500/50" />
            </a>

            <button className="text-destructive hover:text-destructive/80 transition">Logout</button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            className="lg:hidden text-foreground hover:text-muted-foreground transition"
          >
            {isHeaderExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isHeaderExpanded && (
          <div className="lg:hidden mt-2 glass-effect rounded-2xl p-4 animate-in">
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition py-2">
                Instagram
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition py-2">
                Facebook
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition py-2">
                X
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition py-2">
                How it Works
              </a>
              <a href="/support" className="text-muted-foreground hover:text-foreground transition py-2">
                Support
              </a>
              <button className="text-destructive hover:text-destructive/80 transition py-2 text-left">Logout</button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="glass-effect glass-shine rounded-2xl p-6 hover:glow-purple transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Online Visitors</p>
                  <p className="text-3xl font-bold text-foreground">2,847</p>
                </div>
                <div className="w-3 h-3 bg-status-green rounded-full animate-pulse" />
              </div>
            </div>

            <div className="glass-effect glass-shine rounded-2xl p-6 hover:glow-purple transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-travis-purple to-travis-purple-dark bg-clip-text text-transparent">
                    $24,591
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-status-green" />
              </div>
            </div>

            <div className="glass-effect glass-shine rounded-2xl p-6 hover:glow-purple transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-foreground">48</p>
                </div>
                <span className="text-xs bg-travis-purple/20 text-travis-purple px-3 py-1 rounded-full">+12 this week</span>
              </div>
            </div>
          </div>

          {/* Accounts Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Account Inventory</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-travis-purple to-travis-purple-dark text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-travis-purple/50 transition-all text-sm font-semibold"
              >
                Add Account
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'instagram', 'facebook', 'x'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter
                      ? 'bg-travis-purple text-white'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="glass-effect glass-shine rounded-2xl p-6 hover:glow-purple transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{account.platform}</p>
                      <h3 className="text-foreground font-semibold">{account.handle}</h3>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-travis-purple transition opacity-0 group-hover:opacity-100" />
                  </div>

                  <p className="text-sm text-muted-foreground mb-1">{account.followers} followers</p>
                  <p className="text-lg font-bold text-travis-purple mb-4">{account.price}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Log */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Sales & Delivery Log</h2>
            <div className="glass-effect glass-shine rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { customer: 'Alex Johnson', account: 'Instagram - @vibes', amount: '$2,499', status: 'Delivered' },
                      { customer: 'Sarah Chen', account: 'Facebook - Community', amount: '$1,899', status: 'Delivered' },
                      { customer: 'Mike Davis', account: 'X - @influencer', amount: '$999', status: 'Pending' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-secondary/30 transition">
                        <td className="px-6 py-4 text-sm text-foreground">{row.customer}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{row.account}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-travis-purple">{row.amount}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === 'Delivered'
                                ? 'bg-status-green/20 text-status-green'
                                : 'bg-status-yellow/20 text-status-yellow'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-travis-purple hover:text-travis-purple-dark transition font-medium">Resend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-effect glass-shine rounded-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto animate-in">
            <h3 className="text-2xl font-bold text-foreground mb-6">Add Account</h3>

            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Platform</label>
                <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground mt-1 focus:outline-none focus:border-travis-purple">
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>X</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground mt-1 focus:outline-none focus:border-travis-purple"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Price</label>
                <input
                  type="text"
                  placeholder="$0.00"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground mt-1 focus:outline-none focus:border-travis-purple"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword['modal'] ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground mt-1 focus:outline-none focus:border-travis-purple pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('modal')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword['modal'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-travis-purple to-travis-purple-dark text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-travis-purple/50 transition"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="glass-effect glass-shine border border-purple-500/30 rounded-2xl p-4 shadow-[0_10px_30px_rgba(147,51,234,0.2)] flex items-start gap-4 animate-in slide-in-from-right-8 fade-in max-w-sm backdrop-blur-xl bg-slate-900/80">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm mb-1">New Message from {notif.email}</h4>
              <p className="text-slate-300 text-xs line-clamp-2">{notif.text}</p>
              <a href="/support" className="text-[10px] text-purple-400 hover:text-purple-300 mt-2 inline-block font-medium">View Conversation &rarr;</a>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} className="text-slate-400 hover:text-white transition-colors shrink-0">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
