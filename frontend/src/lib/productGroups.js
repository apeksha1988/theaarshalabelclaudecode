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
