import React, { useState } from 'react';
import { X } from 'lucide-react';

// Dismissible promo strip announcing the welcome coupon. Sits in the normal
// page flow (below the fixed nav), so it never overlaps other content.
// Dismissal is remembered for the session via localStorage.
export default function PromoBanner() {
  const [hidden, setHidden] = useState(() => localStorage.getItem('promoDismissed') === '1');

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem('promoDismissed', '1');
    setHidden(true);
  };

  return (
    <div
      className="relative bg-[#7A1F3D] text-white text-center px-10 py-2.5"
      data-testid="promo-banner"
    >
      <p className="text-xs sm:text-sm tracking-wide flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>🚚 <span className="font-semibold">Free Delivery</span> across India</span>
        <span className="hidden sm:inline opacity-40">|</span>
        <span>💵 Cash on Delivery</span>
        <span className="hidden sm:inline opacity-40">|</span>
        <span>🎁 <span className="font-semibold">10% OFF</span> first order — code <span className="font-semibold tracking-wider">WELCOME10</span></span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss offer"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
