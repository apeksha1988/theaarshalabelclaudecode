import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Package, User } from 'lucide-react';
import ReturnRequestModal from '../components/ReturnRequestModal';

const RETURN_WINDOW_DAYS = 2;
function returnEligible(order) {
  if (order.fulfillment_status !== 'delivered' || order.return_request) return false;
  const d = new Date(order.delivered_at || order.updated_at || 0).getTime();
  return d > 0 && Date.now() <= d + RETURN_WINDOW_DAYS * 86400000;
}
const RETURN_LABELS = { requested: 'Return requested', approved: 'Return approved', rejected: 'Return not approved' };
const RETURN_COLORS = { requested: '#C0672A', approved: '#2E7D32', rejected: '#B23A48' };
function ReturnStatusBadge({ rr }) {
  return (
    <div className="mt-4" data-testid="return-status">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-white px-2 py-0.5 rounded" style={{ background: RETURN_COLORS[rr.status] || '#666666' }}>
        {RETURN_LABELS[rr.status] || rr.status}
      </span>
      {rr.admin_note && <p className="text-xs text-[#666666] mt-1">{rr.admin_note}</p>}
    </div>
  );
}

const FULFILLMENT_STAGES = [
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function OrderTimeline({ status }) {
  const idx = Math.max(0, FULFILLMENT_STAGES.findIndex((s) => s.key === status));
  return (
    <div className="mt-5" data-testid="order-timeline">
      <div className="flex items-center">
        {FULFILLMENT_STAGES.map((stage, i) => (
          <React.Fragment key={stage.key}>
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${i <= idx ? 'bg-[#7A1F3D]' : 'bg-[#D8CFC0]'}`} />
            {i < FULFILLMENT_STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 ${i < idx ? 'bg-[#7A1F3D]' : 'bg-[#D8CFC0]'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex mt-2">
        {FULFILLMENT_STAGES.map((stage, i) => (
          <span
            key={stage.key}
            className={`flex-1 text-[10px] sm:text-xs leading-tight ${i === 0 ? 'text-left' : i === FULFILLMENT_STAGES.length - 1 ? 'text-right' : 'text-center'} ${i <= idx ? 'text-[#7A1F3D] font-medium' : 'text-[#999999]'}`}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnFor, setReturnFor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center" data-testid="loading-dashboard">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]"></div>
          <p className="mt-4 text-[#666666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4" data-testid="dashboard-title">
            Welcome, {user?.name}
          </h1>
          <p className="text-[#666666]" data-testid="dashboard-subtitle">Manage your orders</p>
        </div>

        {/* User Info */}
        <div className="bg-[#F5F0E6] p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <User className="w-12 h-12 text-[#7A1F3D]" strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-serif font-medium text-[#1A1A1A]" data-testid="user-name">{user?.name}</h2>
              <p className="text-[#666666]" data-testid="user-email">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-[#7A1F3D]" strokeWidth={1.5} />
            <h2 className="text-2xl font-serif font-medium text-[#1A1A1A]" data-testid="orders-title">Your Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="bg-[#F5F0E6] p-8 text-center" data-testid="no-orders">
              <p className="text-[#666666] mb-4">You haven't placed any orders yet.</p>
              <Link to="/shop" className="text-[#7A1F3D] hover:underline">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-[#F5F0E6] p-6" data-testid={`order-${order.order_id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-[#666666]">Order #{order.order_id}</p>
                      <p className="text-lg font-serif font-medium text-[#1A1A1A] mt-1" data-testid="order-status">
                        {(order.status === 'paid' || order.status === 'cod_confirmed')
                          ? (FULFILLMENT_STAGES.find((s) => s.key === (order.fulfillment_status || 'processing'))?.label || 'Processing')
                          : order.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-[#1A1A1A]" data-testid="order-amount">₹{(order.total / 100).toLocaleString('en-IN')}</p>
                  </div>

                  {(order.status === 'paid' || order.status === 'cod_confirmed') && (
                    <>
                      <OrderTimeline status={order.fulfillment_status || 'processing'} />
                      {order.tracking_number && (
                        <p className="mt-4 text-sm text-[#1A1A1A]" data-testid="order-tracking">
                          <span className="text-[#666666]">Tracking: </span>
                          {order.courier ? `${order.courier} — ` : ''}{order.tracking_number}
                        </p>
                      )}
                    </>
                  )}

                  <div className="space-y-2 mt-5 pt-4 border-t border-[#E5DCC9]">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-[#666666]" data-testid={`order-item-${index}`}>
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  {(order.status === 'paid' || order.status === 'cod_confirmed') && (
                    order.return_request ? (
                      <ReturnStatusBadge rr={order.return_request} />
                    ) : returnEligible(order) ? (
                      <button
                        onClick={() => setReturnFor(order)}
                        className="mt-4 text-sm border border-[#7A1F3D] text-[#7A1F3D] px-4 py-2 hover:bg-[#7A1F3D] hover:text-white transition-colors"
                        data-testid="request-return-button"
                      >
                        Report a damaged item
                      </button>
                    ) : null
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {returnFor && (
        <ReturnRequestModal
          order={returnFor}
          onClose={() => setReturnFor(null)}
          onDone={() => { setReturnFor(null); fetchData(); }}
        />
      )}
    </div>
  );
}