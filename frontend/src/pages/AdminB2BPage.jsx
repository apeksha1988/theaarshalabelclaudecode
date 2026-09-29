import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Handshake, Download } from 'lucide-react';

const csvEscape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function AdminB2BPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/b2b-inquiries')
      .then((res) => setRows(res.data))
      .catch(() => setError('Could not load inquiries. Make sure you are signed in as admin.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = () => {
    const cols = ['date', 'business_name', 'contact_name', 'phone', 'email', 'city', 'business_type', 'monthly_volume', 'message'];
    const data = rows.map((r) => [
      (r.created_at || '').slice(0, 16), r.business_name, r.contact_name, r.phone, r.email,
      r.city, r.business_type, r.monthly_volume, r.message,
    ]);
    const csv = [cols.join(','), ...data.map((r) => r.map(csvEscape).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aarsha-b2b-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
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
    <div className="min-h-screen pt-32 pb-20" data-testid="admin-b2b-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <Handshake className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A]">B2B Inquiries</h1>
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
          <p className="text-[#666666]">No B2B inquiries yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.inquiry_id} className="bg-[#F5F0E6] p-6" data-testid="b2b-inquiry-card">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <h2 className="font-serif text-lg text-[#1A1A1A]">{r.business_name}</h2>
                  <span className="text-xs text-[#999999]">{(r.created_at || '').slice(0, 16).replace('T', ' ')}</span>
                </div>
                <p className="text-sm text-[#1A1A1A]">{r.contact_name}</p>
                <p className="text-sm text-[#666666] mt-1">
                  <a href={`https://wa.me/${(r.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[#7A1F3D] hover:underline">{r.phone}</a>
                  {r.email ? <> · <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a></> : null}
                  {r.city ? ` · ${r.city}` : ''}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  {r.business_type && <span className="bg-white border border-[#EAE5D9] px-2 py-1 rounded">{r.business_type}</span>}
                  {r.monthly_volume && <span className="bg-white border border-[#EAE5D9] px-2 py-1 rounded">Vol: {r.monthly_volume}</span>}
                </div>
                {r.message && <p className="text-sm text-[#666666] mt-3 italic">“{r.message}”</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
