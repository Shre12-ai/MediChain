import React, { useState } from 'react';
import { PlusCircle, QrCode, CheckCircle, AlertTriangle, Printer, Hash, Sparkles, Lock } from 'lucide-react';

export default function RegisterView({ onBatchRegistered, activeRole = 'manufacturer' }) {
  const canRegister = activeRole === 'manufacturer';

  const [formData, setFormData] = useState({
    batchNumber: '',
    medicineName: '',
    composition: '',
    dosage: '',
    mfgDate: '',
    expDate: '',
    storageTemperature: '',
    packageType: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await fetch('/api/batches/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessResult(data);
      if (onBatchRegistered) onBatchRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-paper-border pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-forest font-semibold">
          CHAPTER II • GENESIS & REGISTRATION
        </span>
        <h2 className="font-serif text-3xl font-bold text-ink-forest mt-1">
          Anchor New Medicine Batch
        </h2>
        <p className="text-sm text-ink-muted font-sans mt-1">
          Registered manufacturers mint an immutable cryptographic anchor on the blockchain and generate the authentic QR code.
        </p>
      </div>

      {/* Form & Card */}
      <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 sm:p-8 shadow-ledger">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Batch Identification Number *
              </label>
              <input
                type="text"
                required
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg font-mono text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Commercial Brand / Medicine Name *
              </label>
              <input
                type="text"
                required
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Chemical Composition / API
              </label>
              <input
                type="text"
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Dosage & Package Strength
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Manufacturing Date (anchor point) *
              </label>
              <input
                type="date"
                required
                value={formData.mfgDate}
                onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg font-mono text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.expDate}
                onChange={(e) => setFormData({ ...formData, expDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg font-mono text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Storage Temperature Specification
              </label>
              <input
                type="text"
                value={formData.storageTemperature}
                onChange={(e) => setFormData({ ...formData, storageTemperature: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
                Packaging Type
              </label>
              <input
                type="text"
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-semibold">
              Quality Assurance Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-forest"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-ink-forest hover:bg-ink-forestDark text-paper-light font-serif font-bold text-sm rounded-lg flex items-center gap-2 shadow transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Minting On-Chain Anchor...' : 'Sign & Register on Ledger'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Success Receipt with Apothecary Printable Label */}
      {successResult && (
        <div className="bg-paper-light border-2 border-dashed border-ink-forest rounded-xl p-6 shadow-ledger animate-stamp">
          <div className="flex items-center gap-2 text-ink-forest font-serif font-bold text-lg border-b border-ink-forest/30 pb-2">
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <span>Batch Registration Certificate & On-Chain Anchor</span>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center gap-6 justify-between">
            {/* Label info */}
            <div className="space-y-2 text-xs font-mono flex-1">
              <div>
                <span className="text-ink-muted">Batch Number:</span>{' '}
                <span className="font-bold text-ink-forest text-sm">{successResult.batch.batchNumber}</span>
              </div>
              <div>
                <span className="text-ink-muted">Medicine:</span>{' '}
                <span className="font-sans font-semibold text-ink-charcoal">{successResult.batch.medicineName}</span>
              </div>
              <div>
                <span className="text-ink-muted">Keccak256 Hash:</span>{' '}
                <span className="break-all text-[11px] block p-1.5 bg-paper rounded border border-paper-border text-ink-forest">
                  {successResult.onChain.batchHash}
                </span>
              </div>
              <div>
                <span className="text-ink-muted">Transaction Hash:</span>{' '}
                <span className="break-all text-[10px] text-ink-muted block">{successResult.onChain.txHash}</span>
              </div>
            </div>

            {/* Generated QR Card */}
            <div className="p-4 bg-paper rounded-xl border-2 border-ink-forest/40 flex flex-col items-center text-center shadow-sm">
              <img
                src={successResult.batch.qrCodeDataUrl}
                alt="Batch QR Code"
                className="w-36 h-36 border border-paper-border rounded p-1 bg-white"
              />
              <span className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink-forest font-bold">
                Apothecary QR Seal
              </span>
              <button
                onClick={() => window.print()}
                className="mt-2 px-3 py-1 bg-paper-dark hover:bg-paper-border text-ink-forest border border-paper-border rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3 h-3" />
                <span>Print Package Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
