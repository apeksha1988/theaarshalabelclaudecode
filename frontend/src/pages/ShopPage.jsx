import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import { GROUPS, productGroup, groupLabel } from '../lib/productGroups';
import { applySeo } from '../lib/seo';
import { SHOP_CONTENT, faqJsonLd } from '../lib/shopContent';
import { getCachedProducts, setCachedProducts } from '../lib/productCache';

const CATEGORY_LABELS = { premium_heritage: 'Premium Heritage', oxidised: 'Oxidised' };

// Search words that mean a whole category -> the product group they map to.
const SEARCH_GROUP_SYNONYMS = {
  necklace: 'necklace', necklaces: 'necklace', haar: 'necklace', choker: 'necklace', chokers: 'necklace', pendant: 'necklace',
  earring: 'earrings', earrings: 'earrings', jhumka: 'earrings', jhumkas: 'earrings', jhumki: 'earrings', chandbali: 'earrings',
  bracelet: 'bracelet', bracelets: 'bracelet',
  hathphool: 'hathphool',
};

export default function ShopPage() {
  const [products, setProducts] = useState(() => getCachedProducts() || []);
  const [loading, setLoading] = useState(() => !getCachedProducts());
  const [sortBy, setSortBy] = useState('featured');
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = (searchParams.get('search') || '').trim().toLowerCase();

  const selectType = (value) => {
    if (value === 'all') setSearchParams({});
    else setSearchParams({ type: value });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        setCachedProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter by category (from nav/footer links) and type (shop buttons).
  let filtered = products;
  if (category !== 'all') filtered = filtered.filter((p) => p.category === category);
  if (type !== 'all') filtered = filtered.filter((p) => productGroup(p) === type);

  // Search: category words ("earrings", "necklace"…) filter by product group;
  // other words ("emerald", "moissanite"…) match the product name. This keeps
  // results relevant instead of matching every set that mentions "earrings".
  if (search) {
    const terms = search.split(/\s+/).filter(Boolean);
    const groupTerms = terms.filter((t) => SEARCH_GROUP_SYNONYMS[t]);
    const textTerms = terms.filter((t) => !SEARCH_GROUP_SYNONYMS[t]);
    filtered = filtered.filter((p) => {
      const g = productGroup(p);
      if (groupTerms.some((t) => SEARCH_GROUP_SYNONYMS[t] !== g)) return false;
      const name = (p.name || '').toLowerCase();
      return textTerms.every((t) => name.includes(t));
    });
  }

  const hasPrice = (p) => p.price !== null && p.price !== undefined;
  const byPrice = (a, b) => {
    if (!hasPrice(a) && !hasPrice(b)) return 0;
    if (!hasPrice(a)) return 1;
    if (!hasPrice(b)) return -1;
    return sortBy === 'price_desc' ? b.price - a.price : a.price - b.price;
  };

  // Default ("Featured") order: Necklaces & Sets first, then Earrings,
  // Bracelets and Hathphool — cheapest first within each group.
  const GROUP_RANK = { necklace: 0, earrings: 1, bracelet: 2, hathphool: 3 };
  const groupRank = (p) => GROUP_RANK[productGroup(p)] ?? 9;
  const byFeatured = (a, b) => (groupRank(a) - groupRank(b)) || byPrice(a, b);

  const sortedProducts = [...filtered].sort(sortBy === 'featured' ? byFeatured : byPrice);

  // Only offer type filters that actually have products.
  const presentGroups = new Set(products.map(productGroup));
  const typeFilters = [{ value: 'all', label: 'All' }, ...GROUPS.filter((g) => presentGroups.has(g.key)).map((g) => ({ value: g.key, label: g.label }))];

  const heading = type !== 'all' ? groupLabel(type)
    : category !== 'all' ? (CATEGORY_LABELS[category] || 'Statement Jewellery')
    : 'Statement Jewellery';

  // SEO content block for the active category (intro paragraph + FAQs).
  const seoKey = type !== 'all' ? type : category !== 'all' ? category : 'all';
  const content = SHOP_CONTENT[seoKey] || SHOP_CONTENT.all;

  useEffect(() => {
    const title = heading === 'Statement Jewellery' ? 'Shop Jewellery' : `Shop ${heading}`;
    applySeo({
      title,
      description: content.intro.slice(0, 160),
      path: '/shop',
      jsonLd: faqJsonLd(content.faqs),
    });
  }, [heading, content]);

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="shop-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <PromoBanner />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-8">
          {!search && (
            <>
              {/* Compact heading kept for SEO/structure; the descriptive intro
                  lives below the products so the grid is visible immediately. */}
              <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-tight text-[#1A1A1A] mb-5" data-testid="shop-title">
                {heading}
              </h1>

              <div className="flex justify-center gap-3 flex-wrap">
                {typeFilters.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => selectType(c.value)}
                    className={`px-5 py-2 text-sm tracking-wide uppercase transition-all duration-300 ${
                      type === c.value
                        ? 'bg-[#7A1F3D] text-white'
                        : 'bg-transparent border border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white'
                    }`}
                    data-testid={`filter-${c.value}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-center sm:justify-end items-center gap-2 mt-8">
            <label htmlFor="sort" className="text-xs uppercase tracking-wide text-[#666666]">Sort by</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-[#EAE5D9] bg-white px-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7A1F3D]"
              data-testid="sort-select"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20" data-testid="loading-products">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]"></div>
              <p className="mt-4 text-[#666666]">Loading products...</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products">
            <p className="text-[#666666]">No products found in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" data-testid="products-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {/* Category description — kept below the grid for SEO */}
        {!search && (
          <p className="max-w-3xl mx-auto mt-24 text-center text-sm font-light leading-relaxed text-[#666666]" data-testid="shop-intro">
            {content.intro}
          </p>
        )}

        {/* FAQs (rich-result eligible via FAQPage JSON-LD) */}
        {!search && (
          <section className="max-w-3xl mx-auto mt-16" data-testid="shop-faq">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-center text-[#1A1A1A] mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {content.faqs.map((f) => (
                <details key={f.q} className="group bg-[#F5F0E6] px-6 py-4">
                  <summary className="cursor-pointer list-none flex justify-between items-center gap-4 text-sm md:text-base font-medium text-[#1A1A1A]">
                    {f.q}
                    <span className="text-[#7A1F3D] text-xl leading-none transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-[#666666] leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
