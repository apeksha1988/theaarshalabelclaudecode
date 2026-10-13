import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, Download, MessageCircle } from 'lucide-react';

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function AdminLeadsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/leads')
      .then((res) => setRows(res.data))
      .catch(() => setError('Could not load leads. Make sure you are signed in as admin.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = () => {
    const cols = ['date', 'contact', 'type', 'had_cart', 'source'];
    const data = rows.map((r) => [(r.created_at || '').slice(0, 16), r.contact, r.type, r.has_cart ? 'yes' : '', r.source]);
    const csv = [cols.join(','), ...data.map((r) => r.map(csvEscape).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aarsha-leads-${new Date().toISOString().slice(0, 10)}.csv`;
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

  const waFor = (phone) => `https://wa.me/${(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
    "Hi! Thanks for your interest in The Aarsha Label 💛 Here's your 10% off code: WELCOME10 — free delivery & COD across India. Can I help you pick a piece?"
  )}`;

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="admin-leads-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A]">Leads</h1>
          </div>
          {rows.length > 0 && (
            <button onClick={downloadCsv}
              className="flex items-center gap-2 border border-[#7A1F3D] text-[#7A1F3D] px-4 py-2 text-sm hover:bg-[#7A1F3D] hover:text-white transition-colors">
              <Download className="w-4 h-4" /> CSV ({rows.length})
            </button>
          )}
        </div>
        <p className="text-sm text-[#666666] mb-8 max-w-2xl">
          People who left their WhatsApp/email via the discount popup. Message the phone numbers, and export
          emails to build a list you can retarget or email about new drops.
        </p>

        {error && <p className="text-red-600 mb-6">{error}</p>}

        {rows.length === 0 && !error ? (
          <p className="text-[#666666]">No leads yet. They'll appear here as visitors claim the 10% code.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.contact} className="bg-[#F5F0E6] p-4 flex flex-wrap items-center justify-between gap-3" data-testid="lead-card">
                <div className="min-w-0">
                  <span className="font-medium text-[#1A1A1A] break-all">{r.contact}</span>
                  <span className="text-xs text-[#999999] ml-2">
                    {r.type}{r.has_cart ? ' · had items in cart' : ''} · {(r.created_at || '').slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
                {r.type === 'phone' && (
                  <a href={waFor(r.contact)} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 text-sm rounded hover:opacity-90 transition-opacity">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
