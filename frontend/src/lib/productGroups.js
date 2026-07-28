// Groups products into shopper-friendly categories by product type/name.
// Used by the homepage "Shop by Category" tiles and the shop page type filter.

export const GROUPS = [
  { key: 'necklace', label: 'Necklaces & Sets', image: '/images/heritage-kundan-necklace-set-thumb.webp' },
  { key: 'earrings', label: 'Earrings', image: '/images/Chandbali_black-thumb.webp' },
  { key: 'bracelet', label: 'Bracelets', image: '/images/emerald-bracelet-thumb.webp' },
  { key: 'hathphool', label: 'Hathphool', image: '/images/hathphool-thumb.webp' },
];

const GROUP_LABEL = Object.fromEntries(GROUPS.map((g) => [g.key, g.label]));
export const groupLabel = (key) => GROUP_LABEL[key] || 'All Jewellery';

// Classify one product into a group key. Necklace/set indicators win over
// "earrings" because most sets are "necklace ... with matching earrings".
export function productGroup(p) {
  const t = `${p.product_type || ''} ${p.name || ''} ${p.set_includes || ''}`.toLowerCase();
  if (/hathphool|haathphool|hath phool|panjah|slave bracelet|ring bracelet/.test(t)) return 'hathphool';
  if (/bracelet|bangle|kada/.test(t)) return 'bracelet';
  if (/necklace|choker|haar|pendant|collar|hasli|set with|layered/.test(t)) return 'necklace';
  if (/earring|jhumka|jhumki|chandbali|ear cuff|earcuff|ear support|ear chain|ear /.test(t)) return 'earrings';
  return 'necklace'; // sensible default (most items are sets)
}

// ---- "Shop by Style" classification (used by the shop page style filter) ----

// The exact pieces the owner marks as bridal. Bridal is an overlay tag — these
// keep their Choker/Necklace form and also appear under the Bridal filter.
// While this list is empty the Bridal filter hides itself.
export const BRIDAL_PRODUCT_IDS = [
  'prod_d38ff0247883', // Emerald Veena Kundan Haar Set
  'prod_86304978f91d', // Sabyasachi Inspired Necklace Set
  'prod_0804a64c3cac', // Gulbahar Heritage Necklace Set
  'prod_d9fc5a7711c8', // Heritage Kundan Necklace Set
  'prod_2c1607507522', // Rosé Moissanite Layered Necklace Set
];

// A choker sits high on the neck — matched from the product type/name.
export function isChoker(p) {
  return /choker/.test(`${p.product_type || ''} ${p.name || ''}`.toLowerCase());
}

// Bridal = the owner-curated list only.
export function isBridal(p) {
  return BRIDAL_PRODUCT_IDS.includes(p.product_id);
}

// Necklace-form sets that are NOT chokers (longer haar/collar/layered/pendant),
// so Choker and Necklace filters stay mutually exclusive.
export function isNecklaceStyle(p) {
  return productGroup(p) === 'necklace' && !isChoker(p);
}

export const STYLES = [
  { key: 'choker', label: 'Choker Sets', match: isChoker },
  { key: 'necklace', label: 'Necklace Sets', match: isNecklaceStyle },
  { key: 'bridal', label: 'Bridal Sets', match: isBridal },
];

const STYLE_BY_KEY = Object.fromEntries(STYLES.map((s) => [s.key, s]));
export const styleLabel = (key) => STYLE_BY_KEY[key]?.label || 'Statement Jewellery';
export const styleMatch = (key) => STYLE_BY_KEY[key]?.match || (() => true);
