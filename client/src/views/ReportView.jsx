import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export default function ReportView({ prefilledBatch = '', onReportFiled }) {
  const [batchNumber, setBatchNumber] = useState(prefilledBatch || 'MED-2026-001');
  const [reasonCategory, setReasonCategory] = useState('Broken / Tampered Security Seal');
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState('Metro Chemist, Counter #3');
  const [reporterRole, setReporterRole] = useState('Customer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const categories = [
    'Broken / Tampered Security Seal',
    'Missing or Blurry Expiration Print',
    'Package Label Discrepancy / Typo',
    'Suspicious Color / Foreign Particles',
    'Hologram Missing or Peeling',
    'Unusual Chemical Odor',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const fullReason = `${reasonCategory}: ${details || 'Observed by reporter at inspection'}`;

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchNumber: batchNumber.trim(),
          reason: fullReason,
          reporterRole,
          location,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to file report');
      }

      setSuccess(data);
      if (onReportFiled) onReportFiled();
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
        <span className="font-mono text-xs uppercase tracking-widest text-ink-rust font-semibold">
          CHAPTER V • CROWDSOURCED SAFETY REPORTING
        </span>
        <h2 className="font-serif text-3xl font-bold text-ink-rust mt-1">
          Report Suspicious Medicine Batch
        </h2>
        <p className="text-sm text-ink-muted font-sans mt-1">
          Reports are written directly on-chain and attributed to the last supply chain node that held custody, protecting reporter anonymity while keeping suppliers accountable.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 sm:p-8 shadow-ledger">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1 font-semibold">
                Target Batch Number *
              </label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. MED-2026-001"
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg font-mono text-sm focus:outline-none focus:border-ink-rust"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1 font-semibold">
                Reporter Capacity
              </label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg font-sans text-sm focus:outline-none focus:border-ink-rust"
              >
                <option value="Customer">End Patient / Consumer</option>
                <option value="Pharmacist">Licensed Chemist / Pharmacist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1 font-semibold">
              Primary Tamper / Counterfeit Indicator *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg font-sans text-sm focus:outline-none focus:border-ink-rust"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1 font-semibold">
              Location of Discovery
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. City Pharmacy, Main Market Counter #2"
              className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-rust"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1 font-semibold">
              Detailed Observation Notes
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe package condition, text inconsistencies, or visual defects..."
              className="w-full px-3.5 py-2.5 bg-paper border border-paper-border rounded-lg text-sm focus:outline-none focus:border-ink-rust"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-ink-rust hover:bg-ink-rustDark text-paper-light font-serif font-bold text-sm rounded-lg flex items-center gap-2 shadow transition-all disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{loading ? 'Submitting On-Chain Report...' : 'File Security Report on Ledger'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Card */}
      {success && (
        <div className="p-5 rounded-xl bg-rose-50 border-2 border-dashed border-ink-rust text-ink-rustDark shadow-sm space-y-2 animate-stamp">
          <div className="flex items-center gap-2 font-serif font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-ink-rust" />
            <span>Report Recorded to Blockchain Ledger</span>
          </div>
          <p className="text-xs font-sans">
            The batch <strong>{batchNumber}</strong> has been flagged on-chain. The node that last transferred this batch will have its dynamic trust score adjusted accordingly.
          </p>
          <div className="text-[10px] font-mono break-all text-ink-muted pt-1 border-t border-ink-rust/20">
            Tx Hash: {success.txHash}
          </div>
        </div>
      )}
    </div>
  );
}
