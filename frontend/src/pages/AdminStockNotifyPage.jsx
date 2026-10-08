import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Bell, Download } from 'lucide-react';

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function AdminStockNotifyPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stock-notifications')
      .then((res) => setRows(res.data))
      .catch(() => setError('Could not load requests. Make sure you are signed in as admin.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = () => {
    const cols = ['date', 'product_name', 'name', 'phone', 'email'];
    const data = rows.map((r) => [(r.created_at || '').slice(0, 16), r.product_name, r.name, r.phone, r.email]);
    const csv = [cols.join(','), ...data.map((r) => r.map(csvEscape).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aarsha-stock-requests-${new Date().toISOString().slice(0, 10)}.csv`;
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

  // Group by product so you can see demand per piece at a glance.
  const byProduct = {};
  rows.forEach((r) => { (byProduct[r.product_name] = byProduct[r.product_name] || []).push(r); });

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="admin-stock-notify-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A]">Sold-Out Requests</h1>
          </div>
          {rows.length > 0 && (
            <button onClick={downloadCsv}
              className="flex items-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] px-4 py-2 text-sm hover:bg-[#7A1F3D] hover:text-white transition-colors">
              <Download className="w-4 h-4" /> Download CSV ({rows.length})
            </button>
          )}
        </div>

        {error && <p className="text-red-600 mb-6">{error}</p>}

        {rows.length === 0 && !error ? (
          <p className="text-[#666666]">No sold-out requests yet. When someone wants a sold-out piece, they'll appear here.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(byProduct).map(([product, people]) => (
              <div key={product}>
                <h2 className="font-serif text-lg text-[#1A1A1A] mb-3">
                  {product} <span className="text-sm text-[#7A1F3D]">· {people.length} waiting</span>
                </h2>
                <div className="space-y-2">
                  {people.map((r) => (
                    <div key={r.request_id} className="bg-[#F5F0E6] p-4 flex flex-wrap justify-between gap-2" data-testid="stock-request-card">
                      <div>
                        <span className="font-medium text-[#1A1A1A]">{r.name}</span>
                        <span className="text-sm text-[#666666]"> · </span>
                        <a href={`https://wa.me/${(r.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7A1F3D] hover:underline">{r.phone}</a>
                        {r.email ? <span className="text-sm text-[#666666]"> · {r.email}</span> : null}
                      </div>
                      <span className="text-xs text-[#999999]">{(r.created_at || '').slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
