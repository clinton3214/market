'use client';

import { useState } from 'react';
import { Menu, X, ArrowUpRight, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

export default function Page() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

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
          <nav className="hidden lg:flex items-center gap-8">
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
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              Support
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
              <a href="#" className="text-muted-foreground hover:text-foreground transition py-2">
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
    </main>
  );
}
