import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function CustomDressPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    dress_type: '',
    description: '',
    measurements: '',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        email: user?.email || formData.email,
        budget: formData.budget ? parseInt(formData.budget) : null,
      };
      await api.post('/custom-dress', payload);
      setSuccess(true);
      setTimeout(() => {
        if (user) {
          navigate('/dashboard');
        } else {
          setSuccess(false);
          setFormData({
            email: '',
            name: '',
            phone: '',
            dress_type: '',
            description: '',
            measurements: '',
            budget: '',
          });
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center" data-testid="success-message">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-light text-[#1A1A1A] mb-4">Request Submitted!</h2>
          <p className="text-[#666666] mb-6">Thank you for your custom dress request. Our team will review it and contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20" data-testid="custom-dress-page">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <div className="aspect-[16/9] bg-[#F5F0E6] overflow-hidden mb-8">
            <img
              src="/images/custom-dress.png"
              alt="Custom ethnic dress"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A1F3D] mb-4" data-testid="custom-dress-overline">Bespoke Creations</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light tracking-tight text-[#1A1A1A] mb-6" data-testid="custom-dress-title">
            Request a Custom Ethnic Dress
          </h1>
          <p className="text-base font-light leading-relaxed text-[#1A1A1A] max-w-2xl" data-testid="custom-dress-description">
            Share your vision with our master artisans. From traditional lehengas to contemporary fusion wear, we'll bring your dream dress to life with meticulous attention to detail.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#F5F0E6] p-8 md:p-12 space-y-6">
          {!user && (
            <div>
              <label htmlFor="email" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                required
                data-testid="email-input"
              />
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
              required
              data-testid="name-input"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
              required
              data-testid="phone-input"
            />
          </div>

          <div>
            <label htmlFor="dress_type" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
              Type of Dress *
            </label>
            <select
              id="dress_type"
              value={formData.dress_type}
              onChange={(e) => setFormData({ ...formData, dress_type: e.target.value })}
              className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
              required
              data-testid="dress-type-select"
            >
              <option value="">Select...</option>
              <option value="lehenga">Lehenga</option>
              <option value="saree">Saree</option>
              <option value="anarkali">Anarkali</option>
              <option value="salwar_kameez">Salwar Kameez</option>
              <option value="gown">Indo-Western Gown</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full border border-[#EAE5D9] bg-transparent p-3 focus:outline-none focus:border-[#7A1F3D] transition-colors"
              placeholder="Describe your vision: colors, fabrics, embellishments, style preferences..."
              required
              data-testid="description-textarea"
            ></textarea>
          </div>

          <div>
            <label htmlFor="measurements" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
              Measurements (Optional)
            </label>
            <textarea
              id="measurements"
              value={formData.measurements}
              onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
              rows={4}
              className="w-full border border-[#EAE5D9] bg-transparent p-3 focus:outline-none focus:border-[#7A1F3D] transition-colors"
              placeholder="Bust, waist, hips, length, etc. (We'll also arrange for precise measurements later)"
              data-testid="measurements-textarea"
            ></textarea>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
              Budget (₹) (Optional)
            </label>
            <input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full border-b border-[#EAE5D9] bg-transparent py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
              placeholder="e.g., 500"
              data-testid="budget-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#7A1F3D] text-white px-8 py-4 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-50"
            data-testid="submit-request-button"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}