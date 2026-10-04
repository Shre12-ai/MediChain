import React, { useState } from 'react';
import {
  Factory, Truck, Building2, Store, UserCheck,
  ArrowRight, CheckCircle2, Clock, AlertTriangle, X
} from 'lucide-react';

const ROLES = [
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    Icon: Factory,
    color: 'border-ink-forest bg-ink-forest/5',
    activeColor: 'border-ink-forest bg-ink-forest text-white',
    description: 'Register new medicine batches on blockchain with cryptographic QR anchors.',
    features: ['Register new batches', 'Generate QR labels', 'Initiate custody chain'],
  },
  {
    id: 'distributor',
    label: 'Distributor',
    Icon: Truck,
    color: 'border-blue-700 bg-blue-50',
    activeColor: 'border-blue-700 bg-blue-700 text-white',
    description: 'Cold-chain logistics operator. Receive from manufacturers and ship to wholesalers.',
    features: ['Accept custody from Manufacturer', 'Transfer to Wholesaler', 'Log inspection notes'],
  },
  {
    id: 'wholesaler',
    label: 'Wholesaler',
    Icon: Building2,
    color: 'border-amber-600 bg-amber-50',
    activeColor: 'border-amber-600 bg-amber-600 text-white',
    description: 'Regional drug wholesale supplier. Manages bulk inventory between distributors and pharmacies.',
    features: ['Accept custody from Distributor', 'Transfer to Pharmacist', 'Bulk inspection records'],
  },
  {
    id: 'pharmacist',
    label: 'Pharmacist',
    Icon: Store,
    color: 'border-purple-700 bg-purple-50',
    activeColor: 'border-purple-700 bg-purple-700 text-white',
    description: 'Licensed community pharmacy. Dispenses medicines and can flag suspicious batches.',
    features: ['Accept from Wholesaler', 'Dispense to Customer', 'Flag suspicious batches'],
  },
  {
    id: 'customer',
    label: 'Customer / Patient',
    Icon: UserCheck,
    color: 'border-ink-rust bg-ink-rust/5',
    activeColor: 'border-ink-rust bg-ink-rust text-white',
    description: 'End recipient. Scan QR codes to verify medicine authenticity and report tamper indicators.',
    features: ['Verify QR codes', 'View batch passport trail', 'Report suspicious packaging'],
  },
];

export default function UserRegistrationView({ onRegistered }) {
  const [step, setStep] = useState(1); // 1=role selection, 2=details form, 3=success
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    wallet_address: '',
    facility_name: '',
    license_number: '',
    contact_phone: '',
    reason_for_access: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-paper paper-grain flex items-start justify-center pt-12 pb-10 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-ink-forest/10 border border-ink-forest/20 rounded-full px-4 py-1.5 text-xs font-mono text-ink-forest font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-ink-forest animate-pulse" />
            MedChain — Supply Chain Access Portal
          </div>
          <h1 className="font-serif text-4xl font-bold text-ink-forest">Request Access</h1>
          <p className="text-sm text-ink-muted mt-2 font-sans max-w-lg mx-auto">
            Select your role in the pharmaceutical supply chain. An admin will review and approve your request before you gain access.
          </p>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted text-center mb-6 font-semibold">
              Step 1 of 2 — Choose Your Role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map((r) => {
                const Icon = r.Icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${isSelected ? r.activeColor : r.color} hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-serif font-bold text-lg">{r.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                    </div>
                    <p className={`text-xs font-sans leading-relaxed mb-3 ${isSelected ? 'text-white/80' : 'text-ink-muted'}`}>
                      {r.description}
                    </p>
                    <ul className="space-y-1">
                      {r.features.map((f, i) => (
                        <li key={i} className={`text-xs font-mono flex items-center gap-1.5 ${isSelected ? 'text-white/70' : 'text-ink-muted'}`}>
                          <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-4">
              <button
                disabled={!selectedRole}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 bg-ink-forest hover:bg-ink-forestDark text-white font-serif font-bold text-sm rounded-lg transition-all disabled:opacity-40"
              >
                Continue as {selectedRole ? ROLES.find(r => r.id === selectedRole)?.label : '...'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-ink-muted hover:text-ink-forest text-xs font-mono underline"
              >
                ← Change role
              </button>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold ${role?.activeColor}`}>
                {role && <role.Icon className="w-3 h-3" />}
                {role?.label}
              </div>
              <span className="text-xs font-mono text-ink-muted uppercase tracking-widest ml-auto">Step 2 of 2 — Your Details</span>
            </div>

            <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 shadow-ledger space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest font-sans"
                    placeholder="Dr. Arun Kumar" />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">Email Address *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest font-sans"
                    placeholder="arun@apexpharma.in" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">Wallet Address (Ethereum) *</label>
                <input required value={form.wallet_address} onChange={e => setForm({...form, wallet_address: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm font-mono focus:outline-none focus:border-ink-forest"
                  placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" />
                <p className="text-[11px] text-ink-muted mt-1 font-sans">Your on-chain identity. The admin will assign your role to this address on the blockchain.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                    {selectedRole === 'customer' ? 'Patient ID / Hospital Name' : 'Facility / Company Name'}
                  </label>
                  <input value={form.facility_name} onChange={e => setForm({...form, facility_name: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest font-sans"
                    placeholder={selectedRole === 'customer' ? 'AIIMS Delhi — OPD' : 'Apex Pharma Labs Pvt. Ltd.'} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                    {selectedRole === 'customer' ? 'Contact Phone' : 'Drug License / Registration No.'}
                  </label>
                  <input value={form.license_number || form.contact_phone}
                    onChange={e => selectedRole === 'customer'
                      ? setForm({...form, contact_phone: e.target.value})
                      : setForm({...form, license_number: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm font-mono focus:outline-none focus:border-ink-forest"
                    placeholder={selectedRole === 'customer' ? '+91-98765-43210' : 'DL-MH-12345'} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">Reason for Access Request</label>
                <textarea rows={2} value={form.reason_for_access} onChange={e => setForm({...form, reason_for_access: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest font-sans"
                  placeholder="Brief description of your role and why you need access to MedChain..." />
              </div>

              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-ink-forest hover:bg-ink-forestDark text-white font-serif font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50">
              {loading ? 'Submitting Request...' : 'Submit Registration Request'}
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-ink-forest/10 border-4 border-ink-forest flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-ink-forest" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-ink-forest">Request Submitted!</h2>
              <p className="text-ink-muted text-sm font-sans mt-2 max-w-md mx-auto">
                Your access request has been sent to the MedChain administrator. You'll be notified once your role has been approved.
              </p>
            </div>
            <div className="bg-paper-light border-2 border-paper-border rounded-xl p-5 max-w-sm mx-auto text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-muted uppercase">Name</span>
                <span className="font-semibold text-ink-forest">{form.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-muted uppercase">Requested Role</span>
                <span className="font-bold capitalize text-ink-forest">{selectedRole}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-muted uppercase">Status</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">PENDING APPROVAL</span>
              </div>
            </div>
            {onRegistered && (
              <button onClick={() => onRegistered()} className="text-ink-forest text-sm font-mono underline hover:text-ink-forestDark">
                Back to Application
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
