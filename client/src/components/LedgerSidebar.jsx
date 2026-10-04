import React from 'react';
import { 
  BookOpen, 
  SearchCheck, 
  PlusCircle, 
  ArrowRightLeft, 
  ShieldAlert, 
  Award, 
  ShieldCheck,
  UserPlus,
  LogOut,
  User,
  Factory,
  Truck,
  Building2,
  Store,
  UserCheck
} from 'lucide-react';

const ROLE_PERMITTED_TABS = {
  admin: ['verify', 'register', 'custody', 'trust', 'report', 'admin'],
  manufacturer: ['verify', 'register', 'custody', 'trust'],
  distributor: ['verify', 'custody', 'trust'],
  wholesaler: ['verify', 'custody', 'trust'],
  pharmacist: ['verify', 'custody', 'report', 'trust'],
  customer: ['verify', 'report'],
};

const ROLE_ICONS = {
  admin: ShieldCheck,
  manufacturer: Factory,
  distributor: Truck,
  wholesaler: Building2,
  pharmacist: Store,
  customer: UserCheck,
};

const ALL_CHAPTERS = [
  { id: 'verify', label: 'Verify Batch', icon: SearchCheck, tag: 'Chapter I', desc: 'Scan & verify authenticity' },
  { id: 'register', label: 'Register Batch', icon: PlusCircle, tag: 'Chapter II', desc: 'Manufacturer batch entry' },
  { id: 'custody', label: 'Custody Handoff', icon: ArrowRightLeft, tag: 'Chapter III', desc: 'Station transfers & logs' },
  { id: 'trust', label: 'Trust Scores', icon: Award, tag: 'Chapter IV', desc: 'Dynamic node reputation' },
  { id: 'report', label: 'Report Incident', icon: ShieldAlert, tag: 'Chapter V', desc: 'Crowdsourced tamper alerts' },
  { id: 'admin', label: 'Admin Portal', icon: ShieldCheck, tag: 'Admin', desc: 'User role approval & access' },
];

export default function LedgerSidebar({ currentTab, setTab, currentUser, onLogout }) {
  const userRole = (currentUser?.role || 'customer').toLowerCase();
  const allowedTabs = ROLE_PERMITTED_TABS[userRole] || ['verify'];
  const visibleChapters = ALL_CHAPTERS.filter(ch => allowedTabs.includes(ch.id));

  const RoleIcon = ROLE_ICONS[userRole] || User;

  return (
    <aside className="w-72 bg-[#17261C] text-[#E8E4D8] border-r-4 border-[#C29B38]/60 flex flex-col justify-between shadow-2xl relative select-none">
      {/* Book spine decorative gold embossing */}
      <div className="absolute top-0 bottom-0 left-1.5 w-1 bg-gradient-to-b from-[#C29B38]/40 via-[#C29B38]/80 to-[#C29B38]/40 pointer-events-none" />

      {/* Top Header / Book Title */}
      <div className="p-6 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C29B38]/20 border border-[#C29B38]/60 flex items-center justify-center text-[#C29B38] shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-wide text-[#FAF8F5] leading-none">
              MEDCHAIN
            </h1>
            <span className="font-mono text-[10px] tracking-widest text-[#C29B38] uppercase font-semibold">
              APOTHECARY LEDGER
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#A3B3A7] font-sans leading-relaxed">
          Tamper-proof pharmaceutical batch registry anchored on Ethereum blockchain.
        </p>
      </div>

      {/* Chapter Navigation / Spine ribbons */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-[#A3B3A7]/70 flex items-center justify-between">
          <span>Permitted Chapters</span>
          <span className="text-[#C29B38] font-bold capitalize">{userRole}</span>
        </div>

        {visibleChapters.map((chapter) => {
          const Icon = chapter.icon;
          const isActive = currentTab === chapter.id;
          return (
            <button
              key={chapter.id}
              onClick={() => setTab(chapter.id)}
              className={`w-full group text-left px-3.5 py-3 rounded-md transition-all flex items-center gap-3 relative ${
                isActive
                  ? 'bg-[#243F2D] text-[#FAF8F5] border-l-4 border-[#C29B38] shadow-md font-semibold'
                  : 'text-[#C5D1C7] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#C29B38]' : 'text-[#879B8C] group-hover:text-white'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm tracking-wide block truncate">
                    {chapter.label}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                    {chapter.tag}
                  </span>
                </div>
                <span className="text-[11px] font-sans text-[#97A79B] block truncate leading-tight">
                  {chapter.desc}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Authenticated User Station Card & Logout Footer */}
      <div className="p-4 bg-[#121F16] border-t border-white/10 space-y-3">
        {/* User Station Identity */}
        <div className="p-3 rounded-lg bg-[#1C3323] border border-[#C29B38]/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#C29B38] font-bold flex items-center gap-1.5">
              <RoleIcon className="w-3.5 h-3.5 text-[#C29B38]" />
              <span className="capitalize">{currentUser?.role || 'Guest'} Station</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="font-serif text-sm font-bold text-white truncate">
            {currentUser?.name || 'Authorized Operator'}
          </div>

          {currentUser?.facility_name && (
            <div className="text-[11px] text-[#A3B3A7] truncate font-sans">
              {currentUser.facility_name}
            </div>
          )}

          {currentUser?.wallet_address && (
            <div className="text-[9px] font-mono text-[#879B8C] truncate mt-1">
              {currentUser.wallet_address.slice(0, 10)}...{currentUser.wallet_address.slice(-6)}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded border border-white/15 bg-white/5 hover:bg-red-950/40 hover:border-red-500/50 hover:text-red-200 text-xs font-mono text-[#C5D1C7] flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Station (Logout)</span>
        </button>

        {/* Live Network Pill */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#A3B3A7]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Hardhat (31337)</span>
          </div>
          <span className="text-[#C29B38]">Supabase Connected</span>
        </div>
      </div>
    </aside>
  );
}
