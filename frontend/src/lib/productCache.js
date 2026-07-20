// Instant product data so the shop/home pages never show a long spinner —
// even while the (possibly cold-starting) Render backend is waking up.
//
// Order of preference:
//   1. localStorage cache  (repeat visitors — always up to date)
//   2. bundled snapshot    (first-time visitors — ships in the JS bundle)
// Fresh API data replaces both in the background on every load.
import SNAPSHOT from '../data/productsSnapshot.json';

const KEY = 'aarsha_products_v1';

export function getCachedProducts() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (Array.isArray(data) && data.length) return data;
  } catch {
    /* storage disabled — fall through to the snapshot */
  }
  return Array.isArray(SNAPSHOT) && SNAPSHOT.length ? SNAPSHOT : null;
}

export function setCachedProducts(data) {
  try {
    if (Array.isArray(data) && data.length) localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full / disabled — ignore */
  }
}
