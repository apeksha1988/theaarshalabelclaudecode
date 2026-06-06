import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function CheckoutResultPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        // Payment is verified in the checkout handler before we get here, so the
        // order should already be 'paid'. Retry briefly in case the webhook
        // backstop is still settling the status.
        let data = null;
        for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
          const response = await api.get(`/orders/${orderId}`);
          data = response.data;
          if (data.status === 'paid' || data.status === 'payment_failed') break;
          await new Promise((r) => setTimeout(r, 2000));
        }
        if (!cancelled) setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center" data-testid="loading-order">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]"></div>
          <p className="mt-4 text-[#666666]">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center" data-testid="order-not-found">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-[#D32F2F] mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-light text-[#1A1A1A] mb-4">Order Not Found</h2>
          <Link to="/shop" className="text-[#7A1F3D] hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid';

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="checkout-result-page">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          {isPaid ? (
            <>
              <CheckCircle className="w-16 h-16 text-[#388E3C] mx-auto mb-6" data-testid="success-icon" />
              <h1 className="text-4xl font-serif font-light text-[#1A1A1A] mb-4" data-testid="success-title">
                Order Confirmed!
              </h1>
              <p className="text-[#666666]" data-testid="success-message">
                Thank you for your purchase. You'll receive a confirmation email shortly.
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-[#D32F2F] mx-auto mb-6" data-testid="pending-icon" />
              <h1 className="text-4xl font-serif font-light text-[#1A1A1A] mb-4" data-testid="pending-title">
                Order Pending
              </h1>
              <p className="text-[#666666]" data-testid="pending-message">
                Your order is pending payment confirmation.
              </p>
            </>
          )}
        </div>

        <div className="bg-[#F5F0E6] p-8 mb-8">
          <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-6" data-testid="order-details-title">Order Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[#666666]">Order ID</span>
              <span className="text-[#1A1A1A] font-medium" data-testid="order-id">{order.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Status</span>
              <span className={`font-medium ${
                isPaid ? 'text-[#388E3C]' : 'text-[#D32F2F]'
              }`} data-testid="order-status">{
                order.status.replace('_', ' ').toUpperCase()
              }</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Total</span>
              <span className="text-[#1A1A1A] font-medium" data-testid="order-total-amount">₹{(order.total / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F0E6] p-8 mb-8">
          <h3 className="text-xl font-serif font-medium text-[#1A1A1A] mb-4" data-testid="items-title">Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between" data-testid={`order-item-${index}`}>
                <div>
                  <p className="text-[#1A1A1A]">{item.name}</p>
                  <p className="text-sm text-[#666666]">Qty: {item.quantity}</p>
                </div>
                <p className="text-[#1A1A1A]">₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            to="/shop"
            className="inline-block bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300"
            data-testid="continue-shopping-button"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}