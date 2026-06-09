import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, ChevronDown, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="glassmorphism fixed top-0 w-full z-50 border-b border-[#EAE5D9]" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center" data-testid="nav-logo">
            <img 
              src="/images/logo.webp"
              alt="The Aarsha's Label" 
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group" data-testid="nav-shop-dropdown">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors"
                data-testid="nav-shop"
              >
                Shop Jewellery
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div className="bg-[#FDFBF7] border border-[#EAE5D9] shadow-xl min-w-[210px] py-2">
                  <Link to="/shop" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-all">All</Link>
                  <Link to="/shop?category=premium_heritage" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-premium">Premium Heritage</Link>
                  <Link to="/shop?category=oxidised" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-oxidised">Oxidised</Link>
                </div>
              </div>
            </div>

            <Link to="/contact" className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-contact">Contact</Link>

            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-dashboard">Profile</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-admin">Admin</Link>
                )}
                <button onClick={handleLogout} className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-logout">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-login">Login</Link>
            )}

            <Link to="/wishlist" className="relative" data-testid="nav-wishlist" aria-label="Wishlist">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7A1F3D] text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center" data-testid="wishlist-count">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative" data-testid="nav-cart">
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7A1F3D] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: wishlist + cart icon + menu button */}
          <div className="flex items-center gap-5 md:hidden">
            <Link to="/wishlist" className="relative" data-testid="nav-wishlist-mobile" aria-label="Wishlist">
              <Heart className="w-6 h-6" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7A1F3D] text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative" data-testid="nav-cart-mobile" aria-label="Cart">
              <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7A1F3D] text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center" data-testid="cart-count-mobile">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-button" aria-label="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4" data-testid="mobile-menu">
            <div className="space-y-2" data-testid="nav-shop-mobile">
              <p className="text-sm font-semibold tracking-wide uppercase text-[#1A1A1A]">Shop Jewellery</p>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">All</Link>
              <Link to="/shop?category=premium_heritage" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">Premium Heritage</Link>
              <Link to="/shop?category=oxidised" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">Oxidised</Link>
            </div>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors">Contact</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors text-left w-full">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
            <Link to="/cart" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
          </div>
        )}
      </div>
    </nav>
  );
}