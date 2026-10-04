import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  QrCode, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Hash, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Camera,
  X
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import InkStamp from '../components/InkStamp';
import PassportTrail from '../components/PassportTrail';

export default function VerifyView({ onNavigateToReport, activeRole = 'customer' }) {
  const [batchNumber, setBatchNumber] = useState('MED-2026-001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentBatches, setRecentBatches] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  // Live Camera Scanner Hook
  useEffect(() => {
    if (!showScanner) return;
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        let batchToVerify = decodedText;
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.batchNumber) batchToVerify = parsed.batchNumber;
        } catch (e) {}
        setBatchNumber(batchToVerify);
        setShowScanner(false);
        scanner.clear().catch(() => {});
        handleVerify(batchToVerify);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [showScanner]);

  // Fetch available batches on mount for quick selection
  useEffect(() => {
    fetch('/api/batches')
      .then((res) => res.json())
      .then((data) => {
        if (data.batches) {
          setRecentBatches(data.batches);
        }
      })
      .catch((e) => console.log('Fetch batches err:', e));
  }, []);

  const handleVerify = async (targetBatch = batchNumber) => {
    if (!targetBatch) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/batches/verify/${targetBatch.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Batch verification failed');
      }

      setResult(data);

      // Trigger celebratory confetti if Genuine
      if (data.verdict === 'GENUINE') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1B3B22', '#2C5936', '#C29B38', '#EBE7DC'],
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-paper-border pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-forest font-semibold">
          CHAPTER I • INSPECTION & AUTHENTICATION
        </span>
        <h2 className="font-serif text-3xl font-bold text-ink-forest mt-1">
          Medicine Batch Verification
        </h2>
        <p className="text-sm text-ink-muted font-sans mt-1">
          Inspect on-chain cryptographic anchor, recompute hash integrity, and review chronological passport stamps.
        </p>
      </div>

      {/* Verification Query Card */}
      <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 shadow-ledger">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Enter batch number (e.g. MED-2026-001)"
              className="w-full pl-11 pr-4 py-3 bg-paper border border-paper-border rounded-lg font-mono text-sm focus:outline-none focus:border-ink-forest focus:ring-1 focus:ring-ink-forest transition-all"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowScanner(!showScanner)}
              className="flex-1 sm:flex-none px-4 py-3 border border-ink-forest/40 bg-ink-forest/5 hover:bg-ink-forest/10 text-ink-forest font-serif font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{showScanner ? 'Close Camera' : 'Scan QR'}</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-ink-forest hover:bg-ink-forestDark text-paper-light font-serif font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Batch</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Camera Scanner Box */}
        {showScanner && (
          <div className="mt-4 p-4 border-2 border-dashed border-ink-forest/50 rounded-xl bg-paper relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-ink-forest uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 animate-pulse" /> Point Camera at Medicine Batch QR Code
              </span>
              <button
                type="button"
                onClick={() => setShowScanner(false)}
                className="text-ink-muted hover:text-ink-forest p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div id="qr-reader" className="overflow-hidden rounded-lg mx-auto max-w-sm" />
          </div>
        )}

        {/* Demo Fast Selector */}
        <div className="mt-4 pt-3 border-t border-paper-border/60 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-ink-muted">Quick Demo Batches:</span>
          {recentBatches.length > 0 ? (
            recentBatches.map((b) => (
              <button
                key={b.batchNumber}
                type="button"
                onClick={() => {
                  setBatchNumber(b.batchNumber);
                  handleVerify(b.batchNumber);
                }}
                className="px-2.5 py-1 rounded bg-paper border border-paper-border text-xs font-mono text-ink-forest hover:bg-ink-forest hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>{b.batchNumber}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Flagged' ? 'bg-ink-rust' : 'bg-emerald-600'}`} />
              </button>
            ))
          ) : (
            <span className="font-mono text-xs text-ink-muted italic">Run seed script to populate sample batches</span>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 flex-shrink-0 text-red-600" />
          <div>
            <span className="font-bold block">Verification Lookup Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Verification Result Showcase */}
      {result && (
        <div className="space-y-6">
          {/* Main Ink Stamp & Verdict Card */}
          <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 shadow-ledger text-center relative overflow-hidden">
            <div className="absolute top-2 right-3 font-mono text-[10px] text-ink-muted uppercase">
              On-Chain Block Verified
            </div>

            {/* Signature Ink Stamp */}
            <InkStamp
              verdict={result.verdict}
              timestamp={result.onChain.createdAt}
              batchNumber={result.onChain.batchNumber}
              scanCount={result.onChain.scanCount}
            />

            {/* Medicine name and summary */}
            <div className="mt-2">
              <h3 className="font-serif text-2xl font-bold text-ink-forest">
                {result.onChain.medicineName}
              </h3>
              <p className="font-mono text-xs text-ink-muted mt-1">
                Batch #{result.onChain.batchNumber} • Scanned {result.onChain.scanCount} time(s) on-chain
              </p>
            </div>

            {/* Flagged warning banner */}
            {result.verdict === 'FLAGGED' && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono max-w-xl mx-auto text-left flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Security Precaution:</span> This batch has been flagged on-chain due to duplicate verification or suspicious crowdsourced reporting. Contact the manufacturer or reporting pharmacist immediately.
                </div>
              </div>
            )}
          </div>

          {/* Dual Column: Metadata & Cryptographic Anchor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Pharmaceutical Details */}
            <div className="bg-paper-light border border-paper-border rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-base text-ink-forest border-b border-paper-border pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Pharmaceutical Specifications</span>
              </h4>

              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between py-1 border-b border-paper-border/40">
                  <span className="text-ink-muted">Manufacturer:</span>
                  <span className="font-semibold text-ink-forest">{result.metadata.manufacturerName || 'Apex Pharma Labs (Mfg)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-paper-border/40">
                  <span className="text-ink-muted">Composition / API:</span>
                  <span className="font-mono text-ink-charcoal">{result.metadata.composition || 'Active Pharmaceutical Ingredient'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-paper-border/40">
                  <span className="text-ink-muted">Dosage Form:</span>
                  <span className="font-mono text-ink-charcoal">{result.metadata.dosage || '500mg Standard'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-paper-border/40">
                  <span className="text-ink-muted">Manufacturing Date:</span>
                  <span className="font-mono font-medium">{new Date(result.onChain.mfgDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-paper-border/40">
                  <span className="text-ink-muted">Expiry Date:</span>
                  <span className="font-mono font-medium">{new Date(result.onChain.expDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-muted">Current Custodian:</span>
                  <span className="font-mono text-[11px] text-ink-forest truncate max-w-[200px]" title={result.onChain.currentCustodian}>
                    {result.onChain.currentRole} ({result.onChain.currentCustodian.slice(0, 6)}...)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Cryptographic Anchor & Blockchain Record */}
            <div className="bg-paper-light border border-paper-border rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-base text-ink-forest border-b border-paper-border pb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>On-Chain Cryptographic Anchor</span>
              </h4>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-ink-muted text-[11px] block">Stored Keccak256 Hash:</span>
                  <div className="p-2 rounded bg-paper border border-paper-border text-[11px] text-ink-forest break-all select-all font-mono">
                    {result.onChain.batchHash}
                  </div>
                </div>

                <div>
                  <span className="text-ink-muted text-[11px] block">Verification Status:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      result.onChain.status === 'Genuine' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {result.onChain.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-ink-muted">
                      {result.onChain.isFinalized ? '• Custody Finalized (Patient Dispensed)' : '• In Active Supply Chain'}
                    </span>
                  </div>
                </div>

                {result.metadata.qrCodeDataUrl && (
                  <div className="pt-2 border-t border-paper-border/60 flex items-center gap-3">
                    <img
                      src={result.metadata.qrCodeDataUrl}
                      alt="Batch QR"
                      className="w-16 h-16 border border-paper-border rounded p-1 bg-white"
                    />
                    <div className="text-[11px] font-sans text-ink-muted">
                      <span className="font-bold block text-ink-forest">Authentic Batch QR Code</span>
                      <span>Cryptographically linked to the on-chain hash.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Passport-Stamp-Style Custody History Trail */}
          <div className="bg-paper-light border-2 border-paper-border rounded-xl p-6 shadow-ledger">
            <PassportTrail trail={result.custodyTrail} />
          </div>

          {/* Action button: Report suspicious issue */}
          <div className="flex justify-end">
            <button
              onClick={() => onNavigateToReport(result.onChain.batchNumber)}
              className="px-4 py-2 border border-ink-rust text-ink-rust hover:bg-ink-rust hover:text-white rounded-lg text-xs font-mono flex items-center gap-2 transition-colors"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Report Suspicious Discrepancy for this Batch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
