import React, { useState } from 'react';
import { Package, Check, Bell } from 'lucide-react';
import api from '../lib/api';

// Replaces the buy buttons when a product is sold out. Captures interested
// shoppers (name + WhatsApp number) and alerts the owner, with a WhatsApp
// quick-message as a fallback.
export default function SoldOutNotify({ product }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/stock-notify', {
        product_id: product.product_id,
        product_name: product.name,
        name: form.name,
        phone: form.phone,
      });
      setStatus('done');
    } catch (err) {
      setStatus('error');
    }
  };

  const waText = `https://wa.me/917310768702?text=${encodeURIComponent(
    `Hi! I'd love to know when "${product.name}" is back in stock.`
  )}`;

  return (
    <div className="space-y-4" data-testid="sold-out-block">
      <button
        disabled
        className="w-full bg-[#EDE7DA] text-[#8A8272] px-8 py-4 text-sm tracking-[0.1em] uppercase cursor-not-allowed flex items-center justify-center gap-2"
        data-testid="sold-out-button"
      >
        <Package className="w-5 h-5" /> Sold Out
      </button>

      {status === 'done' ? (
        <div className="bg-[#F5F0E6] border border-[#EAE5D9] rounded-lg p-5 text-center" data-testid="stock-notify-success">
          <div className="w-11 h-11 mx-auto rounded-full bg-[#7A1F3D] flex items-center justify-center mb-2">
            <Check className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-[#1A1A1A]">You're on the list — we'll message you the moment it's back in stock. 💛</p>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-[#F5F0E6] border border-[#EAE5D9] rounded-lg p-5 space-y-3" data-testid="stock-notify-form">
          <p className="text-sm text-[#1A1A1A] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#7A1F3D]" /> <span><b>Love this piece?</b> Get notified when it's back.</span>
          </p>
          <input
            required value={form.name} onChange={set('name')} placeholder="Your name"
            className="w-full border border-[#D8CFC0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1F3D]"
            data-testid="stock-notify-name"
          />
          <input
            required type="tel" value={form.phone} onChange={set('phone')} placeholder="WhatsApp number"
            className="w-full border border-[#D8CFC0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1F3D]"
            data-testid="stock-notify-phone"
          />
          {status === 'error' && (
            <p className="text-sm text-red-600">Something went wrong — please try again, or message us on WhatsApp below.</p>
          )}
          <button
            type="submit" disabled={status === 'sending'}
            className="w-full bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-colors disabled:opacity-60"
            data-testid="stock-notify-submit"
          >
            {status === 'sending' ? 'Sending…' : 'Notify me when it’s back'}
          </button>
        </form>
      )}

      <a
        href={waText} target="_blank" rel="noopener noreferrer"
        className="w-full bg-[#25D366] text-white px-8 py-3.5 text-sm tracking-[0.1em] uppercase hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
        data-testid="notify-whatsapp-button"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Or message us on WhatsApp
      </a>
    </div>
  );
}
