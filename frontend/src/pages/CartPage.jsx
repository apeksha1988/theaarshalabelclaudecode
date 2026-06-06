import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

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
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-[#1A1A1A] mb-12" data-testid="cart-title">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex gap-6 pb-6 border-b border-[#EAE5D9]" data-testid={`cart-item-${item.product_id}`}>
                <div className="w-32 h-32 bg-[#F5F0E6] overflow-hidden flex-shrink-0">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    data-testid="cart-item-image"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-medium text-[#1A1A1A] mb-2" data-testid="cart-item-name">{item.name}</h3>
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
                      className="w-8 h-8 border border-[#EAE5D9] flex items-center justify-center hover:border-[#7A1F3D] transition-colors"
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
                  <span className="text-[#666666]">Shipping</span>
                  <span className="text-[#1A1A1A]">Calculated at checkout</span>
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
                className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 mb-4"
                data-testid="proceed-checkout-button"
              >
                Proceed to Checkout
              </button>
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