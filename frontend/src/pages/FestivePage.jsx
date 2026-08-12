import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Gift, Sparkles, IndianRupee } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import { productGroup } from '../lib/productGroups';
import { applySeo } from '../lib/seo';
import { getCachedProducts, setCachedProducts } from '../lib/productCache';

// Festive landing page — a curated place for festive/ad traffic to land, framed
// around the upcoming festivals (Teej & Raksha Bandhan). Renders instantly from
// the cached snapshot, then refreshes from the API in the background.
export default function FestivePage() {
  const [products, setProducts] = useState(() => getCachedProducts() || []);

  useEffect(() => {
    api.get('/products')
      .then((r) => { setProducts(r.data); setCachedProducts(r.data); })
      .catch((e) => console.error('Failed to fetch products:', e));
  }, []);

  useEffect(() => {
    applySeo({
      title: 'Festive Collection — Teej & Raksha Bandhan',
      description:
        'Shop handcrafted festive jewellery for Teej, Raksha Bandhan and the festive season — Kundan, Polki, oxidised & statement sets. Free delivery, COD, 10% off with WELCOME10.',
      path: '/festive',
    });
  }, []);

  // Festive-first ordering: necklace sets & earrings first, cheapest within each.
  const RANK = { necklace: 0, earrings: 1, bracelet: 2, hathphool: 3 };
  const sorted = [...products].sort(
    (a, b) => (RANK[productGroup(a)] ?? 9) - (RANK[productGroup(b)] ?? 9) || ((a.price ?? 0) - (b.price ?? 0))
  );

  const scrollToGrid = (e) => {
    e.preventDefault();
    document.getElementById('festive-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-20" data-testid="festive-page">
      {/* Festive hero */}
      <section className="relative pt-28 sm:pt-32 pb-14 text-center text-white overflow-hidden bg-gradient-to-b from-[#5C172E] via-[#7A1F3D] to-[#6A1B36]">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #F0C96B 0, transparent 25%), radial-gradient(circle at 80% 30%, #F0C96B 0, transparent 22%)' }} />
        <div className="relative max-w-3xl mx-auto px-6">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#F0C96B] mb-4">The Festive Edit</p>
          <h1 className="font-serif font-light text-3xl sm:text-5xl leading-tight mb-4" data-testid="festive-title">
            Celebrate Teej &amp; Rakhi in Your Finest
          </h1>
          <p className="text-sm sm:text-base text-[#EBD8CE] max-w-xl mx-auto mb-7">
            Handcrafted Kundan, Polki &amp; oxidised jewellery for the festive season — for the woman
            dressing up, and the perfect gift for someone you love.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm mb-8">
            <span className="flex items-center gap-1.5"><Gift className="w-4 h-4 text-[#F0C96B]" /> 10% off — <b>WELCOME10</b></span>
            <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#F0C96B]" /> Free delivery</span>
            <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-[#F0C96B]" /> Cash on Delivery</span>
          </div>
          <a
            href="#festive-grid"
            onClick={scrollToGrid}
            className="inline-block bg-[#F0C96B] text-[#5C172E] px-9 py-3.5 text-sm tracking-[0.1em] uppercase font-medium hover:bg-[#e7bb53] transition-colors"
          >
            Shop the Festive Collection
          </a>
        </div>
      </section>

      {/* Occasion cards */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-[#F5F0E6] p-7 flex items-start gap-4">
            <Sparkles className="w-7 h-7 text-[#7A1F3D] shrink-0 mt-1" strokeWidth={1.6} />
            <div>
              <h2 className="font-serif text-xl text-[#1A1A1A] mb-1">Dress up for Teej</h2>
              <p className="text-sm text-[#666666] leading-relaxed">
                Traditional Kundan &amp; oxidised sets, chandbali jhumkas and statement chokers to
                complete your festive look this Teej.
              </p>
            </div>
          </div>
          <div className="bg-[#F5F0E6] p-7 flex items-start gap-4">
            <Gift className="w-7 h-7 text-[#7A1F3D] shrink-0 mt-1" strokeWidth={1.6} />
            <div>
              <h2 className="font-serif text-xl text-[#1A1A1A] mb-1">Gift for Raksha Bandhan</h2>
              <p className="text-sm text-[#666666] leading-relaxed">
                Treat your sister — or yourself — to something handcrafted. Beautifully packaged,
                delivered free, with Cash on Delivery across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <div id="festive-grid" className="max-w-7xl mx-auto px-6 md:px-12 mt-16 scroll-mt-28">
        <div className="text-center mb-8">
          <h2 className="font-serif font-light text-2xl sm:text-3xl text-[#1A1A1A]">Shop the Festive Collection</h2>
          <p className="text-sm text-[#666666] mt-2">Every piece handcrafted · real photos · 10% off with WELCOME10</p>
        </div>
        {sorted.length === 0 ? (
          <p className="text-center py-16 text-[#666666]">Loading the collection…</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-8 gap-y-8 sm:gap-y-12" data-testid="festive-grid-items">
            {sorted.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Trust */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-12 border-t border-[#EAE5D9]">
        <TrustBadges />
        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-block bg-transparent border border-[#7A1F3D] text-[#7A1F3D] px-9 py-3.5 text-sm tracking-[0.1em] uppercase hover:bg-[#7A1F3D] hover:text-white transition-all duration-300"
          >
            Browse All Jewellery
          </Link>
        </div>
      </div>
    </div>
  );
}
