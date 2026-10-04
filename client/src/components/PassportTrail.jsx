import React from 'react';
import { Truck, Building2, Store, UserCheck, Factory, ArrowRight } from 'lucide-react';

const ROLE_ICONS = {
  Manufacturer: Factory,
  Distributor: Truck,
  Wholesaler: Building2,
  Pharmacist: Store,
  Customer: UserCheck,
};

export default function PassportTrail({ trail = [] }) {
  if (!trail || trail.length === 0) {
    return (
      <div className="p-6 text-center text-ink-muted italic font-mono text-sm border border-dashed border-paper-border rounded-lg">
        No custody transfer stamps recorded for this batch yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-paper-border pb-2">
        <h3 className="font-serif text-lg font-bold text-ink-forest flex items-center gap-2">
          <span>📜 Chain of Custody & Transfer Stamps</span>
        </h3>
        <span className="font-mono text-xs text-ink-muted">
          {trail.length} {trail.length === 1 ? 'Station' : 'Stations'} Visited
        </span>
      </div>

      {/* Grid of passport visa stamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {trail.map((step, idx) => {
          const Icon = ROLE_ICONS[step.toRole] || Building2;
          const stampDate = new Date(step.timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const stampTime = new Date(step.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={idx}
              className="relative p-3.5 rounded-lg border-2 border-dashed border-ink-forest/40 bg-paper-light shadow-sm flex flex-col justify-between hover:border-ink-forest transition-colors"
            >
              {/* Top stamp header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-ink-forest/10 flex items-center justify-center text-ink-forest">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted block leading-none">
                      Station #{idx + 1}
                    </span>
                    <span className="font-serif font-bold text-sm text-ink-forest block">
                      {step.toRole}
                    </span>
                  </div>
                </div>

                {/* Passport ink ring index */}
                <div className="w-5 h-5 rounded-full border border-ink-forest/50 text-[10px] font-mono flex items-center justify-center text-ink-forest/80 font-bold">
                  {idx + 1}
                </div>
              </div>

              {/* Middle notes */}
              <div className="my-2.5">
                <p className="text-xs text-ink-charcoal/90 italic font-sans line-clamp-2">
                  "{step.notes || 'Custody accepted'}"
                </p>
                {step.fromRole !== 'Genesis' && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-ink-muted">
                    <span>{step.fromRole}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="font-semibold text-ink-forest">{step.toRole}</span>
                  </div>
                )}
              </div>

              {/* Bottom passport stamp details */}
              <div className="border-t border-paper-border/80 pt-2 flex items-center justify-between text-[10px] font-mono text-ink-muted">
                <span className="font-semibold text-ink-forest/80">{stampDate}</span>
                <span>{stampTime}</span>
              </div>
              
              <div className="text-[9px] font-mono text-ink-muted truncate mt-1">
                Node: {step.to.slice(0, 8)}...{step.to.slice(-6)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
