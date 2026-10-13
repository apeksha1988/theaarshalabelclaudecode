import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

// A one-time discount popup that captures a visitor's WhatsApp/email (for the
// 10% code) so the owner can follow up with people who don't finish checkout.
// Shows once per visitor, on exit-intent (desktop) or after a delay (mobile);
// never on checkout/admin pages.
const DONE_KEY = 'aarsha_lead_done';

export default function EmailCapturePopup() {
  const { pathname } = useLocation();
  const { cartItems } = useCart();
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const armed = useRef(false);

  useEffect(() => {
    let done = false;
    try { done = localStorage.getItem(DONE_KEY) === '1'; } catch (e) { /* ignore */ }
    if (done || armed.current) return;
    if (/^\/(checkout|admin|login|reset-password|forgot-password)/.test(pathname)) return;

    const trigger = () => {
      if (armed.current) return;
      armed.current = true;
      setOpen(true);
    };
    const onMouseOut = (e) => { if (e.clientY <= 0 && !e.relatedTarget) trigger(); };
    const timer = setTimeout(trigger, 30000);
    document.addEventListener('mouseout', onMouseOut);
    return () => { clearTimeout(timer); document.removeEventListener('mouseout', onMouseOut); };
  }, [pathname]);

  const markDone = () => { try { localStorage.setItem(DONE_KEY, '1'); } catch (e) { /* ignore */ } };
  const close = () => { setOpen(false); markDone(); };

  const submit = async (e) => {
    e.preventDefault();
    const c = contact.trim();
    if (!c) return;
    setStatus('sending');
    try {
      await api.post('/lead', { contact: c, source: 'cart-popup', has_cart: cartItems.length > 0 });
      setStatus('done');
      markDone();
    } catch (err) {
      setStatus('error');
    }
  };

  if (!open) return null;
  const hasCart = cartItems.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" data-testid="lead-popup" onClick={close}>
      <div className="relative bg-[#FDFBF7] max-w-md w-full rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Close" className="absolute top-3 right-3 text-[#999999] hover:text-[#1A1A1A] z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-[#5C172E] to-[#7A1F3D] text-center px-6 py-7 text-white">
          <Gift className="w-9 h-9 mx-auto text-[#F0C96B] mb-2" strokeWidth={1.5} />
          <h2 className="font-serif text-2xl">
            {status === 'done' ? 'You’re in! 🎉' : (hasCart ? 'Don’t leave it behind ✨' : 'Here’s 10% off 🎁')}
          </h2>
        </div>

        <div className="px-6 py-6">
          {status === 'done' ? (
            <div className="text-center">
              <p className="text-sm text-[#1A1A1A] mb-3">Your code is ready — use it at checkout:</p>
              <div className="inline-flex items-center gap-2 bg-[#F5F0E6] border border-dashed border-[#7A1F3D] px-5 py-3 rounded">
                <span className="font-serif text-xl tracking-[0.15em] text-[#7A1F3D] font-semibold">WELCOME10</span>
              </div>
              <p className="text-xs text-[#666666] mt-3">10% off · Free delivery · Cash on Delivery across India 💛</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#666666] text-center mb-4">
                {hasCart
                  ? 'Get 10% off the pieces in your cart. Drop your WhatsApp number or email and we’ll send your code + a reminder.'
                  : 'Get 10% off your first order. Drop your WhatsApp number or email and we’ll send your code + first dibs on new drops.'}
              </p>
              <form onSubmit={submit} className="space-y-3">
                <input
                  required value={contact} onChange={(e) => setContact(e.target.value)}
                  placeholder="WhatsApp number or email"
                  className="w-full border border-[#D8CFC0] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#7A1F3D]"
                  data-testid="lead-input"
                />
                {status === 'error' && <p className="text-sm text-red-600">Please enter a valid number or email.</p>}
                <button
                  type="submit" disabled={status === 'sending'}
                  className="w-full bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-colors disabled:opacity-60"
                  data-testid="lead-submit"
                >
                  {status === 'sending' ? 'Sending…' : 'Get my 10% off'}
                </button>
              </form>
              <p className="text-[11px] text-[#999999] text-center mt-3">No spam — just your code and occasional new arrivals.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
