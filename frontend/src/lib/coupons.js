// Discount coupons: code -> percentage off. Kept in sync with the backend
// (backend/server.py COUPONS). The backend value is authoritative for the
// amount actually charged; this is only for showing the discount in the UI.
export const COUPONS = {
  WELCOME10: 10,
};

// Returns { valid, code, percent, discount } for a subtotal in paise.
export function getCoupon(code, subtotal) {
  const normalized = (code || '').trim().toUpperCase();
  const percent = COUPONS[normalized];
  if (!percent) {
    return { valid: false, code: normalized, percent: 0, discount: 0 };
  }
  const discount = Math.floor((subtotal * percent) / 100);
  return { valid: true, code: normalized, percent, discount };
}
