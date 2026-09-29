// Wholesale / bulk-order settings for the B2B partner pages.
// Adjust these freely — they drive both the landing page and the catalogue.

// Bulk purchase discount tiers (by number of pieces per order).
export const BULK_TIERS = [
  { label: '10 – 24 pieces', discount: '10% off', highlight: false },
  { label: '25 – 49 pieces', discount: '15% off', highlight: false },
  { label: '50 – 99 pieces', discount: '20% off', highlight: true },
  { label: '100+ pieces', discount: 'Best custom pricing', highlight: false },
];

// Options in the "type of business" dropdown on the inquiry form.
export const BUSINESS_TYPES = [
  'Boutique / Retail store',
  'Online reseller',
  'Salon / Studio',
  'Event & bridal stylist',
  'Exporter',
  'Other',
];
