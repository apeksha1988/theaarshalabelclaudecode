import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard } from 'lucide-react';
import { trackBeginCheckout, trackPurchase } from '../lib/analytics';

// Lazily load Razorpay Checkout only when needed (on the checkout page).
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
  });

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    trackBeginCheckout(cartItems, cartTotal / 100);

    const redirectUrl = window.location.origin + '/checkout/result';
    const payload = {
      email: formData.email,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images[0],
      })),
      currency: 'INR',
      shipping_address: {
        name: formData.name,
        line1: formData.line1,
        line2: formData.line2 || '',
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        phone: formData.phone || '',
      },
      redirect_url: redirectUrl,
    };

    try {
      // 1) Create a Razorpay order on the backend.
      const { data } = await api.post('/checkout/order', payload);

      // 2) Load Razorpay Checkout and open the payment modal.
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        alert('Could not load the payment gateway. Please check your connection and try again.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "The Aarsha Label",
        description: 'Jewellery Order',
        order_id: data.razorpay_order_id,
        prefill: {
          name: data.prefill_name || formData.name,
          email: data.prefill_email || formData.email,
          contact: data.prefill_contact || formData.phone,
        },
        theme: { color: '#7A1F3D' },
        // 3) On success, verify the signature server-side, then show the result.
        handler: async (response) => {
          try {
            await api.post('/checkout/verify', {
              order_id: data.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            // The webhook is a server-side backstop; continue to the result page.
            console.error('Verification error:', err);
          }
          trackPurchase(data.order_id, cartItems, cartTotal / 100);
          clearCart();
          navigate(`/checkout/result?order_id=${data.order_id}`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.on('payment.failed', () => setLoading(false));
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      const detail = error?.response?.data?.detail;
      alert(detail || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-12" data-testid="checkout-title">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-[#F5F0E6] p-8">
                <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="checkout-email"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#F5F0E6] p-8">
                <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="checkout-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="line1" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      id="line1"
                      type="text"
                      value={formData.line1}
                      onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                      className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="checkout-address1"
                    />
                  </div>
                  <div>
                    <label htmlFor="line2" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                      Address Line 2
                    </label>
                    <input
                      id="line2"
                      type="text"
                      value={formData.line2}
                      onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                      className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      data-testid="checkout-address2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                        required
                        data-testid="checkout-city"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                        State *
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                        required
                        data-testid="checkout-state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postal_code" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                        Postal Code *
                      </label>
                      <input
                        id="postal_code"
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                        required
                        data-testid="checkout-postal"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                        Country *
                      </label>
                      <input
                        id="country"
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                        required
                        data-testid="checkout-country"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="checkout-phone"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="checkout-submit-button"
              >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard className="w-5 h-5" /> Complete Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F5F0E6] p-8 sticky top-32">
              <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-6" data-testid="checkout-summary-title">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex gap-4 pb-4 border-b border-[#EAE5D9]" data-testid={`checkout-item-${item.product_id}`}>
                    <div className="w-16 h-16 bg-[#FDFBF7] overflow-hidden flex-shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A1A1A]">{item.name}</p>
                      <p className="text-sm text-[#666666]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm text-[#1A1A1A]">₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</p>
                  </div>
                ))}
                <div className="border-t border-[#EAE5D9] pt-4">
                  <div className="flex justify-between text-xl font-serif">
                    <span className="text-[#1A1A1A]">Total</span>
                    <span className="text-[#1A1A1A]" data-testid="checkout-total">₹{(cartTotal / 100).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}