import React, { useState } from 'react';
import { Star, BadgeCheck, Play } from 'lucide-react';
import { reviewsForProduct, ratingSummary } from '../lib/reviews';

// Click-to-play customer video review. The video only downloads when tapped
// (poster-first), so it never adds weight to the page load.
function ReviewVideo({ src, poster, name }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="w-full max-w-[240px] mx-auto aspect-[9/16] bg-[#EFE8DA] rounded-md overflow-hidden mb-3 border border-[#EAE5D9]">
      {playing ? (
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          data-testid="review-video-player"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative w-full h-full"
          aria-label={`Play video review from ${name}`}
          data-testid="review-video-play"
        >
          <img src={poster} alt={`Video review from ${name}`} loading="lazy" className="w-full h-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-[#7A1F3D] ml-0.5" fill="#7A1F3D" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

const GOLD = '#C99A2E';

// A row of 1–5 stars, filled up to `value`.
function Stars({ value, size = 16 }) {
  return (
    <span className="inline-flex items-center" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= Math.round(value);
        return (
          <Star
            key={i}
            width={size}
            height={size}
            strokeWidth={1.5}
            style={{ color: on ? GOLD : '#D9CFC0' }}
            fill={on ? GOLD : 'none'}
          />
        );
      })}
    </span>
  );
}

// Small star rating + count shown near the product title. Links to the reviews
// section. Renders nothing until there are reviews.
export function ProductRatingInline({ productId }) {
  const reviews = reviewsForProduct(productId);
  const { avg, count } = ratingSummary(reviews);
  if (!count) return null;
  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-2 mb-5 group"
      data-testid="product-rating-inline"
    >
      <Stars value={avg} />
      <span className="text-sm text-[#666666] group-hover:text-[#7A1F3D] transition-colors">
        {avg} · {count} review{count > 1 ? 's' : ''}
      </span>
    </a>
  );
}

function formatDate(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return m ? `${months[Number(m) - 1] || ''} ${y}` : y;
}

// Full "Customer Reviews" section for a product page. Renders nothing until
// there are reviews, so a new product never shows an empty state.
export default function ProductReviews({ productId }) {
  const reviews = reviewsForProduct(productId);
  const { avg, count } = ratingSummary(reviews);
  if (!count) return null;

  return (
    <section id="reviews" className="mt-24 pt-16 border-t border-[#EAE5D9]" data-testid="product-reviews">
      <h2 className="text-2xl sm:text-3xl font-serif font-light text-center text-[#1A1A1A] mb-8">
        Customer Reviews
      </h2>

      {/* Summary */}
      <div className="flex flex-col items-center gap-1 mb-12">
        <span className="text-4xl font-light text-[#1A1A1A]">{avg.toFixed(1)}</span>
        <Stars value={avg} size={20} />
        <span className="text-sm text-[#666666]">Based on {count} review{count > 1 ? 's' : ''}</span>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {reviews.map((r) => (
          <div key={r.id} className="bg-[#F5F0E6] p-6" data-testid="review-card">
            <div className="flex items-center justify-between mb-3">
              <Stars value={r.rating} />
              <span className="text-xs text-[#999999]">{formatDate(r.date)}</span>
            </div>

            {r.video ? (
              <ReviewVideo src={r.video} poster={r.poster} name={r.name} />
            ) : r.image ? (
              <img
                src={r.image}
                alt={`Review from ${r.name}`}
                loading="lazy"
                className="w-full rounded-md border border-[#EAE5D9] mb-3"
              />
            ) : (
              <p className="text-[#1A1A1A] leading-relaxed mb-3">“{r.text}”</p>
            )}

            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-medium text-[#1A1A1A]">{r.name}</span>
              {r.verified && (
                <span className="inline-flex items-center gap-1 text-[#388E3C]" title="Verified customer">
                  <BadgeCheck className="w-4 h-4" /> Verified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
