import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

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
  const isLimited = /limited|exclusive/i.test(product.availability || '');

  const formatPrice = (price) => {
    if (!hasPrice) return 'Price on Request';
    return `₹${(price / 100).toLocaleString('en-IN')}`;
  };

  const handleAddToCart = (e) => {
    // The card is wrapped in a Link — keep the click from navigating.
    e.preventDefault();
    e.stopPropagation();
    if (!hasPrice) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group flex flex-col" data-testid={`product-card-${product.product_id}`}>
      <Link to={`/product/${product.product_id}`} className="block">
        <div className="relative bg-[#F5F0E6] w-full aspect-[4/5] overflow-hidden mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            data-testid="product-image"
          />
          {isLimited && (
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
        <p className="text-base text-[#7A1F3D] mt-1 font-light tracking-wide" data-testid="product-price">
          {formatPrice(product.price)}
        </p>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={!hasPrice}
        className={`mt-4 w-full px-6 py-3 text-xs tracking-[0.15em] uppercase border transition-all duration-300 flex items-center justify-center gap-2
          ${!hasPrice
            ? 'border-[#EAE5D9] text-[#999999] cursor-not-allowed'
            : added
              ? 'border-[#7A1F3D] bg-[#7A1F3D] text-white'
              : 'border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white'}`}
        data-testid="add-to-cart-button"
      >
        {!hasPrice ? (
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
