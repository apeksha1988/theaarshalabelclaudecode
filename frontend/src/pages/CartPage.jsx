import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart, MAX_QTY } from '../context/CartContext';
import PromoBanner from '../components/PromoBanner';
import { cartOrderLink } from '../lib/whatsappOrder';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-[#EAE5D9] mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mb-4">Your cart is empty</h2>
          <p className="text-[#666666] mb-8">Discover our beautiful collection</p>
          <Link
            to="/shop"
            className="inline-block bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300"
            data-testid="continue-shopping"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-8">
          <PromoBanner />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-[#1A1A1A] mb-12" data-testid="cart-title">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex gap-6 pb-6 border-b border-[#EAE5D9]" data-testid={`cart-item-${item.product_id}`}>
                <Link
                  to={`/product/${item.product_id}`}
                  className="w-32 h-32 bg-[#F5F0E6] overflow-hidden flex-shrink-0 block"
                  aria-label={`View ${item.name}`}
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    data-testid="cart-item-image"
                  />
                </Link>
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-medium text-[#1A1A1A] mb-2" data-testid="cart-item-name">
                    <Link to={`/product/${item.product_id}`} className="hover:text-[#7A1F3D] transition-colors">
                      {item.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-[#666666] mb-4" data-testid="cart-item-price">₹{(item.price / 100).toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 border border-[#EAE5D9] flex items-center justify-center hover:border-[#7A1F3D] transition-colors"
                      data-testid="cart-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-light w-8 text-center" data-testid="cart-item-quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= MAX_QTY}
                      className="w-8 h-8 border border-[#EAE5D9] flex items-center justify-center hover:border-[#7A1F3D] transition-colors disabled:opacity-40 disabled:hover:border-[#EAE5D9] disabled:cursor-not-allowed"
                      data-testid="cart-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-[#666666] hover:text-[#D32F2F] transition-colors"
                    data-testid="cart-remove-item"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <p className="text-lg font-light text-[#1A1A1A]" data-testid="cart-item-total">
                    ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F5F0E6] p-8 sticky top-32">
              <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-6" data-testid="order-summary-title">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span className="text-[#666666]">Subtotal</span>
                  <span className="text-[#1A1A1A]" data-testid="cart-subtotal">₹{(cartTotal / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-[#666666]">Delivery</span>
                  <span className="text-[#388E3C] font-medium" data-testid="cart-delivery">FREE</span>
                </div>
                <div className="border-t border-[#EAE5D9] pt-4">
                  <div className="flex justify-between text-xl font-serif">
                    <span className="text-[#1A1A1A]">Total</span>
                    <span className="text-[#1A1A1A]" data-testid="cart-total">₹{(cartTotal / 100).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 mb-3"
                data-testid="proceed-checkout-button"
              >
                Proceed to Checkout
              </button>
              <a
                href={cartOrderLink(cartItems, cartTotal)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:opacity-90 transition-all duration-300 mb-2 flex items-center justify-center gap-2"
                data-testid="cart-order-whatsapp-button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order on WhatsApp
              </a>
              <p className="text-xs text-center text-[#666666] mb-4">Prefer not to pay online? Order via WhatsApp.</p>
              <Link
                to="/shop"
                className="block text-center text-sm text-[#666666] hover:text-[#7A1F3D] transition-colors"
                data-testid="continue-shopping-link"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}