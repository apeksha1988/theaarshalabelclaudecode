import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import { productGroup, groupLabel, STYLES, styleLabel, styleMatch } from '../lib/productGroups';
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

// One sidebar filter group: a heading and a vertical list of options.
function FilterGroup({ title, options, active, onSelect, testidPrefix }) {
  return (
    <div className="mb-7">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#999999] mb-3">{title}</p>
      <ul className="space-y-1.5">
        {options.map((o) => {
          const isActive = active === o.value;
          return (
            <li key={o.value}>
              <button
                onClick={() => onSelect(o.value)}
                className={`w-full text-left text-sm py-0.5 flex items-center transition-colors ${
                  isActive ? 'text-[#7A1F3D] font-medium' : 'text-[#555555] hover:text-[#7A1F3D]'
                }`}
                data-testid={`filter-${testidPrefix}-${o.value}`}
              >
                <span className={`w-3 inline-block text-[#7A1F3D] ${isActive ? 'opacity-100' : 'opacity-0'}`}>›</span>
                {o.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState(() => getCachedProducts() || []);
  const [loading, setLoading] = useState(() => !getCachedProducts());
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || 'all';
  const style = searchParams.get('style') || 'all';
  const search = (searchParams.get('search') || '').trim().toLowerCase();

  // Set one on-page filter (category or style) while keeping the other. Clears
  // the legacy nav "type" filter and any search so the taxonomies don't mix.
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.delete('type');
    next.delete('search');
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});
  const hasActiveFilters = category !== 'all' || style !== 'all' || type !== 'all';

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

  // Filter by category (Shop by Type), style (Shop by Style) and the legacy
  // "type" group (from the nav dropdown). All combine as AND.
  let filtered = products;
  if (category !== 'all') filtered = filtered.filter((p) => p.category === category);
  if (style !== 'all') filtered = filtered.filter(styleMatch(style));
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

  // Shop by Type (material) filter buttons.
  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'premium_heritage', label: 'Premium Heritage' },
    { value: 'oxidised', label: 'Oxidised' },
  ];

  // Shop by Style buttons — only offer styles that actually have products, so
  // the Bridal filter stays hidden until its curated list is populated.
  const styleFilters = [
    { value: 'all', label: 'All' },
    ...STYLES.filter((s) => products.some(s.match)).map((s) => ({ value: s.key, label: s.label })),
  ];

  const heading = style !== 'all' ? styleLabel(style)
    : category !== 'all' ? (CATEGORY_LABELS[category] || 'Statement Jewellery')
    : type !== 'all' ? groupLabel(type)
    : 'Statement Jewellery';

  // SEO content block for the active filter (intro paragraph + FAQs).
  const seoKey = style !== 'all' ? style : type !== 'all' ? type : category !== 'all' ? category : 'all';
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

  const productsSection = loading ? (
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-8 gap-y-8 sm:gap-y-12" data-testid="products-grid">
      {sortedProducts.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );

  // The filter groups, shared by the desktop sidebar and the mobile drawer.
  const filterPanel = (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm uppercase tracking-[0.15em] text-[#1A1A1A]">Filters</h2>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-[#7A1F3D] hover:underline" data-testid="clear-filters">
            Clear all
          </button>
        )}
      </div>
      <FilterGroup title="Shop by Type" options={typeFilters} active={category} onSelect={(v) => setFilter('category', v)} testidPrefix="type" />
      <FilterGroup title="Shop by Style" options={styleFilters} active={style} onSelect={(v) => setFilter('style', v)} testidPrefix="style" />
    </>
  );

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-20" data-testid="shop-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-4 sm:mb-6">
        <PromoBanner />
      </div>

      {search ? (
        // Search results: no filters/sidebar — show matching products first.
        <div className="max-w-7xl mx-auto px-6 md:px-12">{productsSection}</div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:flex lg:gap-10">
          {/* Left filter sidebar (desktop) / collapsible drawer (mobile) */}
          <aside className="lg:w-56 lg:shrink-0 mb-6 lg:mb-0">
            <button
              className="lg:hidden w-full flex items-center justify-between border border-[#EAE5D9] px-4 py-3 mb-3 text-sm uppercase tracking-wide text-[#1A1A1A]"
              onClick={() => setFiltersOpen((o) => !o)}
              data-testid="filters-toggle"
            >
              <span>Filters{hasActiveFilters ? ' •' : ''}</span>
              <span className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-28 border border-[#EAE5D9] lg:border-0 p-5 lg:p-0`}>
              {filterPanel}
            </div>
          </aside>

          {/* Main column: heading + sort, product grid, SEO content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-tight text-[#1A1A1A]" data-testid="shop-title">
                {heading}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="sort" className="hidden sm:inline text-xs uppercase tracking-wide text-[#666666]">Sort by</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-[#EAE5D9] bg-white px-3 sm:px-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7A1F3D]"
                  data-testid="sort-select"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {productsSection}

            {/* Category description — kept below the grid for SEO */}
            <p className="max-w-3xl mx-auto mt-24 text-center text-sm font-light leading-relaxed text-[#666666]" data-testid="shop-intro">
              {content.intro}
            </p>

            {/* FAQs (rich-result eligible via FAQPage JSON-LD) */}
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
          </div>
        </div>
      )}
    </div>
  );
}
