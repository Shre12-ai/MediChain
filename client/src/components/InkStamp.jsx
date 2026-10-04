import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, Award, ShieldAlert } from 'lucide-react';

export default function InkStamp({ verdict, timestamp, batchNumber, scanCount }) {
  const isGenuine = verdict === 'GENUINE';
  const isFlagged = verdict === 'FLAGGED';
  const isExpired = verdict === 'EXPIRED';

  const dateStr = timestamp ? new Date(timestamp).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase() : new Date().toLocaleDateString('en-US').toUpperCase();

  if (isGenuine) {
    return (
      <div className="relative inline-block animate-stamp select-none my-4">
        {/* Stamp outer container */}
        <div className="relative border-4 border-dashed border-ink-forest p-4 rounded-xl max-w-sm mx-auto bg-paper-light/90 shadow-stamp transform -rotate-2">
          {/* Double ring border */}
          <div className="border-2 border-ink-forest rounded-lg p-3 text-ink-forest flex flex-col items-center text-center">
            
            {/* Header arc title */}
            <div className="flex items-center gap-1.5 uppercase text-[10px] tracking-widest font-mono font-bold text-ink-forest/80 border-b border-ink-forest/40 pb-1 w-full justify-center">
              <Award className="w-3.5 h-3.5" />
              <span>MEDCHAIN LEDGER RECORD</span>
              <Award className="w-3.5 h-3.5" />
            </div>

            {/* Core verdict badge */}
            <div className="my-2.5 flex items-center justify-center gap-2">
              <ShieldCheck className="w-9 h-9 text-ink-forest stroke-[2.2]" />
              <div className="text-left leading-none">
                <span className="block text-2xl font-serif font-black tracking-wider text-ink-forest">
                  VERIFIED
                </span>
                <span className="block text-[11px] font-mono tracking-widest font-semibold text-ink-forestLight">
                  AUTHENTIC BATCH
                </span>
              </div>
            </div>

            {/* Stamp footer metadata */}
            <div className="w-full border-t border-ink-forest/40 pt-1.5 mt-1 flex justify-between items-center text-[10px] font-mono text-ink-forest/90">
              <span>{batchNumber || 'MED-BATCH'}</span>
              <span>{dateStr}</span>
            </div>

            <div className="text-[9px] font-mono text-ink-forest/70 mt-1">
              CRYPTOGRAPHIC HASH MATCHED • CHAIN VALIDATED
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFlagged) {
    return (
      <div className="relative inline-block animate-stamp select-none my-4">
        <div className="relative border-4 border-dashed border-ink-rust p-4 rounded-xl max-w-sm mx-auto bg-paper-light/95 shadow-stamp-rust transform rotate-2">
          <div className="border-2 border-ink-rust rounded-lg p-3 text-ink-rust flex flex-col items-center text-center">
            
            <div className="flex items-center gap-1.5 uppercase text-[10px] tracking-widest font-mono font-bold text-ink-rust/80 border-b border-ink-rust/40 pb-1 w-full justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SECURITY INTERCEPTION</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>

            <div className="my-2.5 flex items-center justify-center gap-2">
              <AlertTriangle className="w-9 h-9 text-ink-rust stroke-[2.2]" />
              <div className="text-left leading-none">
                <span className="block text-2xl font-serif font-black tracking-wider text-ink-rust">
                  FLAGGED
                </span>
                <span className="block text-[11px] font-mono tracking-widest font-semibold text-ink-rustDark">
                  SUSPICIOUS / REJECTED
                </span>
              </div>
            </div>

            <div className="w-full border-t border-ink-rust/40 pt-1.5 mt-1 flex justify-between items-center text-[10px] font-mono text-ink-rust/90">
              <span>{batchNumber || 'UNKNOWN'}</span>
              <span>{dateStr}</span>
            </div>

            <div className="text-[9px] font-mono text-ink-rust/80 mt-1 font-semibold">
              DO NOT DISPENSE • REPORT FILED TO REGISTRY
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXPIRED
  return (
    <div className="relative inline-block animate-stamp select-none my-4">
      <div className="relative border-4 border-dashed border-ink-muted p-4 rounded-xl max-w-sm mx-auto bg-paper-light/90 shadow-sm transform -rotate-1">
        <div className="border-2 border-ink-muted rounded-lg p-3 text-ink-muted flex flex-col items-center text-center">
          
          <div className="flex items-center gap-1.5 uppercase text-[10px] tracking-widest font-mono font-bold text-ink-muted/80 border-b border-ink-muted/40 pb-1 w-full justify-center">
            <Clock className="w-3.5 h-3.5" />
            <span>SHELF-LIFE EXPIRED</span>
            <Clock className="w-3.5 h-3.5" />
          </div>

          <div className="my-2.5 flex items-center justify-center gap-2">
            <Clock className="w-9 h-9 text-ink-muted stroke-[2.2]" />
            <div className="text-left leading-none">
              <span className="block text-2xl font-serif font-black tracking-wider text-ink-muted">
                EXPIRED
              </span>
              <span className="block text-[11px] font-mono tracking-widest font-semibold text-ink-charcoal">
                PAST USE-BY DATE
              </span>
            </div>
          </div>

          <div className="w-full border-t border-ink-muted/40 pt-1.5 mt-1 flex justify-between items-center text-[10px] font-mono text-ink-muted/90">
            <span>{batchNumber}</span>
            <span>{dateStr}</span>
          </div>

          <div className="text-[9px] font-mono text-ink-muted mt-1">
            AUTHENTIC PRODUCT • CONSUMPTION FORBIDDEN
          </div>
        </div>
      </div>
    </div>
  );
}
