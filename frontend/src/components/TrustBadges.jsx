import React from 'react';
import { ShieldCheck, Truck, PackageCheck, Gem } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, title: '100% Secure Payment', sub: 'Encrypted & safe checkout' },
  { icon: Truck, title: 'Free Delivery', sub: 'Ships in 2–3 business days' },
  { icon: PackageCheck, title: 'Quality Checked', sub: 'Inspected before dispatch' },
  { icon: Gem, title: 'Handcrafted Quality', sub: 'Authentic, made with care' },
];

// Reusable trust strip. `variant="compact"` renders a tighter, stacked list
// (good for a checkout/cart sidebar); default renders a 4-across grid.
export default function TrustBadges({ variant = 'grid', className = '' }) {
  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`} data-testid="trust-badges-compact">
        {BADGES.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-[#7A1F3D] flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] leading-tight">{title}</p>
              <p className="text-xs text-[#666666] leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}
      data-testid="trust-badges"
    >
      {BADGES.map(({ icon: Icon, title, sub }) => (
        <div key={title} className="flex flex-col items-center text-center">
          <Icon className="w-8 h-8 text-[#7A1F3D] mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#1A1A1A]">{title}</p>
          <p className="text-xs text-[#666666] mt-1">{sub}</p>
        </div>
      ))}
    </div>
  );
}
