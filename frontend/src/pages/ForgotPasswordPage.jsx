import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Mail, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center" data-testid="forgot-password-page">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4">Forgot Password</h1>
          <p className="text-sm text-[#666666]">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-[#F5F0E6] p-8">
          {sent ? (
            <div className="text-center" data-testid="forgot-success">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#7A1F3D] text-white mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-serif font-medium text-[#1A1A1A] mb-2">Check your email</h2>
              <p className="text-sm text-[#666666] mb-6">
                If that email is registered, a password reset link is on its way. The link expires in 1 hour.
              </p>
              <Link to="/login" className="text-sm text-[#7A1F3D] hover:underline uppercase tracking-wide">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="forgot-error">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-2 w-5 h-5 text-[#666666]" strokeWidth={1.5} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b border-[#EAE5D9] bg-transparent pl-8 py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="forgot-email-input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7A1F3D] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-50"
                  data-testid="forgot-submit"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-[#666666] hover:text-[#7A1F3D] transition-colors">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
