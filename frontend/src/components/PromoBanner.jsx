import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { BULK_OFFER } from '../lib/promo';

// Dismissible promo strip announcing the current offer + free delivery/COD.
// Sits in the normal page flow (below the fixed nav). Dismissal is remembered
// via localStorage. The key is versioned so changing the offer re-shows the
// banner once to shoppers who dismissed a previous one. Links to the shop.
const DISMISS_KEY = 'promoBannerDismissed_buy2';
export default function PromoBanner() {
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidden(true);
  };

  return (
    <div
      className="relative bg-gradient-to-r from-[#5C172E] via-[#7A1F3D] to-[#5C172E] text-white text-center px-10 py-2.5"
      data-testid="promo-banner"
    >
      <Link to="/shop" className="block hover:opacity-95 transition-opacity">
        <p className="text-xs sm:text-sm tracking-wide flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {BULK_OFFER.enabled && (
            <>
              <span>🎁 Buy {BULK_OFFER.minQty} Get <span className="font-semibold text-[#F0C96B]">{BULK_OFFER.percent}% OFF</span> · Shop now →</span>
              <span className="hidden sm:inline opacity-40">|</span>
            </>
          )}
          <span>🚚 Free Delivery + 💵 COD across India</span>
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
