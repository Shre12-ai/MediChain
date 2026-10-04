import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Truck, 
  Building2, 
  Store, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const NEXT_ROLE_TARGETS = {
  manufacturer: { targetRole: 'Distributor', label: 'Hand off to Authorized Cold-Chain Distributor' },
  distributor: { targetRole: 'Wholesaler', label: 'Transfer to Regional Drug Wholesaler' },
  wholesaler: { targetRole: 'Pharmacist', label: 'Supply to Registered Community Pharmacy' },
  pharmacist: { targetRole: 'Customer', label: 'Dispense to Verified Patient / Customer' },
  customer: { targetRole: null, label: 'Finalized at Customer' },
};

export default function CustodyView({ activeRole, setActiveRole }) {
  const [batches, setBatches] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'myStation'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchState = () => {
    fetch('/api/batches')
      .then((res) => res.json())
      .then((d) => setBatches(d.batches || []))
      .catch((e) => console.log('Err fetching batches:', e));

    fetch('/api/nodes')
      .then((res) => res.json())
      .then((d) => setNodes(d.nodes || []))
      .catch((e) => console.log('Err fetching nodes:', e));
  };

  useEffect(() => {
    fetchState();
  }, [activeRole]);

  // Find recipient address matching next role
  const nextTarget = NEXT_ROLE_TARGETS[activeRole.toLowerCase()] || {};
  const targetNode = nodes.find(
    (n) => n.role.toLowerCase() === (nextTarget.targetRole || '').toLowerCase()
  );

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    if (!targetNode && activeRole.toLowerCase() !== 'customer') {
      setError(`Cannot find registered ${nextTarget.targetRole} node address. Check deployment.`);
      return;
    }

    setLoading(true);
    setError(null);
    setTransferSuccess(null);

    try {
      const res = await fetch('/api/batches/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchNumber: selectedBatch.batchNumber,
          toAddress: targetNode.address,
          notes,
          fromRole: activeRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      setTransferSuccess(data);
      setSelectedBatch(null);
      fetchState();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-paper-border pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-forest font-semibold">
          CHAPTER III • CHAIN OF CUSTODY
        </span>
        <h2 className="font-serif text-3xl font-bold text-ink-forest mt-1">
          Custody Transfer Handoffs
        </h2>
        <p className="text-sm text-ink-muted font-sans mt-1">
          Strict sequential handoffs enforced on-chain:{' '}
          <span className="font-semibold text-ink-forest">
            Manufacturer → Distributor → Wholesaler → Pharmacist → Customer
          </span>
          .
        </p>
      </div>

      {/* Sequential Flow Banner */}
      <div className="bg-paper-light border border-paper-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-3 py-1 text-xs font-mono">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${activeRole === 'manufacturer' ? 'bg-ink-forest text-white' : 'text-ink-muted'}`}>
            <span>1. Manufacturer</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-paper-border flex-shrink-0" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${activeRole === 'distributor' ? 'bg-ink-forest text-white' : 'text-ink-muted'}`}>
            <span>2. Distributor</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-paper-border flex-shrink-0" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${activeRole === 'wholesaler' ? 'bg-ink-forest text-white' : 'text-ink-muted'}`}>
            <span>3. Wholesaler</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-paper-border flex-shrink-0" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${activeRole === 'pharmacist' ? 'bg-ink-forest text-white' : 'text-ink-muted'}`}>
            <span>4. Pharmacist</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-paper-border flex-shrink-0" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${activeRole === 'customer' ? 'bg-ink-forest text-white' : 'text-ink-muted'}`}>
            <span>5. Customer (Final)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Batches & Handoff Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Batches held */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-ink-forest">
              Batches on Ledger ({batches.length})
            </h3>
            <span className="font-mono text-xs text-ink-muted">Click a batch to select for transfer</span>
          </div>

          <div className="space-y-3">
            {batches.map((batch) => {
              const isSelected = selectedBatch?.batchNumber === batch.batchNumber;
              const isCurrentRoleCustodian =
                batch.currentRole.toLowerCase() === activeRole.toLowerCase();

              return (
                <div
                  key={batch.batchNumber}
                  onClick={() => setSelectedBatch(batch)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-paper-light ${
                    isSelected
                      ? 'border-ink-forest shadow-md bg-paper'
                      : 'border-paper-border hover:border-ink-forest/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-ink-forest">
                          {batch.batchNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            batch.status === 'Genuine'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {batch.status}
                        </span>
                        {batch.isFinalized && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-semibold">
                            Finalized
                          </span>
                        )}
                      </div>
                      <span className="font-serif text-base font-bold text-ink-charcoal block mt-1">
                        {batch.medicineName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-ink-muted uppercase block">
                        Current Custodian
                      </span>
                      <span className="font-mono text-xs font-semibold text-ink-forest">
                        {batch.currentRole}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-paper-border/60 flex items-center justify-between text-xs font-mono text-ink-muted">
                    <span>Expiry: {new Date(batch.expDate).toLocaleDateString()}</span>
                    <span>Scans: {batch.scanCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Custody Handoff Form */}
        <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 shadow-ledger h-fit space-y-4">
          <h3 className="font-serif text-lg font-bold text-ink-forest border-b border-paper-border pb-2 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-ink-forest" />
            <span>Sign Custody Handoff</span>
          </h3>

          {selectedBatch ? (
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="p-3 bg-paper rounded border border-paper-border text-xs font-mono">
                <span className="text-ink-muted block text-[10px] uppercase">Selected Batch:</span>
                <span className="font-bold text-ink-forest text-sm">{selectedBatch.batchNumber}</span>
                <span className="block text-ink-muted mt-0.5">{selectedBatch.medicineName}</span>
                <span className="block text-[11px] text-ink-forest mt-1">
                  Current Station: <strong>{selectedBatch.currentRole}</strong>
                </span>
              </div>

              {nextTarget.targetRole ? (
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-ink-muted block mb-1 font-semibold">
                    Target Recipient ({nextTarget.targetRole})
                  </span>
                  <div className="p-3 rounded bg-paper-dark border border-paper-border text-xs font-mono">
                    <span className="font-bold text-ink-forest block">
                      {targetNode ? targetNode.name : `Next ${nextTarget.targetRole}`}
                    </span>
                    <span className="text-[10px] text-ink-muted break-all block mt-0.5">
                      {targetNode ? targetNode.address : 'Address pending deployment'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded bg-blue-50 text-blue-900 text-xs font-mono">
                  Batch is at customer station. Final delivery complete.
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1 font-semibold">
                  Custody Notes / Inspection Report
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-paper border border-paper-border rounded text-xs font-sans focus:outline-none focus:border-ink-forest"
                  placeholder="e.g. Temperature checked at 4°C, security seals intact."
                />
              </div>

              {error && (
                <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !nextTarget.targetRole}
                className="w-full py-2.5 bg-ink-forest hover:bg-ink-forestDark text-paper-light font-serif font-bold text-sm rounded shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting Transfer...' : 'Sign On-Chain Handoff'}
              </button>
            </form>
          ) : (
            <div className="p-6 text-center text-xs font-mono text-ink-muted italic border border-dashed border-paper-border rounded">
              Select any batch from the left list to initiate custody handoff.
            </div>
          )}

          {transferSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Custody Recorded On-Chain!</span>
              </div>
              <div className="text-[10px] break-all text-emerald-700">
                Tx: {transferSuccess.txHash}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
