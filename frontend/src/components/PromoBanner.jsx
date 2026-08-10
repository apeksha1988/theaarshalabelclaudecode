import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

// Dismissible promo strip announcing the festive edit + welcome coupon. Sits in
// the normal page flow (below the fixed nav). Dismissal is remembered for the
// session via localStorage. The message links to the Festive Collection.
export default function PromoBanner() {
  const [hidden, setHidden] = useState(() => localStorage.getItem('promoDismissed') === '1');

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem('promoDismissed', '1');
    setHidden(true);
  };

  return (
    <div
      className="relative bg-gradient-to-r from-[#5C172E] via-[#7A1F3D] to-[#5C172E] text-white text-center px-10 py-2.5"
      data-testid="promo-banner"
    >
      <Link to="/festive" className="block hover:opacity-95 transition-opacity">
        <p className="text-xs sm:text-sm tracking-wide flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>🪔 <span className="font-semibold text-[#F0C96B]">Festive Edit</span> — Teej &amp; Rakhi ready ✨</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>🎁 <span className="font-semibold">10% OFF</span> code <span className="font-semibold tracking-wider">WELCOME10</span></span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>🚚 Free Delivery + 💵 COD</span>
        </p>
      </Link>
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
