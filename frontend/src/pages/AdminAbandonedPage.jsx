import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { ShoppingCart, Download, MessageCircle } from 'lucide-react';

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const inr = (p) => `₹${((p || 0) / 100).toLocaleString('en-IN')}`;

function waLink(phone, name, itemName) {
  const digits = (phone || '').replace(/\D/g, '');
  const msg =
    `Hi ${name || 'there'}, this is The Aarsha Label 💛 ` +
    `I noticed you were looking at ${itemName ? `"${itemName}"` : 'one of our pieces'} but didn't finish your order. ` +
    `Can I help you complete it? We have free delivery & Cash on Delivery across India, and up to 40% off select sets right now.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export default function AdminAbandonedPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/abandoned-checkouts')
      .then((res) => setRows(res.data))
      .catch(() => setError('Could not load abandoned checkouts. Make sure you are signed in as admin.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = () => {
    const cols = ['date', 'name', 'phone', 'email', 'items', 'amount_inr', 'city'];
    const data = rows.map((o) => {
      const a = o.shipping_address || {};
      return [
        (o.created_at || '').slice(0, 16), a.name || '', a.phone || '', o.email || '',
        (o.items || []).map((it) => `${it.quantity || 1}x ${it.name || ''}`).join('; '),
        ((o.total || 0) / 100).toFixed(0), a.city || '',
      ];
    });
    const csv = [cols.join(','), ...data.map((r) => r.map(csvEscape).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aarsha-abandoned-${new Date().toISOString().slice(0, 10)}.csv`;
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
    <div className="min-h-screen pt-32 pb-20" data-testid="admin-abandoned-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A]">Abandoned Checkouts</h1>
          </div>
          {rows.length > 0 && (
            <button onClick={downloadCsv}
              className="flex items-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] px-4 py-2 text-sm hover:bg-[#7A1F3D] hover:text-white transition-colors">
              <Download className="w-4 h-4" /> CSV ({rows.length})
            </button>
          )}
        </div>
        <p className="text-sm text-[#666666] mb-8 max-w-2xl">
          People who started checkout (so we have their number) but didn't pay. Tap <b>Message on WhatsApp</b>
          to follow up with a friendly nudge — this is one of the fastest ways to recover a sale.
        </p>

        {error && <p className="text-red-600 mb-6">{error}</p>}

        {rows.length === 0 && !error ? (
          <p className="text-[#666666]">No abandoned checkouts right now. 🎉</p>
        ) : (
          <div className="space-y-4">
            {rows.map((o) => {
              const a = o.shipping_address || {};
              const firstItem = (o.items || [])[0];
              return (
                <div key={o.order_id} className="bg-[#F5F0E6] p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" data-testid="abandoned-card">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#1A1A1A]">{a.name || 'Unknown'}</span>
                      <span className="text-sm text-[#666666]">{a.phone}</span>
                      <span className="text-xs text-[#999999]">· {(o.created_at || '').slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    <p className="text-sm text-[#666666] mt-1 truncate">
                      {(o.items || []).map((it) => `${it.quantity || 1}× ${it.name}`).join(', ')} · <b>{inr(o.total)}</b>
                    </p>
                  </div>
                  {a.phone && (
                    <a
                      href={waLink(a.phone, a.name, firstItem && firstItem.name)}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2.5 text-sm rounded hover:opacity-90 transition-opacity"
                      data-testid="abandoned-whatsapp"
                    >
                      <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
