import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Clock, CheckCircle2, XCircle, AlertTriangle,
  Factory, Truck, Building2, Store, UserCheck, RefreshCw,
  ChevronDown, Lock, Unlock
} from 'lucide-react';

const ADMIN_KEY = 'medchain-admin-2026';

const ROLE_ICONS = {
  manufacturer: Factory,
  distributor: Truck,
  wholesaler: Building2,
  pharmacist: Store,
  customer: UserCheck,
};

const ROLE_COLORS = {
  manufacturer: 'bg-ink-forest/10 text-ink-forest border-ink-forest/30',
  distributor: 'bg-blue-100 text-blue-800 border-blue-300',
  wholesaler: 'bg-amber-100 text-amber-800 border-amber-300',
  pharmacist: 'bg-purple-100 text-purple-800 border-purple-300',
  customer: 'bg-ink-rust/10 text-ink-rust border-ink-rust/30',
};

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

function StatCard({ value, label, icon: Icon, color }) {
  return (
    <div className={`bg-paper-light border-2 rounded-xl p-4 flex items-center gap-4 ${color}`}>
      <div className="p-2.5 rounded-lg bg-white/60">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-serif text-2xl font-bold">{value}</div>
        <div className="text-xs font-mono uppercase tracking-wider opacity-70">{label}</div>
      </div>
    </div>
  );
}

export default function AdminView() {
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const headers = { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      const [uRes, sRes] = await Promise.all([
        fetch(`/api/admin/users?${params}`, { headers }),
        fetch('/api/admin/stats', { headers }),
      ]);
      const uData = await uRes.json();
      const sData = await sRes.json();
      setUsers(uData.users || []);
      setStats(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, statusFilter, roleFilter]);

  const handleLogin = () => {
    if (keyInput === ADMIN_KEY) {
      setAuthed(true);
      setKeyError('');
    } else {
      setKeyError('Invalid admin key. Try: medchain-admin-2026');
    }
  };

  const doAction = async (endpoint, userId) => {
    setActionLoading(userId + endpoint);
    setActionResult(null);
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: String(userId), admin_note: adminNote }),
      });
      const data = await res.json();
      setActionResult({ ok: res.ok, message: data.message || data.error, txHash: data.txHash });
      setSelectedUser(null);
      setAdminNote('');
      fetchData();
    } catch (e) {
      setActionResult({ ok: false, message: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  // --- Admin Login Screen ---
  if (!authed) {
    return (
      <div className="max-w-md mx-auto mt-20 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-ink-forest/10 border-2 border-ink-forest/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-ink-forest" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-ink-forest">Admin Portal</h2>
          <p className="text-sm text-ink-muted font-sans mt-1">Enter the admin key to manage user access requests.</p>
        </div>
        <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 shadow-ledger space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">Admin Key</label>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm font-mono focus:outline-none focus:border-ink-forest"
              placeholder="Enter admin key..."
            />
            {keyError && <p className="text-xs text-red-600 font-mono mt-1">{keyError}</p>}
          </div>
          <button onClick={handleLogin}
            className="w-full py-2.5 bg-ink-forest hover:bg-ink-forestDark text-white font-serif font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Login to Admin Portal
          </button>
        </div>
        <p className="text-center text-xs text-ink-muted font-mono">
          Demo key: <span className="text-ink-forest font-bold">medchain-admin-2026</span>
        </p>
      </div>
    );
  }

  // --- Admin Dashboard ---
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-paper-border pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-forest font-semibold">Admin Portal</span>
          <h2 className="font-serif text-3xl font-bold text-ink-forest mt-0.5">User Access Management</h2>
          <p className="text-sm text-ink-muted font-sans mt-0.5">
            Approve or reject role access requests. Approved roles are assigned on the MedChain smart contract.
          </p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-paper-border rounded-lg text-sm font-mono text-ink-muted hover:text-ink-forest hover:border-ink-forest transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Action Result Banner */}
      {actionResult && (
        <div className={`p-3.5 rounded-lg border flex items-center gap-3 text-sm font-mono ${actionResult.ok ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {actionResult.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <div>
            <p className="font-semibold">{actionResult.message}</p>
            {actionResult.txHash && <p className="text-xs opacity-70 mt-0.5">Tx: {actionResult.txHash}</p>}
          </div>
          <button onClick={() => setActionResult(null)} className="ml-auto text-current opacity-50 hover:opacity-100">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value={stats.total} label="Total Registrations" icon={Users} color="border-paper-border text-ink-forest" />
          <StatCard value={stats.pending} label="Pending Review" icon={Clock} color="border-amber-300 text-amber-800" />
          <StatCard value={stats.approved} label="Approved Users" icon={CheckCircle2} color="border-emerald-300 text-emerald-800" />
          <StatCard value={stats.rejected} label="Rejected" icon={XCircle} color="border-red-300 text-red-800" />
        </div>
      )}

      {/* Role Stats */}
      {stats?.byRole && (
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(stats.byRole).map(([role, count]) => {
            const Icon = ROLE_ICONS[role] || Users;
            return (
              <div key={role} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono ${ROLE_COLORS[role]}`}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="capitalize font-semibold">{role}</span>
                <span className="ml-auto font-bold">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-paper border border-paper-border rounded-lg p-1">
          {['all','pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-mono capitalize transition-all ${statusFilter === s ? 'bg-ink-forest text-white font-bold' : 'text-ink-muted hover:text-ink-forest'}`}>
              {s}
            </button>
          ))}
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 bg-paper border border-paper-border rounded-lg text-xs font-mono focus:outline-none focus:border-ink-forest">
          <option value="all">All Roles</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="customer">Customer</option>
        </select>
        <span className="text-xs font-mono text-ink-muted ml-auto">{users.length} results</span>
      </div>

      {/* Users Table */}
      <div className="bg-paper-light border-2 border-paper-border rounded-xl overflow-hidden shadow-ledger">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-paper-border mx-auto mb-3" />
            <p className="text-ink-muted font-mono text-sm">No user registrations found.</p>
          </div>
        ) : (
          <div className="divide-y divide-paper-border">
            {users.map(user => {
              const Icon = ROLE_ICONS[user.role] || Users;
              const isExpanded = selectedUser === user.id;
              const isActioning = actionLoading && actionLoading.includes(String(user.id));
              return (
                <div key={user.id} className="hover:bg-paper/60 transition-colors">
                  <div className="px-6 py-4 flex flex-wrap items-center gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-ink-forest/10 border border-ink-forest/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-ink-forest" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-ink-charcoal text-sm">{user.name}</p>
                        <p className="text-xs text-ink-muted font-sans truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Role badge */}
                    <div className={`px-2.5 py-1 rounded-full border text-xs font-mono font-semibold capitalize flex items-center gap-1.5 ${ROLE_COLORS[user.role]}`}>
                      <Icon className="w-3 h-3" />
                      {user.role}
                    </div>

                    {/* Status badge */}
                    <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold uppercase ${STATUS_STYLES[user.status]}`}>
                      {user.status}
                    </div>

                    {/* Date */}
                    <span className="text-xs font-mono text-ink-muted hidden sm:block">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>

                    {/* Expand button */}
                    <button onClick={() => setSelectedUser(isExpanded ? null : user.id)}
                      className="text-ink-muted hover:text-ink-forest transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 bg-paper/50 border-t border-paper-border space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-ink-muted uppercase block">Wallet Address</span>
                          <span className="font-bold text-ink-forest break-all">{user.wallet_address}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted uppercase block">Facility / Company</span>
                          <span className="font-semibold">{user.facility_name || '—'}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted uppercase block">License / Phone</span>
                          <span className="font-semibold">{user.license_number || user.contact_phone || '—'}</span>
                        </div>
                      </div>
                      {user.reason_for_access && (
                        <div className="text-xs font-sans text-ink-muted italic border-l-2 border-paper-border pl-3">
                          "{user.reason_for_access}"
                        </div>
                      )}
                      {user.admin_note && (
                        <div className="text-xs font-mono text-ink-muted">
                          <span className="uppercase font-semibold">Admin Note: </span>{user.admin_note}
                        </div>
                      )}

                      {/* Admin Note input */}
                      <div>
                        <label className="block text-xs font-mono uppercase text-ink-muted mb-1 font-semibold">Add Admin Note (optional)</label>
                        <input value={adminNote} onChange={e => setAdminNote(e.target.value)}
                          className="w-full px-3 py-1.5 bg-paper border border-paper-border rounded text-xs font-sans focus:outline-none focus:border-ink-forest"
                          placeholder="e.g. Verified license at CDSCO portal." />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {user.status !== 'approved' && (
                          <button onClick={() => doAction('approve', user.id)} disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-ink-forest hover:bg-ink-forestDark text-white text-xs font-mono font-bold rounded transition-all disabled:opacity-50">
                            <Unlock className="w-3 h-3" />
                            {isActioning ? 'Approving...' : 'Approve & Assign Role On-Chain'}
                          </button>
                        )}
                        {user.status === 'approved' && (
                          <button onClick={() => doAction('revoke', user.id)} disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-ink-rust hover:bg-ink-rustDark text-white text-xs font-mono font-bold rounded transition-all disabled:opacity-50">
                            <Lock className="w-3 h-3" />
                            {isActioning ? 'Revoking...' : 'Revoke Access'}
                          </button>
                        )}
                        {user.status === 'pending' && (
                          <button onClick={() => doAction('reject', user.id)} disabled={isActioning}
                            className="flex items-center gap-1.5 px-4 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-mono font-bold rounded transition-all disabled:opacity-50">
                            <XCircle className="w-3 h-3" />
                            {isActioning ? 'Rejecting...' : 'Reject Request'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
