import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Package, Truck } from 'lucide-react';
import api from '../lib/api';
import { useCart, MAX_QTY } from '../context/CartContext';
import TrustBadges from '../components/TrustBadges';
import ProductCard from '../components/ProductCard';
import ProductReviews, { ProductRatingInline } from '../components/ProductReviews';
import { productOrderLink } from '../lib/whatsappOrder';
import { applySeo, productJsonLd } from '../lib/seo';
import { productGroup } from '../lib/productGroups';
import { getCachedProducts, setCachedProducts } from '../lib/productCache';

export default function ProductDetailPage() {
  const { productId } = useParams();
  // Seed straight from the cached snapshot so the product renders on the very
  // first paint — no "Loading product..." spinner flash.
  const initialCached = (getCachedProducts() || []).find((p) => p.product_id === productId);
  const [product, setProduct] = useState(initialCached || null);
  const [loading, setLoading] = useState(!initialCached);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [allProducts, setAllProducts] = useState(() => getCachedProducts() || []);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Render instantly from the cached/snapshot list (name, price, image),
    // then load the full product (description, all images) in the background.
    // Avoids a 30–50s "Loading product..." wait during a Render cold start.
    const cached = (getCachedProducts() || []).find((p) => p.product_id === productId);
    if (cached) {
      setProduct(cached);
      setLoading(false);
    } else {
      setProduct(null);
      setLoading(true);
    }
    fetchProduct();
    setActiveImage(0);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Full catalog (for related products) — cached list shows instantly.
  useEffect(() => {
    let cancelled = false;
    api.get('/products')
      .then((res) => {
        if (cancelled) return;
        setAllProducts(res.data);
        setCachedProducts(res.data);
      })
      .catch((e) => console.error('Failed to fetch products:', e));
    return () => { cancelled = true; };
  }, []);

  // Related: same jewellery type first, then same collection, then nearest price.
  const related = useMemo(() => {
    if (!product) return [];
    const group = productGroup(product);
    const rank = (p) =>
      (productGroup(p) === group ? 0 : 100) + (p.category === product.category ? 0 : 10);
    const priceGap = (p) => Math.abs((p.price ?? 0) - (product.price ?? 0));
    return allProducts
      .filter((p) => p.product_id !== product.product_id)
      .sort((a, b) => rank(a) - rank(b) || priceGap(a) - priceGap(b))
      .slice(0, 4);
  }, [product, allProducts]);

  useEffect(() => {
    if (!product) return;
    const price = product.price != null ? ` — ₹${(product.price / 100).toLocaleString('en-IN')}` : '';
    applySeo({
      title: `${product.name}${price}`,
      description: (product.description || '').slice(0, 160),
      image: product.images?.[0],
      path: `/product/${product.product_id}`,
      jsonLd: productJsonLd(product),
    });
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const formatPrice = (price, currency = 'INR') => {
    if (price === null || price === undefined) return 'Price on Request';
    if (currency === 'INR') {
      return `₹${(price / 100).toLocaleString('en-IN')}`;
    }
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center" data-testid="loading-product">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]"></div>
          <p className="mt-4 text-[#666666]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center" data-testid="product-not-found">
        <p className="text-[#666666]">Product not found</p>
      </div>
    );
  }

  const hasPrice = product.price !== null && product.price !== undefined;

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-[#F5F0E6] aspect-[4/5] overflow-hidden mb-4 flex items-center justify-center">
              <img
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
                data-testid="product-main-image"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3" data-testid="product-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`bg-[#F5F0E6] aspect-square overflow-hidden border-2 transition-colors ${
                      i === activeImage ? 'border-[#7A1F3D]' : 'border-transparent hover:border-[#EAE5D9]'
                    }`}
                    aria-label={`View image ${i + 1}`}
                    data-testid={`product-thumbnail-${i}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4" data-testid="product-category">
              {product.product_type || product.category}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4" data-testid="product-title">
              {product.name}
            </h1>
            <ProductRatingInline productId={product.product_id} />
            <p className="text-3xl font-light text-[#1A1A1A] mb-3" data-testid="product-price-detail">
              {formatPrice(product.price, product.currency)}
            </p>
            <p className="flex items-center gap-2 text-sm font-medium text-[#388E3C] mb-8" data-testid="product-free-delivery">
              <Truck className="w-4 h-4" strokeWidth={1.75} /> Free Delivery across India
            </p>
            
            <p className="text-base font-light leading-relaxed text-[#1A1A1A] mb-8" data-testid="product-description">
              {product.description}
            </p>

            {/* Product Details */}
            <div className="bg-[#F5F0E6] p-6 mb-8">
              <h3 className="text-lg font-serif font-medium text-[#1A1A1A] mb-4">Product Details</h3>
              <div className="space-y-3 text-sm">
                {product.set_includes && (
                  <div className="flex">
                    <span className="text-[#666666] w-32">Set Includes:</span>
                    <span className="text-[#1A1A1A] flex-1">{product.set_includes}</span>
                  </div>
                )}
                {product.materials && (
                  <div className="flex">
                    <span className="text-[#666666] w-32">Materials:</span>
                    <span className="text-[#1A1A1A] flex-1">{product.materials}</span>
                  </div>
                )}
                {product.availability && (
                  <div className="flex items-center">
                    <span className="text-[#666666] w-32">Availability:</span>
                    <span className="text-[#388E3C] flex-1 flex items-center gap-2">
                      <Package className="w-4 h-4" /> {product.availability}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {hasPrice ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-[#EAE5D9] flex items-center justify-center hover:border-[#7A1F3D] transition-colors"
                      data-testid="decrease-quantity"
                    >
                      -
                    </button>
                    <span className="text-lg font-light w-12 text-center" data-testid="quantity-display">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(MAX_QTY, quantity + 1))}
                      disabled={quantity >= MAX_QTY}
                      className="w-10 h-10 border border-[#EAE5D9] flex items-center justify-center hover:border-[#7A1F3D] transition-colors disabled:opacity-40 disabled:hover:border-[#EAE5D9] disabled:cursor-not-allowed"
                      data-testid="increase-quantity"
                    >
                      +
                    </button>
                  </div>
                  {quantity >= MAX_QTY && (
                    <p className="text-xs text-[#666666] mt-2">Sorry! We are out of stock</p>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 flex items-center justify-center gap-2"
                  data-testid="add-to-cart-button"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-transparent border border-[#7A1F3D] text-[#7A1F3D] px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#7A1F3D] hover:text-white transition-all duration-300"
                  data-testid="buy-now-button"
                >
                  Buy Now
                </button>

                <a
                  href={productOrderLink(product, quantity)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                  data-testid="order-whatsapp-button"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Order on WhatsApp
                </a>
                <p className="text-xs text-center text-[#666666]">Prefer not to pay online? Order via WhatsApp and pay as you like.</p>
              </div>
            ) : (
              <div className="p-6 bg-[#F5F0E6] border border-[#EAE5D9]" data-testid="enquire-message">
                <p className="text-[#1A1A1A] font-serif text-lg">Price on Request</p>
                <p className="text-sm text-[#666666] mt-1">
                  This piece is available to order on enquiry. Please contact us for pricing and availability.
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-[#EAE5D9]">
              <TrustBadges variant="compact" />
            </div>

            {/* Care Instructions */}
            <div className="mt-8 pt-8 border-t border-[#EAE5D9]">
              <h3 className="text-lg font-serif font-medium text-[#1A1A1A] mb-3">Care Instructions</h3>
              <ul className="text-sm text-[#666666] space-y-2">
                <li>• Store in a cool, dry place away from direct sunlight</li>
                <li>• Keep away from perfumes, chemicals, and water</li>
                <li>• Clean gently with a soft, dry cloth</li>
                <li>• Handle with care to preserve the intricate craftsmanship</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Customer reviews */}
        <ProductReviews productId={product.product_id} />

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#EAE5D9]" data-testid="related-products">
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-center text-[#1A1A1A] mb-12">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}