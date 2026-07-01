import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Package, Download } from 'lucide-react';

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const FULFILLMENT_OPTIONS = [
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders. Make sure you are signed in as admin.'))
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => o.status === 'paid');

  const downloadCsv = () => {
    const cols = ['order_id', 'date', 'customer_name', 'phone', 'email', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'items', 'amount_inr', 'fulfillment_status'];
    const rows = paidOrders.map((o) => {
      const a = o.shipping_address || {};
      return [
        o.order_id, (o.created_at || '').slice(0, 16), a.name || '', a.phone || '', o.email || '',
        a.line1 || '', a.line2 || '', a.city || '', a.state || '', a.postal_code || '', a.country || '',
        (o.items || []).map((it) => `${it.quantity || 1}x ${it.name || ''}`).join('; '),
        ((o.total || 0) / 100).toFixed(0), o.fulfillment_status || 'processing',
      ];
    });
    const csv = [cols.join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aarsha-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A1F3D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="admin-orders-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A]">Orders — Admin</h1>
          </div>
          {paidOrders.length > 0 && (
            <button
              onClick={downloadCsv}
              className="flex items-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] px-4 py-2 text-sm hover:bg-[#7A1F3D] hover:text-white transition-colors"
              data-testid="download-orders-csv"
            >
              <Download className="w-4 h-4" /> Download CSV ({paidOrders.length})
            </button>
          )}
        </div>

        {error && <p className="text-red-600 mb-6">{error}</p>}

        {paidOrders.length === 0 ? (
          <p className="text-[#666666]">No paid orders yet.</p>
        ) : (
          <div className="space-y-5">
            {paidOrders.map((order) => (
              <AdminOrderCard key={order.order_id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminOrderCard({ order }) {
  const [status, setStatus] = useState(order.fulfillment_status || 'processing');
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [courier, setCourier] = useState(order.courier || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put(`/admin/orders/${order.order_id}/status`, {
        fulfillment_status: status,
        tracking_number: tracking,
        courier,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Failed to update order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addr = order.shipping_address || {};

  return (
    <div className="bg-[#F5F0E6] p-6" data-testid={`admin-order-${order.order_id}`}>
      <div className="flex flex-wrap justify-between gap-2 mb-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-[#666666]">Order #{order.order_id}</p>
          <p className="text-sm text-[#1A1A1A] mt-1">{order.email}</p>
          {addr.name && (
            <p className="text-xs text-[#666666] mt-1">
              {addr.name}, {addr.city}, {addr.state} {addr.postal_code} · {addr.phone}
            </p>
          )}
        </div>
        <p className="text-lg font-medium text-[#1A1A1A]">₹{(order.total / 100).toLocaleString('en-IN')}</p>
      </div>

      <div className="text-sm text-[#666666] mb-4">
        {order.items.map((it, i) => (
          <span key={i}>{it.name} × {it.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-[#D8CFC0] bg-white px-3 py-2 text-sm"
            data-testid="status-select"
          >
            {FULFILLMENT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">Courier (optional)</label>
          <input
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="e.g. Delhivery"
            className="w-full border border-[#D8CFC0] bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">Tracking # (optional)</label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking number"
            className="w-full border border-[#D8CFC0] bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#7A1F3D] text-white text-sm px-5 py-2 hover:bg-[#5e1730] transition-colors disabled:opacity-60"
          data-testid="save-status"
        >
          {saving ? 'Saving…' : 'Update & notify customer'}
        </button>
        {saved && <span className="text-sm text-green-700">Saved ✓ Customer emailed</span>}
      </div>
    </div>
  );
}
