import React from 'react';

// Real customer WhatsApp screenshots — authentic social proof. Each image is a
// small lazy-loaded webp, so it adds nothing to initial page load. Add more
// screenshots to the array as customers share them.
const SHOTS = [
  {
    src: '/images/reviews/whatsapp-review-1.webp',
    alt: 'A customer sharing a photo of their order and a glowing review of The Aarsha Label on WhatsApp',
  },
];

export default function WhatsAppReviews() {
  if (SHOTS.length === 0) return null;
  return (
    <section className="max-w-5xl mx-auto px-6 md:px-12 py-12 sm:py-16" data-testid="whatsapp-reviews">
      <div className="text-center mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A1F3D] mb-3">Straight from WhatsApp</p>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">What our customers say</h2>
        <p className="mt-3 text-sm text-[#666666] max-w-md mx-auto">
          Real messages from real customers — after their order arrives.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
        {SHOTS.map((s) => (
          <div
            key={s.src}
            className="w-full max-w-[340px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-[#EAE5D9] bg-white"
          >
            <img src={s.src} alt={s.alt} loading="lazy" className="w-full h-auto block" />
          </div>
        ))}
      </div>
    </section>
  );
}
