// Caches the product list in localStorage so the shop/home pages can render
// instantly on repeat visits — even while the (possibly cold-starting)
// backend is still responding. Fresh data replaces the cache in the
// background on every load.
const KEY = 'aarsha_products_v1';

export function getCachedProducts() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return Array.isArray(data) && data.length ? data : null;
  } catch {
    return null;
  }
}

export function setCachedProducts(data) {
  try {
    if (Array.isArray(data) && data.length) localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full / disabled — ignore */
  }
}
