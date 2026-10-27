// Size options for products that need them. Bangles / Kadas are sold in three
// standard sizes; detected by product_type so any future bangle product gets
// the selector automatically (no per-product config needed).
export const BANGLE_SIZES = ['2.4 (Small)', '2.6 (Medium)', '2.8 (Large)'];

export function sizesForProduct(product) {
  const t = ((product && product.product_type) || '').toLowerCase();
  if (t.includes('kada') || t.includes('bangle')) {
    return BANGLE_SIZES;
  }
  return [];
}
