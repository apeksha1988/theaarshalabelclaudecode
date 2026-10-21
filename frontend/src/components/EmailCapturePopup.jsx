import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

// A one-time lead-capture popup that saves a visitor's WhatsApp/email so the
// owner can follow up (festive sale + new drops) with people who don't finish
// checkout. Shows once per visitor, on exit-intent (desktop) or after a delay
// (mobile); never on checkout/admin pages.
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
            {status === 'done' ? 'You’re in! 🎉' : (hasCart ? 'Don’t leave it behind ✨' : 'Festive Sale is on ✨')}
          </h2>
        </div>

        <div className="px-6 py-6">
          {status === 'done' ? (
            <div className="text-center">
              <p className="text-sm text-[#1A1A1A] mb-2">Thank you — you’re on the list! 💛</p>
              <p className="text-xs text-[#666666]">We’ll send you our festive offers &amp; first dibs on new drops. Free delivery &amp; Cash on Delivery across India.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#666666] text-center mb-4">
                {hasCart
                  ? 'Leave your WhatsApp number or email and we’ll save your cart + send you our best festive offers.'
                  : 'Join for early access to new drops and our festive sale — up to 40% off select sets. Drop your WhatsApp number or email.'}
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
                  {status === 'sending' ? 'Sending…' : 'Keep me posted'}
                </button>
              </form>
              <p className="text-[11px] text-[#999999] text-center mt-3">No spam — just new arrivals and festive offers.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
