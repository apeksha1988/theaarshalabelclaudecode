import React, { useState } from 'react';
import api from '../lib/api';
import { Mail, Check, Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact error:', err);
      alert('Sorry, your message could not be sent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="contact-page">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4" data-testid="contact-title">
            Contact Us
          </h1>
          <p className="text-[#666666]">
            Questions about a piece, a custom request, or your order? Send us a message and we'll get back to you.
          </p>
        </div>

        {sent ? (
          <div className="bg-[#F5F0E6] p-10 text-center" data-testid="contact-success">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#7A1F3D] text-white mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif font-medium text-[#1A1A1A] mb-2">Message sent</h2>
            <p className="text-[#666666] mb-6">Thank you for reaching out — we'll reply soon.</p>
            <button
              onClick={() => setSent(false)}
              className="text-[#7A1F3D] hover:underline text-sm uppercase tracking-wide"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#F5F0E6] p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">Name *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                required
                data-testid="contact-name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">Email *</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                required
                data-testid="contact-email"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">Message *</label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors resize-none"
                required
                data-testid="contact-message"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="contact-submit"
            >
              {loading ? 'Sending...' : (<><Send className="w-4 h-4" /> Send Message</>)}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-[#666666] flex items-center justify-center gap-2">
          <Mail className="w-4 h-4 text-[#7A1F3D]" /> We typically respond within 1–2 business days.
        </div>
      </div>
    </div>
  );
}
