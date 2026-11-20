import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { getCachedProducts } from '../lib/productCache';
import { Plus, Trash2, Check, ArrowLeft } from 'lucide-react';

// Owner tool: record an order placed off-site (e.g. over WhatsApp) so it gets a
// real order id and lives in the dashboard with tracking + returns.
const FIELD = 'w-full border border-[#D8CFC0] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#7A1F3D]';
const LABEL = 'block text-xs uppercase tracking-wide text-[#666666] mb-1';

export default function AdminNewOrderPage() {
  const catalog = useMemo(() => getCachedProducts() || [], []);
  const [items, setItems] = useState([]); // {product_id, name, image, size, rupees, quantity}
  const [addr, setAddr] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India',
  });
  const [email, setEmail] = useState('');
  const [payment, setPayment] = useState('cod'); // 'cod' | 'paid'
  const [discount, setDiscount] = useState('');
  const [notify, setNotify] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | saving | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const setAddrField = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));
  const updateItem = (i, patch) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeItem = (i) => setItems((xs) => xs.filter((_, j) => j !== i));

  const addFromCatalog = (e) => {
    const pid = e.target.value;
    if (!pid) return;
    const p = catalog.find((x) => x.product_id === pid);
    if (p) {
      setItems((xs) => [...xs, {
        product_id: p.product_id, name: p.name, image: (p.images || [])[0] || '',
        size: '', rupees: p.price != null ? String(Math.round(p.price / 100)) : '', quantity: 1,
      }]);
    }
    e.target.value = '';
  };
  const addBlank = () => setItems((xs) => [...xs, { product_id: 'manual', name: '', image: '', size: '', rupees: '', quantity: 1 }]);

  const subtotal = items.reduce((s, it) => s + (Number(it.rupees) || 0) * (Number(it.quantity) || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  const canSave = items.length > 0 && items.every((it) => it.name.trim() && Number(it.rupees) > 0 && Number(it.quantity) > 0)
    && addr.name.trim() && addr.phone.trim() && addr.line1.trim() && addr.city.trim() && addr.state.trim() && addr.postal_code.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setStatus('saving'); setError('');
    try {
      const payload = {
        items: items.map((it) => ({
          product_id: it.product_id || 'manual',
          name: it.name.trim(),
          price: Math.round(Number(it.rupees) * 100),
          quantity: Number(it.quantity),
          image: it.image || null,
          size: it.size ? it.size.trim() : null,
        })),
        shipping_address: { ...addr, line2: addr.line2 || null },
        email: email.trim() || null,
        payment_method: payment,
        discount: Math.round((Number(discount) || 0) * 100),
        notify,
      };
      const res = await api.post('/admin/orders/manual', payload);
      setResult(res.data);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create the order. Make sure you are signed in as admin.');
      setStatus('error');
    }
  };

  const reset = () => {
    setItems([]); setEmail(''); setPayment('cod'); setDiscount(''); setNotify(true);
    setAddr({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' });
    setResult(null); setStatus('idle'); setError('');
  };

  if (status === 'done' && result) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4" data-testid="manual-order-done">
        <div className="max-w-md mx-auto text-center bg-[#F5F0E6] p-8 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-[#2E7D32] text-white flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl text-[#1A1A1A] mb-2">Order created</h1>
          <p className="text-sm text-[#666666] mb-1">Order ID</p>
          <p className="font-mono text-lg text-[#7A1F3D] mb-4 break-all">{result.order_id}</p>
          <p className="text-sm text-[#1A1A1A] mb-6">
            {result.status === 'cod_confirmed' ? 'Cash on Delivery' : 'Paid'} · Total ₹{(result.total / 100).toLocaleString('en-IN')}
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={reset} className="bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-wide uppercase hover:bg-[#5C172E]">
              Add another order
            </button>
            <Link to="/admin" className="text-sm text-[#7A1F3D] underline">View all orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4" data-testid="manual-order-page">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-[#7A1F3D] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A] mb-1">New WhatsApp order</h1>
        <p className="text-sm text-[#666666] mb-8">Record an order placed over WhatsApp or DM. It gets a real order ID and appears in your dashboard with tracking &amp; returns.</p>

        <form onSubmit={submit} className="space-y-8">
          {/* Items */}
          <section>
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-3">Items</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <select onChange={addFromCatalog} className={`${FIELD} max-w-xs`} data-testid="catalog-select" defaultValue="">
                <option value="">+ Add a product from catalogue…</option>
                {catalog.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name}{p.price != null ? ` — ₹${Math.round(p.price / 100).toLocaleString('en-IN')}` : ''}
                  </option>
                ))}
              </select>
              <button type="button" onClick={addBlank} className="inline-flex items-center gap-1 border border-[#7A1F3D] text-[#7A1F3D] px-3 py-2 text-sm hover:bg-[#7A1F3D] hover:text-white">
                <Plus className="w-4 h-4" /> Custom item
              </button>
            </div>

            {items.length === 0 && <p className="text-sm text-[#999999]">No items yet — add from the catalogue or a custom item.</p>}

            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="bg-[#F5F0E6] p-3 rounded flex flex-col sm:flex-row gap-3 sm:items-end" data-testid="order-item-row">
                  {it.image && <img src={it.image} alt="" className="w-14 h-14 object-cover rounded border border-[#E2D9C9]" />}
                  <div className="flex-1">
                    <label className={LABEL}>Item</label>
                    <input value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} className={FIELD} placeholder="Product name" />
                  </div>
                  <div className="w-24">
                    <label className={LABEL}>Price ₹</label>
                    <input type="number" min="0" value={it.rupees} onChange={(e) => updateItem(i, { rupees: e.target.value })} className={FIELD} />
                  </div>
                  <div className="w-16">
                    <label className={LABEL}>Qty</label>
                    <input type="number" min="1" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} className={FIELD} />
                  </div>
                  <button type="button" onClick={() => removeItem(i)} aria-label="Remove" className="text-[#B23A48] p-2 self-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Customer */}
          <section>
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-3">Customer &amp; delivery</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className={LABEL}>Full name *</label><input value={addr.name} onChange={setAddrField('name')} className={FIELD} /></div>
              <div><label className={LABEL}>Phone (WhatsApp) *</label><input value={addr.phone} onChange={setAddrField('phone')} className={FIELD} placeholder="10-digit number" /></div>
              <div className="sm:col-span-2"><label className={LABEL}>Email (optional — for confirmation)</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} type="email" /></div>
              <div className="sm:col-span-2"><label className={LABEL}>Address line 1 *</label><input value={addr.line1} onChange={setAddrField('line1')} className={FIELD} /></div>
              <div className="sm:col-span-2"><label className={LABEL}>Address line 2</label><input value={addr.line2} onChange={setAddrField('line2')} className={FIELD} /></div>
              <div><label className={LABEL}>City *</label><input value={addr.city} onChange={setAddrField('city')} className={FIELD} /></div>
              <div><label className={LABEL}>State *</label><input value={addr.state} onChange={setAddrField('state')} className={FIELD} /></div>
              <div><label className={LABEL}>Pincode *</label><input value={addr.postal_code} onChange={setAddrField('postal_code')} className={FIELD} /></div>
              <div><label className={LABEL}>Country</label><input value={addr.country} onChange={setAddrField('country')} className={FIELD} /></div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-3">Payment</h2>
            <div className="flex gap-2 mb-3">
              {[['cod', 'Cash on Delivery'], ['paid', 'Already paid']].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setPayment(v)}
                  className={`px-4 py-2 text-sm border ${payment === v ? 'bg-[#7A1F3D] text-white border-[#7A1F3D]' : 'border-[#D8CFC0] text-[#1A1A1A]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="w-32"><label className={LABEL}>Discount ₹</label><input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className={FIELD} placeholder="0" /></div>
            <label className="flex items-center gap-2 mt-3 text-sm text-[#1A1A1A]">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              Send the customer a confirmation (email + WhatsApp, if configured)
            </label>
          </section>

          {/* Summary + submit */}
          <section className="border-t border-[#EAE5D9] pt-4">
            <div className="flex justify-between text-sm text-[#666666] mb-1"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {Number(discount) > 0 && <div className="flex justify-between text-sm text-[#666666] mb-1"><span>Discount</span><span>−₹{Number(discount).toLocaleString('en-IN')}</span></div>}
            <div className="flex justify-between text-lg font-medium text-[#1A1A1A] mb-4"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            {error && <p className="text-sm text-[#B23A48] mb-3">{error}</p>}
            <button type="submit" disabled={!canSave || status === 'saving'}
              className="w-full bg-[#7A1F3D] text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] disabled:opacity-50"
              data-testid="create-order-btn">
              {status === 'saving' ? 'Creating…' : `Create order${total ? ` · ₹${total.toLocaleString('en-IN')}` : ''}`}
            </button>
            {!canSave && items.length > 0 && <p className="text-xs text-[#999999] mt-2 text-center">Fill every item (name, price, qty) and all required customer fields (*).</p>}
          </section>
        </form>
      </div>
    </div>
  );
}
