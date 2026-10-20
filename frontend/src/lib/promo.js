// Automatic order-size offer: buy BULK_OFFER.minQty or more items and get
// BULK_OFFER.percent% off the non-sale subtotal. Kept in sync with the backend
// (backend/server.py BULK_OFFER_* + best_discount). The backend value is
// authoritative for the amount actually charged; this is only for the UI.
//
// The offer never stacks: it applies only to the non-sale ("couponBase")
// portion of the cart, and the customer gets whichever is larger — this offer
// or a coupon code (20% already beats WELCOME10/PALAK15).
export const BULK_OFFER = {
  enabled: true,
  minQty: 2,
  percent: 20,
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
