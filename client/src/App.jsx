import React, { useState, useEffect } from 'react';
import LedgerSidebar from './components/LedgerSidebar';
import VerifyView from './views/VerifyView';
import RegisterView from './views/RegisterView';
import CustodyView from './views/CustodyView';
import TrustLedgerView from './views/TrustLedgerView';
import ReportView from './views/ReportView';
import AdminView from './views/AdminView';
import UserRegistrationView from './views/UserRegistrationView';
import { Factory, Truck, Building2, Store, UserCheck } from 'lucide-react';

const ROLE_META = {
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
  const [currentTab, setTab] = useState('verify');
  const [activeRole, setActiveRole] = useState('manufacturer');
  const [prefilledBatch, setPrefilledBatch] = useState('');
  const [roleChanged, setRoleChanged] = useState(false);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setRoleChanged(true);
    setTimeout(() => setRoleChanged(false), 1800);
  };

  const navigateToReport = (batchNum) => {
    setPrefilledBatch(batchNum);
    setTab('report');
  };

  const meta = ROLE_META[activeRole] || ROLE_META.customer;
  const RoleIcon = meta.Icon;

  return (
    <div className="flex h-screen w-screen overflow-hidden paper-grain">
      {/* Ledger-Spine Sidebar */}
      <LedgerSidebar
        currentTab={currentTab}
        setTab={setTab}
        activeRole={activeRole}
        setActiveRole={handleRoleChange}
      />

      {/* Main Content Ledger Folio */}
      <main className="flex-1 h-full overflow-y-auto relative">

        {/* ── Active Persona Banner ── */}
        <div
          className={`sticky top-0 z-20 border-b-2 transition-all duration-300 ${
            roleChanged
              ? 'border-ink-gold bg-ink-gold/10 shadow-md'
              : `border-paper-border bg-paper-light/95 ${meta.color.includes('border') ? '' : ''}`
          } backdrop-blur-sm`}
        >
          <div className="px-6 md:px-10 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Animated dot */}
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot} ${roleChanged ? 'animate-ping' : ''}`} />
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-semibold transition-all ${meta.color}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                <span>Active Persona: {meta.label}</span>
              </div>
              <span className="hidden lg:block text-[11px] text-ink-muted font-sans italic">
                {meta.description}
              </span>
            </div>

            {/* Quick-switch persona buttons */}
            <div className="flex items-center gap-1.5 bg-paper border border-paper-border rounded-lg p-1">
              <span className="text-[10px] font-mono text-ink-muted px-1.5 uppercase font-semibold">Switch:</span>
              {Object.entries(ROLE_META).map(([roleKey, rMeta]) => {
                const isActive = activeRole === roleKey;
                const IconComp = rMeta.Icon;
                return (
                  <button
                    key={roleKey}
                    onClick={() => handleRoleChange(roleKey)}
                    title={rMeta.description}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-ink-forest text-white font-bold shadow-sm'
                        : 'text-ink-muted hover:text-ink-forest hover:bg-paper-dark'
                    }`}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{rMeta.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subtle decorative watermark */}
        <div className="pointer-events-none fixed bottom-6 right-8 opacity-5 font-serif text-8xl font-black text-ink-forest select-none">
          MEDCHAIN
        </div>

        {/* Page content — admin tabs render full-width without top padding wrapper */}
        {currentTab === 'admin' ? (
          <div className="p-6 md:p-10">
            <AdminView />
          </div>
        ) : currentTab === 'user-register' ? (
          <UserRegistrationView onRegistered={() => setTab('verify')} />
        ) : (
          <div className="p-6 md:p-10">
            {currentTab === 'verify' && (
              <VerifyView onNavigateToReport={navigateToReport} activeRole={activeRole} />
            )}
            {currentTab === 'register' && (
              <RegisterView onBatchRegistered={() => setTab('custody')} activeRole={activeRole} />
            )}
            {currentTab === 'custody' && (
              <CustodyView activeRole={activeRole} setActiveRole={handleRoleChange} />
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
