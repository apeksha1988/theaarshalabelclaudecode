// Out-of-stock control for the storefront.
//
// To mark a product SOLD OUT: add its product_id to the set below (with a
// comment naming the product). To bring it back: remove the line.
// No database or backend change is needed — this deploys with the frontend.
//
// A product is also treated as out of stock if its `availability` field
// (from the catalog) says so, e.g. "Out of Stock" / "Sold Out".
const OUT_OF_STOCK_IDS = new Set([
  'prod_ee13ecea43b5', // The Aarsha's Ruhani Ruby Necklace Set
]);

export function isOutOfStock(product) {
  if (!product) return false;
  if (OUT_OF_STOCK_IDS.has(product.product_id)) return true;
  return /out.?of.?stock|sold.?out/i.test(product.availability || '');
}
