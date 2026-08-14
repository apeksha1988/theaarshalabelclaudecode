// Customer reviews for The Aarsha Label product pages.
//
// ⚠️ ONLY ADD GENUINE REVIEWS. Fake reviews are deceptive, violate Google
// Merchant Center and Meta policies (and can get your ad accounts suspended),
// and shoppers can spot them. Collect real ones from WhatsApp replies, order
// feedback, and Instagram comments/DMs.
//
// Each review:
//   { id, name, rating (1–5), date: 'YYYY-MM', text, verified, productId?, image? }
// `productId` (optional) attaches a review to ONE product; without it, the
// review shows on every product page as general brand feedback — useful while
// you're building up per-product reviews.
// `image` (optional) is a path like '/images/reviews/whatsapp-1.webp' — the card
// shows that screenshot (e.g. a WhatsApp/Instagram review) instead of plain text.
// `video` + `poster` (optional) show a click-to-play customer video review; the
// video only downloads when tapped, so it never slows the page.
//
export const REVIEWS = [
  {
    id: 'review-video-1',
    name: 'Verified Customer',
    rating: 5,
    date: '2026-08',
    verified: true,
    // Genuine customer video testimonial sent for use on the site.
    text: 'A happy customer sharing her Aarsha Label set — see it on video!',
    video: '/videos/review-1.mp4',
    poster: '/images/reviews/review-1-poster.webp',
    productId: null,
  },
  {
    id: 'review-whatsapp-1',
    name: 'Verified Customer',
    rating: 5,
    date: '2026-07',
    verified: true,
    // Genuine WhatsApp review screenshot (personal details already redacted).
    text: 'I received my order — the design is very beautiful and the packaging feels really luxurious.',
    image: '/images/reviews/customer-review-1.webp',
    productId: null,
  },
  {
    id: 'review-instagram-1',
    name: 'Verified Customer',
    rating: 5,
    date: '2026-07',
    verified: true,
    // Genuine Instagram Story review (customer tagged the brand publicly).
    text: 'Absolutely loved the packaging and the attention to detail. Can’t wait to style these pieces!',
    image: '/images/reviews/customer-review-2.webp',
    productId: null,
  },
];

// Reviews to show on a given product page: product-specific + general brand ones.
export function reviewsForProduct(productId) {
  return REVIEWS.filter((r) => !r.productId || r.productId === productId);
}

// Average rating (1 decimal) and count for a set of reviews.
export function ratingSummary(reviews) {
  if (!reviews || !reviews.length) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
