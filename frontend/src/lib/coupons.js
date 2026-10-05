// Discount coupons: code -> percentage off. Kept in sync with the backend
// (backend/server.py COUPONS). The backend value is authoritative for the
// amount actually charged; this is only for showing the discount in the UI.
export const COUPONS = {
  WELCOME10: 10,
  PALAK15: 15, // influencer: Palak Malhotra (@beautybrunchess)
};

const SAVED_KEY = 'aarsha_coupon';

// Influencer links look like https://www.theaarshalabel.com/?coupon=PALAK15.
// Remember the code so checkout can apply it even if the visitor browses first.
export function captureCouponFromUrl() {
  try {
    const code = new URLSearchParams(window.location.search).get('coupon');
    if (code && COUPONS[code.trim().toUpperCase()]) {
      localStorage.setItem(SAVED_KEY, code.trim().toUpperCase());
    }
  } catch (e) { /* storage unavailable */ }
}

export function getSavedCoupon() {
  try {
    return localStorage.getItem(SAVED_KEY) || '';
  } catch (e) {
    return '';
  }
}

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
