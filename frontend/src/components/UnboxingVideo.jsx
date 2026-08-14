import React, { useState } from 'react';
import { Play } from 'lucide-react';

// Real customer videos on the homepage. Performance-safe: only the small poster
// images load with the page (lazily); each video is fetched ONLY when the user
// taps play, so they add nothing to initial page load.
const VIDEOS = [
  {
    src: '/videos/review-1.mp4',
    poster: '/images/reviews/review-1-poster.webp',
    label: 'A customer sharing her look',
  },
  {
    src: '/videos/unboxing.mp4',
    poster: '/images/reviews/unboxing-poster.webp',
    label: 'Real customer unboxing',
  },
];

function VideoCard({ src, poster, label }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="w-full max-w-[210px] aspect-[9/16] bg-[#F5F0E6] overflow-hidden rounded-lg shadow-lg">
      {playing ? (
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          data-testid="homepage-video-player"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative w-full h-full"
          aria-label={`Play: ${label}`}
          data-testid="unboxing-play-button"
        >
          <img src={poster} alt={label} loading="lazy" className="w-full h-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-lg group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-[#7A1F3D] ml-0.5" fill="#7A1F3D" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export default function UnboxingVideo() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 sm:py-16" data-testid="unboxing-video">
      <div className="text-center mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A1F3D] mb-3">Straight from our customers</p>
        <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">
          Loved &amp; Worn
        </h2>
        <p className="mt-3 text-sm text-[#666666] max-w-md mx-auto">
          Real pieces, real packaging, real reactions — see what our customers say.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
        {VIDEOS.map((v) => (
          <VideoCard key={v.src} {...v} />
        ))}
      </div>
    </section>
  );
}
