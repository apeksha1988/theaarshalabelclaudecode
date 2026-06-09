import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Package, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import TryOnModal from '../components/TryOnModal';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

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
            <div className="bg-[#F5F0E6] aspect-square overflow-hidden mb-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-main-image"
              />
            </div>
            <button
              onClick={() => setShowTryOn(true)}
              className="w-full flex items-center justify-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#7A1F3D] hover:text-white transition-all duration-300"
              data-testid="try-on-button"
            >
              <Sparkles className="w-4 h-4" /> Try It On
            </button>
          </div>

          {/* Product Info */}
          <div className="lg:pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4" data-testid="product-category">
              {product.product_type || product.category}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-6" data-testid="product-title">
              {product.name}
            </h1>
            <p className="text-3xl font-light text-[#1A1A1A] mb-8" data-testid="product-price-detail">
              {formatPrice(product.price, product.currency)}
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
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="w-10 h-10 border border-[#EAE5D9] flex items-center justify-center hover:border-[#7A1F3D] transition-colors"
                      data-testid="increase-quantity"
                    >
                      +
                    </button>
                  </div>
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
                  onClick={() => navigate('/cart')}
                  className="w-full bg-transparent border border-[#7A1F3D] text-[#7A1F3D] px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#7A1F3D] hover:text-white transition-all duration-300"
                  data-testid="view-cart-button"
                >
                  View Cart
                </button>
              </div>
            ) : (
              <div className="p-6 bg-[#F5F0E6] border border-[#EAE5D9]" data-testid="enquire-message">
                <p className="text-[#1A1A1A] font-serif text-lg">Price on Request</p>
                <p className="text-sm text-[#666666] mt-1">
                  This piece is available to order on enquiry. Please contact us for pricing and availability.
                </p>
              </div>
            )}

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
      </div>

      {showTryOn && (
        <TryOnModal product={product} onClose={() => setShowTryOn(false)} />
      )}
    </div>
  );
}