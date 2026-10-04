import React, { useState, useEffect } from 'react';
import LedgerSidebar from './components/LedgerSidebar';
import VerifyView from './views/VerifyView';
import RegisterView from './views/RegisterView';
import CustodyView from './views/CustodyView';
import TrustLedgerView from './views/TrustLedgerView';
import ReportView from './views/ReportView';
import AdminView from './views/AdminView';
import UserRegistrationView from './views/UserRegistrationView';
import LoginView from './views/LoginView';
import { 
  Factory, Truck, Building2, Store, UserCheck, ShieldCheck, 
  LogOut, User, Shield
} from 'lucide-react';

const ROLE_META = {
  admin: {
    label: 'System Administrator',
    Icon: ShieldCheck,
    color: 'bg-amber-900/10 border-amber-600/40 text-amber-900',
    dot: 'bg-amber-600',
    description: 'Network supervisor — verifies user access requests and assigns roles on-chain.',
  },
  manufacturer: {
    label: 'Manufacturer',
    Icon: Factory,
    color: 'bg-ink-forest/10 border-ink-forest/40 text-ink-forest',
    dot: 'bg-ink-forest',
    description: 'Registered batch producer — can mint new batch anchors on-chain.',
  },
  distributor: {
    label: 'Distributor',
    Icon: Truck,
    color: 'bg-blue-900/10 border-blue-700/40 text-blue-900',
    dot: 'bg-blue-700',
    description: 'Cold-chain logistics node — accepts custody from Manufacturer, transfers to Wholesaler.',
  },
  wholesaler: {
    label: 'Wholesaler',
    Icon: Building2,
    color: 'bg-amber-900/10 border-amber-700/40 text-amber-900',
    dot: 'bg-amber-600',
    description: 'Regional bulk supplier — accepts from Distributor, transfers to Pharmacist.',
  },
  pharmacist: {
    label: 'Pharmacist',
    Icon: Store,
    color: 'bg-purple-900/10 border-purple-700/40 text-purple-900',
    dot: 'bg-purple-700',
    description: 'Licensed dispenser — accepts from Wholesaler, dispenses to Customer. Can flag suspicious batches.',
  },
  customer: {
    label: 'Customer / Patient',
    Icon: UserCheck,
    color: 'bg-ink-rust/10 border-ink-rust/40 text-ink-rust',
    dot: 'bg-ink-rust',
    description: 'End recipient — scans QR codes to verify authenticity and report tamper indicators.',
  },
};

export default function App() {
  // Load authenticated user from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medchain_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentTab, setTab] = useState('verify');
  const [prefilledBatch, setPrefilledBatch] = useState('');

  // When user logs in, set active tab to their role's primary workspace
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('medchain_user', JSON.stringify(user));
      if (token) localStorage.setItem('medchain_token', token);
    } catch (e) {}

    const r = (user.role || '').toLowerCase();
    if (r === 'admin') setTab('admin');
    else if (r === 'manufacturer') setTab('register');
    else if (r === 'distributor' || r === 'wholesaler') setTab('custody');
    else if (r === 'pharmacist') setTab('custody');
    else setTab('verify');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('medchain_user');
      localStorage.removeItem('medchain_token');
    } catch (e) {}
    setAuthView('login');
    setTab('verify');
  };

  const navigateToReport = (batchNum) => {
    setPrefilledBatch(batchNum);
    setTab('report');
  };

  // --- 1. NOT LOGGED IN: Render Login or Registration Portal ---
  if (!currentUser) {
    if (authView === 'register') {
      return (
        <UserRegistrationView
          onNavigateToLogin={() => setAuthView('login')}
          onRegistered={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthView('register')}
      />
    );
  }

  // --- 2. AUTHENTICATED: Render Protected Ledger ---
  const activeRole = (currentUser.role || 'customer').toLowerCase();
  const meta = ROLE_META[activeRole] || ROLE_META.customer;
  const RoleIcon = meta.Icon;

  return (
    <div className="flex h-screen w-screen overflow-hidden paper-grain">
      {/* Ledger-Spine Sidebar (Features filtered to user's permitted role) */}
      <LedgerSidebar
        currentTab={currentTab}
        setTab={setTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Ledger Folio */}
      <main className="flex-1 h-full overflow-y-auto relative">

        {/* ── Authenticated Station Identity Bar ── */}
        <div className="sticky top-0 z-20 border-b-2 border-paper-border bg-paper-light/95 backdrop-blur-sm">
          <div className="px-6 md:px-10 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold ${meta.color}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>Station: {meta.label}</span>
              </div>
              <span className="font-serif text-sm font-bold text-ink-forest">
                {currentUser.name}
              </span>
              {currentUser.facility_name && (
                <span className="hidden lg:block text-[11px] text-ink-muted font-sans italic border-l border-paper-border pl-2.5">
                  {currentUser.facility_name}
                </span>
              )}
            </div>

            {/* Logout / Switch Station Button */}
            <div className="flex items-center gap-2">
              {currentUser.wallet_address && (
                <span className="text-[10px] font-mono text-ink-muted hidden sm:block bg-paper px-2 py-1 rounded border border-paper-border">
                  Wallet: {currentUser.wallet_address.slice(0, 6)}...{currentUser.wallet_address.slice(-4)}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1 rounded border border-paper-border bg-paper hover:bg-red-50 hover:border-red-300 hover:text-red-800 text-xs font-mono text-ink-muted transition-all"
                title="Log out and return to the station sign-in portal"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch Station</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle decorative watermark */}
        <div className="pointer-events-none fixed bottom-6 right-8 opacity-5 font-serif text-8xl font-black text-ink-forest select-none">
          MEDCHAIN
        </div>

        {/* Protected View Switcher */}
        {currentTab === 'admin' ? (
          <div className="p-6 md:p-10">
            <AdminView />
          </div>
        ) : (
          <div className="p-6 md:p-10">
            {currentTab === 'verify' && (
              <VerifyView onNavigateToReport={navigateToReport} activeRole={activeRole} />
            )}
            {currentTab === 'register' && (
              <RegisterView onBatchRegistered={() => setTab('custody')} activeRole={activeRole} />
            )}
            {currentTab === 'custody' && (
              <CustodyView activeRole={activeRole} />
            )}
            {currentTab === 'trust' && (
              <TrustLedgerView />
            )}
            {currentTab === 'report' && (
              <ReportView
                prefilledBatch={prefilledBatch}
                activeRole={activeRole}
                onReportFiled={() => {}}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
