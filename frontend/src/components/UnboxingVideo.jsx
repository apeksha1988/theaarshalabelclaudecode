import React, { useState } from 'react';
import { Play } from 'lucide-react';

// Real customer unboxing video. Performance-safe: only a ~30 KB poster image
// loads with the page (lazily); the 6 MB video is fetched ONLY when the user
// taps play, so it adds nothing to initial page load.
export default function UnboxingVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 sm:py-24" data-testid="unboxing-video">
      <div className="text-center mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A1F3D] mb-3">Straight from our customers</p>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">
          Unboxed &amp; Loved
        </h2>
        <p className="mt-3 text-sm text-[#666666] max-w-md mx-auto">
          Real pieces, real packaging, real reactions — see what arrives at your door.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[300px] aspect-[9/16] bg-[#F5F0E6] overflow-hidden rounded-lg shadow-lg">
        {playing ? (
          <video
            src="/videos/unboxing.mp4"
            poster="/images/reviews/unboxing-poster.webp"
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            data-testid="unboxing-video-player"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative w-full h-full"
            aria-label="Play customer unboxing video"
            data-testid="unboxing-play-button"
          >
            <img
              src="/images/reviews/unboxing-poster.webp"
              alt="Customer unboxing The Aarsha Label"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/90 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-[#7A1F3D] ml-1" fill="#7A1F3D" />
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
