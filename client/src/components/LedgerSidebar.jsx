import React from 'react';
import { 
  BookOpen, 
  SearchCheck, 
  PlusCircle, 
  ArrowRightLeft, 
  ShieldAlert, 
  Award, 
  Layers,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export default function LedgerSidebar({ currentTab, setTab, activeRole, setActiveRole }) {
  const chapters = [
    { id: 'verify', label: 'Verify Batch', icon: SearchCheck, tag: 'Chapter I', desc: 'Scan & verify authenticity' },
    { id: 'register', label: 'Register Batch', icon: PlusCircle, tag: 'Chapter II', desc: 'Manufacturer batch entry' },
    { id: 'custody', label: 'Custody Handoff', icon: ArrowRightLeft, tag: 'Chapter III', desc: 'Station transfers & logs' },
    { id: 'trust', label: 'Trust Scores', icon: Award, tag: 'Chapter IV', desc: 'Dynamic node reputation' },
    { id: 'report', label: 'Report Incident', icon: ShieldAlert, tag: 'Chapter V', desc: 'Crowdsourced tamper alerts' },
  ];

  const adminChapters = [
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck, tag: 'Admin', desc: 'Approve & manage users' },
    { id: 'user-register', label: 'Request Access', icon: UserPlus, tag: 'Access', desc: 'Register your account' },
  ];

  const roles = [
    { id: 'manufacturer', label: 'Manufacturer' },
    { id: 'distributor', label: 'Distributor' },
    { id: 'wholesaler', label: 'Wholesaler' },
    { id: 'pharmacist', label: 'Pharmacist' },
    { id: 'customer', label: 'Customer' },
  ];

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
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-[#A3B3A7]/70">
          Ledger Chapters
        </div>

        {chapters.map((chapter) => {
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

        {/* Admin & Access section */}
        <div className="px-3 pt-4 pb-2 text-[10px] uppercase font-mono tracking-wider text-[#C29B38]/70 border-t border-white/10 mt-3">
          Management
        </div>
        {adminChapters.map((chapter) => {
          const Icon = chapter.icon;
          const isActive = currentTab === chapter.id;
          return (
            <button
              key={chapter.id}
              onClick={() => setTab(chapter.id)}
              className={`w-full group text-left px-3.5 py-3 rounded-md transition-all flex items-center gap-3 relative ${
                isActive
                  ? 'bg-[#2A1F10] text-[#FAF8F5] border-l-4 border-[#C29B38] shadow-md font-semibold'
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

      {/* Role Switcher & On-Chain Status footer */}
      <div className="p-4 bg-[#121F16] border-t border-white/10 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-[#C29B38] mb-1.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" /> Active Persona
            </span>
            <span className="text-[9px] text-[#879B8C]">(Demo Switch)</span>
          </div>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="w-full bg-[#1C3323] text-white border border-[#C29B38]/40 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#C29B38]"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Live Network Pill */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#A3B3A7]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hardhat Local (31337)</span>
          </div>
          <span className="text-[#C29B38]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
