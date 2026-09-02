import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { isOutOfStock } from '../lib/stock';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWished } = useWishlist();
  const [added, setAdded] = useState(false);
  const wished = isWished(product.product_id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const hasPrice = product.price !== null && product.price !== undefined;
  const soldOut = isOutOfStock(product);
  const isLimited = !soldOut && /limited|exclusive/i.test(product.availability || '');

  // Use a lightweight card thumbnail (…-thumb.webp) for the grid; fall back to
  // the full image if a thumbnail doesn't exist for this product.
  const fullImage = product.images[0] || '';
  const thumbImage = fullImage.replace(/\.webp$/i, '-thumb.webp');

  const formatPrice = (price) => {
    if (!hasPrice) return 'Price on Request';
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  };

  const handleAddToCart = (e) => {
    // The card is wrapped in a Link — keep the click from navigating.
    e.preventDefault();
    e.stopPropagation();
    if (!hasPrice || soldOut) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group flex flex-col h-full" data-testid={`product-card-${product.product_id}`}>
      <Link to={`/product/${product.product_id}`} className="block">
        <div className="relative bg-[#F5F0E6] w-full aspect-[4/5] overflow-hidden mb-4">
          <img
            src={thumbImage}
            onError={(e) => {
              if (fullImage && !e.currentTarget.src.endsWith(fullImage)) {
                e.currentTarget.src = fullImage;
              }
            }}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? 'opacity-60 grayscale-[35%]' : ''}`}
            data-testid="product-image"
          />
          {soldOut ? (
            <span className="absolute top-3 left-3 bg-[#1A1A1A]/85 text-white text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1 backdrop-blur-sm" data-testid="sold-out-badge">
              Sold Out
            </span>
          ) : isLimited && (
            <span className="absolute top-3 left-3 bg-[#7A1F3D]/90 text-white text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1 backdrop-blur-sm">
              {product.availability}
            </span>
          )}
          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            data-testid="wishlist-toggle"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`w-5 h-5 transition-colors ${wished ? 'fill-[#7A1F3D] text-[#7A1F3D]' : 'text-[#1A1A1A]'}`} strokeWidth={1.5} />
          </button>
        </div>
        <h3 className="text-lg font-serif font-medium text-[#1A1A1A] leading-snug" data-testid="product-name">
          {product.name}
        </h3>
        <p className="text-base text-[#7A1F3D] mt-1 mb-4 font-light tracking-wide" data-testid="product-price">
          {formatPrice(product.price)}
        </p>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={!hasPrice || soldOut}
        className={`mt-auto w-full px-3 sm:px-6 py-3 text-[10px] sm:text-xs tracking-[0.08em] sm:tracking-[0.15em] uppercase whitespace-nowrap border transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2
          ${soldOut
            ? 'border-[#EAE5D9] text-[#999999] cursor-not-allowed'
            : !hasPrice
            ? 'border-[#EAE5D9] text-[#999999] cursor-not-allowed'
            : added
              ? 'border-[#7A1F3D] bg-[#7A1F3D] text-white'
              : 'border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white'}`}
        data-testid="add-to-cart-button"
      >
        {soldOut ? (
          'Sold Out'
        ) : !hasPrice ? (
          'Enquire to Order'
        ) : added ? (
          <>
            <Check className="w-4 h-4" /> Added
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
