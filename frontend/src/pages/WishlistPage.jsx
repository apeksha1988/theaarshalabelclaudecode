import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="wishlist-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A]">
            My Wishlist
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-[#F5F0E6] p-10 text-center" data-testid="empty-wishlist">
            <p className="text-[#666666] mb-4">Your wishlist is empty. Tap the ♥ on any piece to save it here.</p>
            <Link to="/shop" className="text-[#7A1F3D] hover:underline">Browse Jewellery</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {wishlist.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
