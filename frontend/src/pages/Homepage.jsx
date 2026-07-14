import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { GROUPS, productGroup } from '../lib/productGroups';

export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/products');
        if (!cancelled) setProducts(res.data);
      } catch (e) {
        console.error('Failed to fetch products:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Show the collection cheapest-first; items without a price ("Price on
  // Request") always sort to the end.
  const hasPrice = (p) => p.price !== null && p.price !== undefined;
  const sortedProducts = [...products].sort((a, b) => {
    if (!hasPrice(a) && !hasPrice(b)) return 0;
    if (!hasPrice(a)) return 1;
    if (!hasPrice(b)) return -1;
    return a.price - b.price;
  });

  // Only show category tiles that actually have products, in GROUPS order.
  const presentGroups = new Set(products.map(productGroup));
  const categoryTiles = GROUPS.filter((g) => presentGroups.has(g.key));

  return (
    <div className="min-h-screen" data-testid="homepage">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/images/hero.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight text-[#1A1A1A] mb-6" data-testid="hero-title">
            Radiate.Timeless.Elegance
          </h1>
          <p className="text-base sm:text-lg font-light leading-relaxed text-[#1A1A1A] mb-6 max-w-2xl mx-auto" data-testid="hero-subtitle">
            Discover exquisite Kundan, Polki, Moissanite, Semi Precious stones jewellery, handcrafted with centuries of tradition.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#7A1F3D]/10 border border-[#7A1F3D]/30 text-[#7A1F3D] px-5 py-2 rounded-full text-sm font-medium mb-8" data-testid="hero-promo">
            🎁 First order? Use code <span className="font-semibold tracking-wider">WELCOME10</span> for 10% off
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 inline-flex items-center justify-center gap-2"
              data-testid="hero-shop-button"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categoryTiles.length > 0 && (
        <section className="py-20 md:py-28 bg-[#FDFBF7]" data-testid="category-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4">Explore</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#1A1A1A]">
                Shop by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {categoryTiles.map((c) => (
                <Link
                  key={c.key}
                  to={`/shop?type=${c.key}`}
                  className="group relative block overflow-hidden aspect-[3/4]"
                  data-testid={`category-tile-${c.key}`}
                >
                  <img
                    src={c.image}
                    alt={c.label}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-3">
                    <h3 className="text-lg md:text-2xl font-serif font-light mb-3">{c.label}</h3>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] border-b border-white/70 pb-1">Shop Now</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collection Section */}
      <section className="py-20 md:py-32 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4" data-testid="collection-overline">Timeless Elegance</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#1A1A1A]" data-testid="collection-title">
              Our Collection
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20" data-testid="loading-products">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]"></div>
                <p className="mt-4 text-[#666666]">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" data-testid="no-products">
              <p className="text-[#666666]">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" data-testid="home-products-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
