// Automatic order-size offer: buy BULK_OFFER.minQty or more items and get
// BULK_OFFER.percent% off the non-sale subtotal. Kept in sync with the backend
// (backend/server.py BULK_OFFER_* + best_discount). The backend value is
// authoritative for the amount actually charged; this is only for the UI.
//
// The offer applies only to the non-sale portion of the cart (items already
// on sale are excluded, same as on the backend).
export const BULK_OFFER = {
  // Disabled 2026-10-21: every product is on the tiered sale now, so the buy-2
  // offer (non-sale items only) has nothing to apply to. Flip back to true if
  // some products are later taken off the sale.
  enabled: false,
  minQty: 2,
  percent: 15,
};

// Total number of pieces in the cart (sum of quantities).
export function bulkQty(items) {
  return (items || []).reduce((n, it) => n + (it.quantity || 0), 0);
}

// Discount (in paise) from the buy-N offer, given the non-sale subtotal.
export function bulkDiscount(items, couponBase) {
  if (!BULK_OFFER.enabled) return 0;
  if (bulkQty(items) < BULK_OFFER.minQty) return 0;
  return Math.floor((couponBase * BULK_OFFER.percent) / 100);
}

// How many more pieces are needed to unlock the offer (0 once unlocked).
export function piecesToUnlock(items) {
  if (!BULK_OFFER.enabled) return 0;
  return Math.max(0, BULK_OFFER.minQty - bulkQty(items));
}
