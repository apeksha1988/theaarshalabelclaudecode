import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, ChevronDown, Heart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glassmorphism fixed top-0 w-full z-50 border-b border-[#EAE5D9]" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center" data-testid="nav-logo">
            <img 
              src="/images/logo.webp"
              alt="The Aarsha Label"
              className="h-20 w-auto object-contain"
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
                  <Link to="/shop?type=necklace" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-necklace">Necklaces &amp; Sets</Link>
                  <Link to="/shop?type=earrings" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-earrings">Earrings</Link>
                  <Link to="/shop?type=bracelet" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-bracelet">Bracelets</Link>
                  <Link to="/shop?type=hathphool" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-shop-hathphool">Hathphool</Link>
                </div>
              </div>
            </div>

            <Link to="/contact" className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-contact">Contact</Link>

            <form onSubmit={submitSearch} className="relative" data-testid="nav-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery"
                className="w-44 border border-[#EAE5D9] bg-white/70 rounded-full pl-4 pr-9 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7A1F3D] transition-colors"
                data-testid="nav-search-input"
                aria-label="Search jewellery"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A1F3D]" aria-label="Search">
                <Search className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>

            {user ? (
              <div className="relative group" data-testid="nav-profile-dropdown">
                <button type="button" className="inline-flex items-center gap-1 hover:text-[#7A1F3D] transition-colors" data-testid="nav-profile" aria-label="Profile">
                  <User className="w-5 h-5" strokeWidth={1.5} />
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                  <div className="bg-[#FDFBF7] border border-[#EAE5D9] shadow-xl min-w-[210px] py-2">
                    <Link to="/dashboard" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-dashboard">My Profile</Link>
                    <Link to="/wishlist" className="flex items-center justify-between px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-wishlist">
                      <span className="inline-flex items-center gap-2"><Heart className="w-4 h-4" strokeWidth={1.5} /> Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="bg-[#7A1F3D] text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center" data-testid="wishlist-count">{wishlistCount}</span>
                      )}
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-admin">Admin</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-5 py-2.5 text-sm tracking-wide uppercase text-[#1A1A1A] hover:bg-[#F5F0E6] hover:text-[#7A1F3D] transition-colors" data-testid="nav-logout">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" data-testid="nav-login">Login</Link>
                <Link to="/wishlist" className="relative" data-testid="nav-wishlist-guest" aria-label="Wishlist">
                  <Heart className="w-5 h-5" strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#7A1F3D] text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
              </>
            )}

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
            <form onSubmit={submitSearch} className="relative" data-testid="nav-search-form-mobile">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery"
                className="w-full border border-[#EAE5D9] bg-white rounded-full pl-4 pr-10 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#7A1F3D]"
                aria-label="Search jewellery"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A1F3D]" aria-label="Search">
                <Search className="w-5 h-5" strokeWidth={2} />
              </button>
            </form>
            <div className="space-y-2" data-testid="nav-shop-mobile">
              <p className="text-sm font-semibold tracking-wide uppercase text-[#1A1A1A]">Shop Jewellery</p>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">All</Link>
              <Link to="/shop?type=necklace" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">Necklaces &amp; Sets</Link>
              <Link to="/shop?type=earrings" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">Earrings</Link>
              <Link to="/shop?type=bracelet" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">Bracelets</Link>
              <Link to="/shop?type=hathphool" onClick={() => setMobileMenuOpen(false)} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors">Hathphool</Link>
            </div>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors">Contact</Link>
            {user ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold tracking-wide uppercase text-[#1A1A1A]">Profile</p>
                <Link to="/dashboard" className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                <Link to="/wishlist" className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block pl-4 text-sm tracking-wide uppercase text-[#666666] hover:text-[#7A1F3D] transition-colors text-left w-full">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/wishlist" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Link>
              </>
            )}
            <Link to="/cart" className="block text-sm font-medium tracking-wide uppercase hover:text-[#7A1F3D] transition-colors" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
          </div>
        )}
      </div>
    </nav>
  );
}