import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import UnboxingVideo from '../components/UnboxingVideo';
import { productGroup } from '../lib/productGroups';
import { applySeo } from '../lib/seo';
import { getCachedProducts, setCachedProducts } from '../lib/productCache';

// Rotating product images behind a fixed hero message. Product-only shots
// (smaller -hero variants) so the focus stays on the jewellery and the
// landing page loads fast.
const HERO_IMAGES = [
  { image: '/images/heritage-kundan-necklace-set-hero.webp', position: 'center' },
  { image: '/images/gulbahar-heritage-necklace-set-hero.webp', position: 'center' },
  { image: '/images/sabyasachi-inspired-necklace-set-hero.webp', position: 'center' },
  { image: '/images/emerald-veena-kundan-haar-set-hero.webp', position: 'center' },
  { image: '/images/sabyasachi-inspired-royale-necklace-set-hero.webp', position: 'center' },
];

export default function Homepage() {
  const [products, setProducts] = useState(() => getCachedProducts() || []);
  const [loading, setLoading] = useState(() => !getCachedProducts());
  const [slide, setSlide] = useState(0);
  // Only mount carousel images once they've been shown (plus the next one),
  // so the landing page loads just the first image instead of all five.
  const [shownSlides, setShownSlides] = useState(() => new Set([0, 1]));

  useEffect(() => {
    applySeo({ path: '/' });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setShownSlides((prev) => {
      const next = (slide + 1) % HERO_IMAGES.length;
      if (prev.has(slide) && prev.has(next)) return prev;
      return new Set(prev).add(slide).add(next);
    });
  }, [slide]);

  const goTo = (i) => setSlide((i + HERO_IMAGES.length) % HERO_IMAGES.length);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/products');
        if (!cancelled) {
          setProducts(res.data);
          setCachedProducts(res.data);
        }
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

  // Collection order: Necklaces & Sets first, then Earrings (then any other
  // groups), and cheapest-first within each group. Items without a price
  // ("Price on Request") always sort to the end.
  const hasPrice = (p) => p.price !== null && p.price !== undefined;
  const GROUP_RANK = { necklace: 0, earrings: 1, bracelet: 2, hathphool: 3 };
  const rank = (p) => GROUP_RANK[productGroup(p)] ?? 9;
  const sortedProducts = [...products].sort((a, b) => {
    const byGroup = rank(a) - rank(b);
    if (byGroup !== 0) return byGroup;
    if (!hasPrice(a) && !hasPrice(b)) return 0;
    if (!hasPrice(a)) return 1;
    if (!hasPrice(b)) return -1;
    return a.price - b.price;
  });

  return (
    <div className="min-h-screen" data-testid="homepage">
      {/* Hero Carousel: rotating product images, fixed text.
          Deliberately shorter than the viewport so the collection below peeks
          above the fold — a full-screen hero was losing ~90% of visitors. */}
      <section className="relative h-[78vh] sm:h-[82vh] overflow-hidden" data-testid="hero-carousel">
        {/* Rotating background images */}
        {HERO_IMAGES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === slide ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== slide}
          >
            {shownSlides.has(i) && (
              <img
                src={s.image}
                alt=""
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: s.position }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/15" />
          </div>
        ))}

        {/* Fixed text overlay — top padding clears the fixed nav so the
            title never hides under it on shorter viewports. */}
        <div className="relative z-10 h-full flex items-center justify-center pt-24 pb-6 pointer-events-none">
          <div className="text-center max-w-3xl mx-auto px-6 text-white pointer-events-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight mb-5" data-testid="hero-title">
              Radiate.Timeless.Elegance
            </h1>
            <p className="text-base sm:text-lg font-light leading-relaxed text-white/90 mb-6 max-w-2xl mx-auto" data-testid="hero-subtitle">
              Exquisite Kundan, Polki & Moissanite jewellery, handcrafted for your forever moments.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/40 text-white px-5 py-2 rounded-full text-sm font-medium mb-5 backdrop-blur-sm" data-testid="hero-promo">
              🎁 First order? Use code <span className="font-semibold tracking-wider">WELCOME10</span> for 10% off
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs sm:text-sm text-white/95 mb-8" data-testid="hero-delivery">
              <span className="font-medium">🚚 Free Delivery across India</span>
              <span className="opacity-40 hidden sm:inline">|</span>
              <span className="font-medium">💵 Cash on Delivery Available</span>
            </div>
            <div className="flex justify-center">
              <Link
                to="/shop"
                className="bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 inline-flex items-center justify-center gap-2"
                data-testid="hero-shop-button"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button onClick={() => goTo(slide - 1)} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={() => goTo(slide + 1)} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3" data-testid="hero-dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-white/50 w-2.5 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-10 md:py-16 bg-[#FDFBF7]" data-testid="category-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4">Explore</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#1A1A1A]">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              { label: 'Premium Heritage', sub: 'Kundan · Polki · Moissanite', to: '/shop?category=premium_heritage', image: '/images/heritage-kundan-necklace-set-thumb.webp' },
              { label: 'Oxidised', sub: 'Silver-tone · Statement pieces', to: '/shop?category=oxidised', image: '/images/Oxidised_Necklace-thumb.webp' },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group relative block overflow-hidden aspect-[16/10]"
                data-testid={`category-tile-${c.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
                  <h3 className="text-2xl md:text-3xl font-serif font-light mb-1">{c.label}</h3>
                  <p className="text-xs md:text-sm tracking-wide opacity-90 mb-4">{c.sub}</p>
                  <span className="text-xs uppercase tracking-[0.2em] border-b border-white/70 pb-1">Shop Now</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-8 gap-y-8 sm:gap-y-12" data-testid="home-products-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Real customer unboxing (click-to-play; no impact on page load) */}
      <UnboxingVideo />
    </div>
  );
}
