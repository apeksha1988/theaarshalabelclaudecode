import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const selectCategory = (value) => {
    if (value === 'all') setSearchParams({});
    else setSearchParams({ category: value });
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = category !== 'all' ? { category } : {};
      const response = await api.get('/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="shop-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4" data-testid="shop-overline">Browse Our Collection</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-[#1A1A1A] mb-8" data-testid="shop-title">
            Statement Jewellery
          </h1>

          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'premium_heritage', label: 'Premium Heritage' },
              { value: 'oxidised', label: 'Oxidised' },
            ].map((c) => (
              <button
                key={c.value}
                onClick={() => selectCategory(c.value)}
                className={`px-6 py-2 text-sm tracking-wide uppercase transition-all duration-300 ${
                  category === c.value
                    ? 'bg-[#7A1F3D] text-white'
                    : 'bg-transparent border border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white'
                }`}
                data-testid={`filter-${c.value}`}
              >
                {c.label}
              </button>
            ))}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}