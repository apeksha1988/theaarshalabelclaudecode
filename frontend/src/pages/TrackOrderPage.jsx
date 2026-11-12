import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import ReturnRequestModal from '../components/ReturnRequestModal';
import { applySeo } from '../lib/seo';

const STAGES = [
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];
const RETURN_WINDOW_DAYS = 2;
function returnEligible(order) {
  if (order.fulfillment_status !== 'delivered' || order.return_request) return false;
  const d = new Date(order.delivered_at || order.updated_at || 0).getTime();
  return d > 0 && Date.now() <= d + RETURN_WINDOW_DAYS * 86400000;
}
const RETURN_LABELS = { requested: 'Return requested', approved: 'Return approved', rejected: 'Return not approved' };
const RETURN_COLORS = { requested: '#C0672A', approved: '#2E7D32', rejected: '#B23A48' };

function Timeline({ status }) {
  const idx = Math.max(0, STAGES.findIndex((s) => s.key === status));
  return (
    <div className="mt-5">
      <div className="flex items-center">
        {STAGES.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${i <= idx ? 'bg-[#7A1F3D]' : 'bg-[#D8CFC0]'}`} />
            {i < STAGES.length - 1 && <div className={`h-0.5 flex-1 ${i < idx ? 'bg-[#7A1F3D]' : 'bg-[#D8CFC0]'}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex mt-2">
        {STAGES.map((s, i) => (
          <span key={s.key} className={`flex-1 text-[10px] sm:text-xs leading-tight ${i === 0 ? 'text-left' : i === STAGES.length - 1 ? 'text-right' : 'text-center'} ${i <= idx ? 'text-[#7A1F3D] font-medium' : 'text-[#999999]'}`}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => { applySeo({ title: 'Track or Return an Order', path: '/track-order' }); }, []);

  const lookup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!orderId.trim() || !email.trim()) { setError('Please enter your order ID and email.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/orders/lookup', { order_id: orderId.trim(), email: email.trim() });
      setOrder(res.data);
    } catch (err) {
      setOrder(null);
      setError(err?.response?.data?.detail || 'Could not find that order. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmed = order && (order.status === 'paid' || order.status === 'cod_confirmed');

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="track-order-page">
      <div className="max-w-2xl mx-auto px-6 md:px-12">
        <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-3">Track or Return an Order</h1>
        <p className="text-[#666666] mb-8">
          Enter your order ID and the email you used at checkout. You can follow your order, or report a damaged item within 2 days of delivery.
        </p>

        <form onSubmit={lookup} className="bg-[#F5F0E6] p-6 space-y-4 mb-8">
          <div>
            <label className="block text-sm uppercase tracking-wide text-[#666666] mb-1">Order ID</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="order_xxxxxxxxxxxx"
              className="w-full border border-[#D8CFC0] bg-white px-3 py-2 text-sm" data-testid="track-order-id" />
          </div>
          <div>
            <label className="block text-sm uppercase tracking-wide text-[#666666] mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com"
              className="w-full border border-[#D8CFC0] bg-white px-3 py-2 text-sm" data-testid="track-email" />
          </div>
          {error && <p className="text-sm text-[#D32F2F]" data-testid="track-error">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-60"
            data-testid="track-submit">
            {loading ? 'Looking up…' : 'Find my order'}
          </button>
        </form>

        {order && (
          <div className="bg-[#F5F0E6] p-6" data-testid="track-result">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm uppercase tracking-wide text-[#666666]">Order #{order.order_id}</p>
                <p className="text-lg font-serif font-medium text-[#1A1A1A] mt-1">
                  {confirmed
                    ? (STAGES.find((s) => s.key === (order.fulfillment_status || 'processing'))?.label || 'Processing')
                    : (order.status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
              </div>
              <p className="text-lg font-medium text-[#1A1A1A]">₹{((order.total || 0) / 100).toLocaleString('en-IN')}</p>
            </div>

            {confirmed && <Timeline status={order.fulfillment_status || 'processing'} />}
            {order.tracking_number && (
              <p className="mt-4 text-sm text-[#1A1A1A]">
                <span className="text-[#666666]">Tracking: </span>{order.courier ? `${order.courier} — ` : ''}{order.tracking_number}
              </p>
            )}

            <div className="space-y-1 mt-5 pt-4 border-t border-[#E5DCC9]">
              {(order.items || []).map((it, i) => (
                <p key={i} className="text-sm text-[#666666]">{it.name}{it.size ? ` (Size ${it.size})` : ''} × {it.quantity}</p>
              ))}
            </div>

            {confirmed && (
              order.return_request ? (
                <div className="mt-4" data-testid="track-return-status">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white px-2 py-0.5 rounded" style={{ background: RETURN_COLORS[order.return_request.status] || '#666666' }}>
                    {RETURN_LABELS[order.return_request.status] || order.return_request.status}
                  </span>
                  {order.return_request.admin_note && <p className="text-xs text-[#666666] mt-1">{order.return_request.admin_note}</p>}
                </div>
              ) : returnEligible(order) ? (
                <button onClick={() => setShowReturn(true)}
                  className="mt-4 text-sm border border-[#7A1F3D] text-[#7A1F3D] px-4 py-2 hover:bg-[#7A1F3D] hover:text-white transition-colors"
                  data-testid="track-request-return">
                  Report a damaged item
                </button>
              ) : order.fulfillment_status === 'delivered' ? (
                <p className="mt-4 text-sm text-[#666666]">The 2-day return window for this order has closed.</p>
              ) : null
            )}
          </div>
        )}
      </div>

      {showReturn && order && (
        <ReturnRequestModal
          order={order}
          email={email.trim()}
          onClose={() => setShowReturn(false)}
          onDone={() => { setShowReturn(false); lookup(); }}
        />
      )}
    </div>
  );
}
