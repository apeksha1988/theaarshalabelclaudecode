import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applySeo } from '../lib/seo';

// Shown for any unknown route (catch-all). Marked noindex so Google doesn't
// index mistyped/old URLs.
export default function NotFoundPage() {
  useEffect(() => {
    applySeo({ title: 'Page Not Found', path: '/404', noindex: true });
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-6" data-testid="not-found-page">
      <div className="text-center max-w-md">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#7A1F3D] mb-3">Error 404</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A] mb-4">
          This page couldn&rsquo;t be found
        </h1>
        <p className="text-[#666666] mb-8">
          The link may be broken or the page may have moved. Let&rsquo;s get you back to the jewellery.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-block bg-[#7A1F3D] text-white px-8 py-3.5 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/shop"
            className="inline-block border border-[#7A1F3D] text-[#7A1F3D] px-8 py-3.5 text-sm tracking-[0.1em] uppercase hover:bg-[#7A1F3D] hover:text-white transition-all"
          >
            Shop Jewellery
          </Link>
        </div>
      </div>
    </div>
  );
}
