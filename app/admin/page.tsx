'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ArrowUpRight, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { TravisPayLogo } from '@/components/travis-pay-logo';

type Account = {
  id: string;
  _id?: string;
  platform: string;
  handle: string;
  followers: string;
  price: number;
  status: string;
  credentials?: {
    accountEmail?: string;
    emailPassword?: string;
    accountUsername?: string;
    accountPassword?: string;
    twoFactorAuth?: string;
    backupCode?: string;
  };
  description?: string;
};

export default function AdminDashboard() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    platform: 'instagram',
    handle: '',
    followers: '',
    price: '',
    accountEmail: '',
    emailPassword: '',
    accountUsername: '',
    accountPassword: '',
    twoFactorAuth: '',
    backupCode: '',
    description: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/admin/listings');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setAccounts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id || account._id || null);
    setFormData({
      platform: account.platform,
      handle: account.handle,
      followers: account.followers,
      price: account.price.toString(),
      accountEmail: account.credentials?.accountEmail || '',
      emailPassword: account.credentials?.emailPassword || '',
      accountUsername: account.credentials?.accountUsername || '',
      accountPassword: account.credentials?.accountPassword || '',
      twoFactorAuth: account.credentials?.twoFactorAuth || '',
      backupCode: account.credentials?.backupCode || '',
      description: account.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ platform: 'instagram', handle: '', followers: '', price: '', accountEmail: '', emailPassword: '', accountUsername: '', accountPassword: '', twoFactorAuth: '', backupCode: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newListing = {
        platform: formData.platform.toLowerCase(),
        handle: formData.handle,
        followers: formData.followers,
        price: Number(formData.price),
        description: formData.description,
        status: 'available',
        verified: true,
        credentials: {
          accountEmail: formData.accountEmail,
          emailPassword: formData.emailPassword,
          accountUsername: formData.accountUsername || formData.handle,
          accountPassword: formData.accountPassword,
          twoFactorAuth: formData.twoFactorAuth,
          backupCode: formData.backupCode,
        },
      };

      let res;
      if (editingId) {
        res = await fetch('/api/admin/listings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: editingId, ...newListing }),
        });
      } else {
        res = await fetch('/api/admin/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newListing),
        });
      }

      if (res.ok) {
        closeModal();
        fetchListings();
      }
    } catch (err) {
      console.error('Failed to add listing', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await fetch(`/api/admin/listings?id=${id}`, { method: 'DELETE' });
        fetchListings();
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/admin/login';
  };

  const filteredAccounts = activeFilter === 'all' 
    ? accounts 
    : activeFilter === 'sold'
    ? accounts.filter(a => a.status === 'sold')
    : accounts.filter((a) => a.platform.toLowerCase() === activeFilter && a.status !== 'sold');

  const totalRevenue = accounts.filter(a => a.status === 'sold').reduce((sum, a) => sum + (a.price || 0), 0);
  const activeCount = accounts.filter(a => a.status === 'available').length;
  const soldCount = accounts.filter(a => a.status === 'sold').length;

  return (
    <main className="min-h-screen bg-background">
      {/* Floating Header */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <TravisPayLogo className="h-6 w-auto" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">Travis Pay</span>
              <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">Admin</span>
            </div>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:text-destructive/80 transition">Logout</button>
            </nav>

            <button
              type="button"
              onClick={() => setIsHeaderExpanded((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isHeaderExpanded}
            >
              {isHeaderExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isHeaderExpanded && (
            <div className="mt-2 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-xl md:hidden">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsHeaderExpanded(false);
                    handleLogout();
                  }}
                  className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-secondary"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-secondary/40 border border-border rounded-2xl p-6 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-foreground">{accounts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/40 border border-border rounded-2xl p-6 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                    ₦{totalRevenue.toLocaleString()}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-status-green" />
              </div>
            </div>

            <div className="bg-secondary/40 border border-border rounded-2xl p-6 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-foreground">{activeCount}</p>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">Available</span>
              </div>
            </div>

            <div className="bg-secondary/40 border border-border rounded-2xl p-6 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Sold</p>
                  <p className="text-3xl font-bold text-chart-2">{soldCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Account Inventory</h2>
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData({ platform: 'instagram', handle: '', followers: '', price: '', accountEmail: '', emailPassword: '', accountUsername: '', accountPassword: '', twoFactorAuth: '', backupCode: '', description: '' });
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-primary to-chart-4 text-primary-foreground px-6 py-2 rounded-full hover:opacity-90 transition-all text-sm font-semibold"
              >
                + Add Account
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'instagram', 'facebook', 'x', 'sold'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Accounts Grid */}
            {isLoading ? (
              <div className="text-center text-muted-foreground py-10 animate-pulse">Loading listings...</div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 bg-secondary/20 rounded-2xl border border-border">No accounts found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-secondary/30 border border-border rounded-2xl p-6 transition-all relative overflow-hidden group"
                  >
                    {account.status === 'sold' && (
                       <div className="absolute top-4 right-4 bg-chart-4/20 text-chart-4 text-xs font-bold px-2 py-1 rounded">SOLD</div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1 uppercase tracking-wider">{account.platform}</p>
                        <h3 className="text-foreground font-semibold">{account.handle}</h3>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-muted-foreground">{account.followers} followers</p>
                      <p className="text-lg font-bold text-primary">₦{account.price.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <button onClick={() => handleEdit(account)} className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(account.id)} className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">{editingId ? 'Edit Account' : 'Add New Account'}</h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Platform</label>
                  <select 
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="x">X</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Handle</label>
                  <input
                    required
                    value={formData.handle}
                    onChange={(e) => setFormData({...formData, handle: e.target.value})}
                    type="text"
                    placeholder="@username"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Followers (e.g. 10.5K)</label>
                  <input
                    required
                    value={formData.followers}
                    onChange={(e) => setFormData({...formData, followers: e.target.value})}
                    type="text"
                    placeholder="10K"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Price (NGN)</label>
                  <input
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    type="number"
                    placeholder="500"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter a brief description of the account..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <hr className="border-border my-6" />
              <h4 className="font-semibold text-chart-4 mb-4">Secure Credentials (Hidden from public)</h4>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Original Email</label>
                  <input
                    value={formData.accountEmail}
                    onChange={(e) => setFormData({...formData, accountEmail: e.target.value})}
                    type="email"
                    placeholder="owner@gmail.com"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email Password</label>
                  <input
                    value={formData.emailPassword}
                    onChange={(e) => setFormData({...formData, emailPassword: e.target.value})}
                    type="text"
                    placeholder="SecretEmailPass123"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Account Username / Login</label>
                  <input
                    value={formData.accountUsername}
                    onChange={(e) => setFormData({...formData, accountUsername: e.target.value})}
                    type="text"
                    placeholder="username (leave blank to use handle)"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Account Password</label>
                  <input
                    value={formData.accountPassword}
                    onChange={(e) => setFormData({...formData, accountPassword: e.target.value})}
                    type="text"
                    placeholder="AccountPass456"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">2FA String</label>
                  <input
                    value={formData.twoFactorAuth}
                    onChange={(e) => setFormData({...formData, twoFactorAuth: e.target.value})}
                    type="text"
                    placeholder="2FA Auth String"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Paste 2FA string to <a href="https://2fa.live" target="_blank" rel="noreferrer" className="text-primary hover:underline">2fa.live</a> to get 6 digit code. This string is only seen by the buyer after payment and is not part of the public information.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Backup Code</label>
                  <input
                    value={formData.backupCode}
                    onChange={(e) => setFormData({...formData, backupCode: e.target.value})}
                    type="text"
                    placeholder="8-digit backup code"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground mt-1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-3 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-chart-4 text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 transition"
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
