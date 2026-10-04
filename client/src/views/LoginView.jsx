import React, { useState } from 'react';
import {
  BookOpen, ShieldCheck, Factory, Truck, Building2, Store, UserCheck,
  ArrowRight, Key, Mail, Lock, AlertCircle, Clock, Sparkles
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    role: 'manufacturer',
    name: 'Apex Pharma Labs',
    email: 'manufacturer@apexpharma.com',
    label: 'Manufacturer',
    Icon: Factory,
    color: 'hover:border-ink-forest hover:bg-ink-forest/5 text-ink-forest',
    desc: 'Mint new medicine batches & generate QR anchors',
  },
  {
    role: 'distributor',
    name: 'NorthStar Logistics',
    email: 'distributor@northstar.com',
    label: 'Distributor',
    Icon: Truck,
    color: 'hover:border-blue-700 hover:bg-blue-50 text-blue-900',
    desc: 'Cold-chain transit & batch custody handoffs',
  },
  {
    role: 'wholesaler',
    name: 'Metro Drug Wholesale',
    email: 'wholesaler@metrodrug.com',
    label: 'Wholesaler',
    Icon: Building2,
    color: 'hover:border-amber-700 hover:bg-amber-50 text-amber-900',
    desc: 'Bulk inventory supply to licensed pharmacies',
  },
  {
    role: 'pharmacist',
    name: 'St. Jude Community Pharmacy',
    email: 'pharmacist@stjude.org',
    label: 'Pharmacist',
    Icon: Store,
    color: 'hover:border-purple-700 hover:bg-purple-50 text-purple-900',
    desc: 'Patient dispensing & incident tamper reporting',
  },
  {
    role: 'customer',
    name: 'Aarav Patel (Patient)',
    email: 'customer@patient.com',
    label: 'Customer / Patient',
    Icon: UserCheck,
    color: 'hover:border-ink-rust hover:bg-ink-rust/5 text-ink-rust',
    desc: 'QR verification, passport trails & tamper flags',
  },
  {
    role: 'admin',
    name: 'Network Administrator',
    email: 'admin@medchain.io',
    label: 'System Admin',
    Icon: ShieldCheck,
    color: 'hover:border-[#C29B38] hover:bg-amber-50 text-[#9E731C]',
    desc: 'Review, approve & grant on-chain user roles',
  },
];

export default function LoginView({ onLoginSuccess, onNavigateToRegister }) {
  const [identifier, setIdentifier] = useState('manufacturer@apexpharma.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingNotice, setPendingNotice] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingNotice(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.status === 'pending') {
          setPendingNotice(data);
          return;
        }
        throw new Error(data.error || 'Failed to authenticate');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (preset) => {
    setLoading(true);
    setError(null);
    setPendingNotice(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: preset.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-paper paper-grain relative select-none">
      {/* Background Decorative Gold Watermark */}
      <div className="pointer-events-none fixed top-10 right-12 opacity-5 font-serif text-9xl font-black text-ink-forest select-none">
        MEDCHAIN
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Brand Story & Apothecary Aesthetics */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-ink-forest/10 border border-ink-forest/20 text-xs font-mono text-ink-forest font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Ethereum Blockchain • v1.0.0</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink-forest tracking-tight">
              MedChain
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-gold font-bold">
              Pharmaceutical Trust & Custody Ledger
            </p>
          </div>

          <p className="text-sm text-ink-muted font-sans leading-relaxed">
            A decentralized supply chain portal that authenticates medicines, prevents counterfeit distribution, and enforces cryptographic chain-of-custody across all participants.
          </p>

          <div className="pt-4 border-t border-paper-border/80 hidden lg:block space-y-2 text-xs font-mono text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-gold" />
              <span>Strict Role-Based Cryptographic Access (RBAC)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-gold" />
              <span>Keccak256 Verification & Dynamic Trust Scoring</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-gold" />
              <span>Camera QR Code Scanning with Animated Ink Stamps</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-7 bg-paper-light border-2 border-paper-border rounded-2xl p-6 sm:p-8 shadow-ledger space-y-6">
          <div className="border-b border-paper-border pb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-forest font-semibold block">
              SECURE ACCESS GATEWAY
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink-forest mt-0.5">
              Sign In to Your Station
            </h2>
            <p className="text-xs text-ink-muted font-sans mt-0.5">
              Enter your credentials or choose a certified persona below.
            </p>
          </div>

          {/* Pending Approval Notice */}
          {pendingNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-mono space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Clock className="w-4 h-4 animate-spin" />
                <span>ACCESS PENDING ADMIN APPROVAL</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your request for <strong>{pendingNotice.user?.name}</strong> ({pendingNotice.user?.role}) is awaiting review by the MedChain Administrator.
              </p>
              <div className="text-[10px] text-amber-700 italic pt-1 border-t border-amber-200">
                Log in as <strong>System Admin</strong> with one click below to review and approve this request.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Email Address or Ethereum Wallet
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. manufacturer@apexpharma.com or 0x..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-xs font-mono focus:outline-none focus:border-ink-forest transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Station Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-xs font-mono focus:outline-none focus:border-ink-forest transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-ink-forest hover:bg-ink-forestDark text-paper-light font-serif font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="font-mono text-xs">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Station</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Fast One-Click Persona Login (Evaluator & Demo Convenience) */}
          <div className="pt-4 border-t border-paper-border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-gold font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> One-Click Role Authentication (Demo)
              </span>
              <span className="text-[10px] text-ink-muted font-mono">(Examiner Presets)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_PRESETS.map((p) => {
                const Icon = p.Icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(p)}
                    title={p.desc}
                    className={`p-2.5 rounded-lg border border-paper-border bg-paper text-left transition-all hover:shadow-sm ${p.color}`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs font-serif">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-muted block truncate mt-0.5">
                      {p.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registration Link */}
          <div className="pt-3 border-t border-paper-border/60 flex items-center justify-between text-xs font-mono">
            <span className="text-ink-muted">Don't have a station ID?</span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-ink-forest font-bold hover:underline flex items-center gap-1"
            >
              <span>Request Role Access</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
