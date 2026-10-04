import React, { useState, useEffect } from 'react';
import { Award, AlertTriangle, ShieldCheck, RefreshCw, Info, Building2, AlertOctagon } from 'lucide-react';

export default function TrustLedgerView() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNodes = () => {
    setLoading(true);
    fetch('/api/nodes')
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes || []);
      })
      .catch((err) => console.log('Fetch nodes error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-paper-border pb-4 flex items-start justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-forest font-semibold">
            CHAPTER IV • REPUTATION & INTEGRITY
          </span>
          <h2 className="font-serif text-3xl font-bold text-ink-forest mt-1">
            Dynamic Node Trust Ledger
          </h2>
          <p className="text-sm text-ink-muted font-sans mt-1">
            Self-correcting crowdsourced trust scoring. Each station accumulates reputation from verified genuine scans vs. suspicious reports.
          </p>
        </div>

        <button
          onClick={fetchNodes}
          className="p-2 border border-paper-border rounded-lg hover:bg-paper-dark text-ink-forest transition-colors flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Scores</span>
        </button>
      </div>

      {/* Trust Formula Explainer Card */}
      <div className="bg-paper-light border border-paper-border rounded-xl p-4 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ink-forest/10 text-ink-forest flex items-center justify-center font-serif font-bold text-sm">
            %
          </div>
          <div>
            <span className="font-bold text-ink-forest block">Reputation Algorithm (Rule #6)</span>
            <span className="text-ink-muted">
              Score = (Clean Scans × 100) ÷ [ Clean Scans + (Reports × 5) ]
            </span>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
          ⚠️ Early-Warning Threshold: &lt; 70% triggers network audit
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {nodes.map((node) => {
          const isWarning = node.trustScore < 70;
          return (
            <div
              key={node.address}
              className={`p-5 rounded-xl border-2 bg-paper-light transition-all shadow-ledger relative overflow-hidden ${
                isWarning ? 'border-ink-rust/60' : 'border-paper-border'
              }`}
            >
              {/* Alert Badge if under 70% */}
              {isWarning && (
                <div className="absolute -right-12 top-6 bg-ink-rust text-white text-[9px] font-mono font-bold uppercase tracking-widest py-1 px-12 rotate-45 shadow-sm">
                  SECURITY ALERT
                </div>
              )}

              {/* Node Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted block">
                    {node.role} Station
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink-forest mt-0.5">
                    {node.name}
                  </h3>
                  <span className="font-mono text-[10px] text-ink-muted break-all">
                    {node.address.slice(0, 10)}...{node.address.slice(-8)}
                  </span>
                </div>

                {/* Circular Trust Score Indicator */}
                <div className="text-right">
                  <div
                    className={`inline-flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 font-mono ${
                      isWarning
                        ? 'border-ink-rust text-ink-rust bg-rose-50'
                        : 'border-ink-forest text-ink-forest bg-emerald-50'
                    }`}
                  >
                    <span className="text-lg font-bold leading-none">{node.trustScore}%</span>
                    <span className="text-[8px] uppercase tracking-wider mt-0.5">Score</span>
                  </div>
                </div>
              </div>

              {/* Metrics bar */}
              <div className="mt-4 pt-3 border-t border-paper-border/60 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-paper border border-paper-border/80">
                  <span className="text-ink-muted text-[10px] uppercase block">Clean Scans</span>
                  <span className="text-sm font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {node.cleanVerifications}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-paper border border-paper-border/80">
                  <span className="text-ink-muted text-[10px] uppercase block">Reports Filed</span>
                  <span className="text-sm font-bold text-ink-rust flex items-center gap-1 mt-0.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    {node.reportsFiledAgainst}
                  </span>
                </div>
              </div>

              {/* Security Warning Notice */}
              {isWarning && (
                <div className="mt-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-700" />
                  <span>
                    Warning: Node score fell below 70%. Immediate inspection advised.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
