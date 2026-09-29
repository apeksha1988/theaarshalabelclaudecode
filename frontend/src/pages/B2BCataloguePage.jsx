import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import api from '../lib/api';
import { applySeo } from '../lib/seo';
import { getCachedProducts, setCachedProducts } from '../lib/productCache';
import { BULK_TIERS } from '../lib/b2b';

export default function B2BCataloguePage() {
  const [products, setProducts] = useState(() => getCachedProducts() || []);

  useEffect(() => {
    api.get('/products')
      .then((r) => { setProducts(r.data); setCachedProducts(r.data); })
      .catch((e) => console.error('Failed to fetch products:', e));
  }, []);

  useEffect(() => {
    applySeo({
      title: 'B2B Wholesale Catalogue',
      description:
        'The Aarsha Label wholesale catalogue — the full handcrafted jewellery range with bulk-order discount pricing for boutiques, resellers and stylists.',
      path: '/b2b/catalogue',
    });
  }, []);

  const inr = (p) => (p == null ? 'On request' : `₹${(p / 100).toLocaleString('en-IN')}`);

  // Oxidised jewellery is excluded from the wholesale catalogue.
  const catalogue = products.filter((p) => p.category !== 'oxidised');

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-20" data-testid="b2b-catalogue-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link to="/b2b" className="inline-flex items-center gap-2 text-sm text-[#7A1F3D] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Partnerships
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
          <h1 className="font-serif font-light text-3xl sm:text-4xl text-[#1A1A1A]">B2B Wholesale Catalogue</h1>
        </div>
        <p className="text-sm text-[#666666] max-w-2xl">
          Our full handcrafted range, available at wholesale bulk pricing. Prices shown are retail —
          your discount applies by order size:
        </p>

        {/* Bulk tiers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 mb-4">
          {BULK_TIERS.map((t) => (
            <div key={t.label}
              className={`rounded-lg p-4 text-center border ${t.highlight ? 'border-[#7A1F3D] bg-[#7A1F3D] text-white' : 'border-[#EAE5D9] bg-[#F5F0E6] text-[#1A1A1A]'}`}>
              <p className={`text-[11px] uppercase tracking-[0.1em] mb-1 ${t.highlight ? 'text-[#F0C96B]' : 'text-[#7A1F3D]'}`}>{t.label}</p>
              <p className="font-serif text-xl font-light">{t.discount}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE5D9] pt-6 mt-8 mb-8">
          <p className="text-sm text-[#666666]">{catalogue.length} designs available for wholesale</p>
          <Link to="/b2b#partner-form"
            className="inline-flex items-center gap-2 bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-colors">
            Request wholesale pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product grid */}
        {catalogue.length === 0 ? (
          <p className="text-center py-16 text-[#666666]">Loading the catalogue…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8" data-testid="b2b-catalogue-grid">
            {catalogue.map((p) => {
              const img = (p.images && p.images[0]) || '';
              const thumb = img.replace(/\.webp$/i, '-thumb.webp');
              return (
                <Link key={p.product_id} to={`/product/${p.product_id}`} className="group block" data-testid="b2b-catalogue-item">
                  <div className="bg-[#F5F0E6] aspect-[4/5] overflow-hidden mb-3">
                    <img
                      src={thumb}
                      onError={(e) => { if (img && !e.currentTarget.src.endsWith(img)) e.currentTarget.src = img; }}
                      alt={p.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm font-serif text-[#1A1A1A] leading-snug line-clamp-2">{p.name}</h3>
                  <p className="text-sm text-[#7A1F3D] mt-1">
                    {inr(p.price)} <span className="text-xs text-[#999999]">retail</span>
                  </p>
                  <p className="text-[11px] text-[#8A7B6B] mt-0.5">Bulk discounts apply</p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-16 pt-10 border-t border-[#EAE5D9]">
          <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Ready to stock these?</h3>
          <p className="text-sm text-[#666666] mb-5">Send us your details and we'll share your wholesale price list.</p>
          <Link to="/b2b#partner-form"
            className="inline-flex items-center gap-2 bg-[#7A1F3D] text-white px-8 py-3.5 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-colors">
            Become a Partner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
