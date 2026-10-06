import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, TrendingUp, Truck, Sparkles, Users, BadgeCheck, BookOpen, ArrowRight, Check, Send } from 'lucide-react';
import api from '../lib/api';
import { applySeo } from '../lib/seo';
import { BUSINESS_TYPES } from '../lib/b2b';

const BENEFITS = [
  { icon: Gem, title: 'Genuinely handcrafted', text: 'Kundan, Polki, oxidised & moissanite pieces made in small batches — quality your customers can feel.' },
  { icon: TrendingUp, title: 'Bulk discounts up to 20%+', text: 'The more you order, the better your margin. Transparent tiered pricing, plus custom quotes for large orders.' },
  { icon: Truck, title: 'Free delivery + COD', text: 'Shipped free across India, with Cash on Delivery available — low risk to get started.' },
  { icon: Sparkles, title: 'Festive & bridal ready', text: 'A curated, on-trend range for weddings, festivals and occasion wear — restocked regularly.' },
  { icon: Users, title: 'A personal partner', text: 'Work directly with the founder. Styling help, priority restocking, and quick answers on WhatsApp.' },
  { icon: BadgeCheck, title: 'Reliable supply', text: 'Consistent designs and dependable turnaround so you can promise your customers with confidence.' },
];

export default function B2BPage() {
  const [form, setForm] = useState({
    business_name: '', contact_name: '', email: '', phone: '',
    city: '', business_type: '', monthly_volume: '', message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  useEffect(() => {
    applySeo({
      title: 'Wholesale & B2B Partnerships',
      description:
        'Partner with The Aarsha Label for wholesale & bulk handcrafted jewellery — Kundan, Polki, oxidised & moissanite. Tiered bulk discounts, free delivery, COD. Become a stockist today.',
      path: '/b2b',
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/b2b/inquiry', form);
      setStatus('done');
      window.scrollTo({ top: document.getElementById('partner-form').offsetTop - 100, behavior: 'smooth' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen pb-20" data-testid="b2b-page">
      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-16 text-center text-white overflow-hidden bg-gradient-to-b from-[#5C172E] via-[#7A1F3D] to-[#6A1B36]">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 18% 20%, #F0C96B 0, transparent 24%), radial-gradient(circle at 82% 28%, #F0C96B 0, transparent 22%)' }} />
        <div className="relative max-w-3xl mx-auto px-6">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#F0C96B] mb-4">Wholesale &amp; Partnerships</p>
          <h1 className="font-serif font-light text-3xl sm:text-5xl leading-tight mb-4" data-testid="b2b-title">
            Stock The Aarsha Label
          </h1>
          <p className="text-sm sm:text-base text-[#EBD8CE] max-w-xl mx-auto mb-8">
            Handcrafted Indian jewellery for boutiques, resellers, salons and stylists — at wholesale
            prices, with bulk discounts and Cash on Delivery across India.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#partner-form"
              className="inline-flex items-center gap-2 bg-[#F0C96B] text-[#5C172E] px-8 py-3.5 text-sm tracking-[0.1em] uppercase font-medium hover:bg-[#e7bb53] transition-colors">
              Become a Partner <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/b2b/catalogue"
              className="inline-flex items-center gap-2 border border-[#F0C96B]/70 text-[#F0C96B] px-8 py-3.5 text-sm tracking-[0.1em] uppercase hover:bg-white/5 transition-colors"
              data-testid="b2b-catalogue-link">
              <BookOpen className="w-4 h-4" /> View B2B Catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 mt-16">
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A1F3D] mb-2">Why partner with us</p>
          <h2 className="font-serif font-light text-2xl sm:text-3xl text-[#1A1A1A]">Built for your business</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-[#F5F0E6] p-6 flex flex-col gap-3">
              <b.icon className="w-7 h-7 text-[#7A1F3D]" strokeWidth={1.6} />
              <h3 className="font-serif text-lg text-[#1A1A1A]">{b.title}</h3>
              <p className="text-sm text-[#666666] leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catalogue callout */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 mt-20">
        <Link to="/b2b/catalogue"
          className="group flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#F5F0E6] to-[#EFE7D6] border border-[#EAE5D9] rounded-xl p-8 hover:shadow-md transition-shadow"
          data-testid="b2b-catalogue-card">
          <div className="w-16 h-16 shrink-0 rounded-full bg-[#7A1F3D] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#F0C96B]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-1">Browse the B2B Catalogue</h3>
            <p className="text-sm text-[#666666]">See the full range with wholesale bulk-discount pricing — ready to order.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-[#7A1F3D] text-sm uppercase tracking-[0.1em] font-medium">
            Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </section>

      {/* Inquiry form */}
      <section id="partner-form" className="max-w-2xl mx-auto px-6 md:px-12 mt-20 scroll-mt-28">
        <div className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#7A1F3D] mb-2">Get started</p>
          <h2 className="font-serif font-light text-2xl sm:text-3xl text-[#1A1A1A]">Tell us about your business</h2>
          <p className="text-sm text-[#666666] mt-2">Fill this in and we'll reach out on WhatsApp with wholesale pricing — usually within a day.</p>
        </div>

        {status === 'done' ? (
          <div className="bg-[#F5F0E6] border border-[#EAE5D9] rounded-lg p-8 text-center" data-testid="b2b-success">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#7A1F3D] flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Thank you — we've got it!</h3>
            <p className="text-sm text-[#666666]">
              We'll be in touch shortly with wholesale pricing and next steps. For anything urgent,
              message us on WhatsApp at <a href="https://wa.me/917310768702" className="text-[#7A1F3D] underline">+91 73107 68702</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="b2b-form">
            <Field label="Business name *" value={form.business_name} onChange={set('business_name')} required />
            <Field label="Your name *" value={form.contact_name} onChange={set('contact_name')} required />
            <Field label="Email *" type="email" value={form.email} onChange={set('email')} required />
            <Field label="WhatsApp number *" type="tel" value={form.phone} onChange={set('phone')} required />
            <Field label="City" value={form.city} onChange={set('city')} />
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">Type of business</label>
              <select value={form.business_type} onChange={set('business_type')}
                className="w-full border border-[#D8CFC0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1F3D]">
                <option value="">Select…</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">Expected order size</label>
              <input value={form.monthly_volume} onChange={set('monthly_volume')} placeholder="e.g. 20–30 pieces to start"
                className="w-full border border-[#D8CFC0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1F3D]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">Anything else?</label>
              <textarea value={form.message} onChange={set('message')} rows={3} placeholder="Designs you're interested in, timelines, questions…"
                className="w-full border border-[#D8CFC0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1F3D]" />
            </div>
            {status === 'error' && (
              <p className="sm:col-span-2 text-sm text-red-600">Something went wrong — please try again, or WhatsApp us at +91 73107 68702.</p>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={status === 'sending'}
                className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                data-testid="b2b-submit">
                {status === 'sending' ? 'Sending…' : (<><Send className="w-4 h-4" /> Send inquiry</>)}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-[#666666] mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} required={required}
        className="w-full border border-[#D8CFC0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#7A1F3D]" />
    </div>
  );
}
