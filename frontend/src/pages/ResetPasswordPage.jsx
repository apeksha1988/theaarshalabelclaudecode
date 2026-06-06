import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Lock, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center" data-testid="reset-password-page">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4">Reset Password</h1>
          <p className="text-sm text-[#666666]">Choose a new password for your account.</p>
        </div>

        <div className="bg-[#F5F0E6] p-8">
          {!token ? (
            <div className="text-center text-[#666666]" data-testid="reset-no-token">
              <p className="mb-4">This reset link is invalid or incomplete.</p>
              <Link to="/forgot-password" className="text-sm text-[#7A1F3D] hover:underline uppercase tracking-wide">
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center" data-testid="reset-success">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#7A1F3D] text-white mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-serif font-medium text-[#1A1A1A] mb-2">Password updated</h2>
              <p className="text-sm text-[#666666] mb-4">You can now sign in with your new password. Redirecting…</p>
              <Link to="/login" className="text-sm text-[#7A1F3D] hover:underline uppercase tracking-wide">Sign in now</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="reset-error">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-2 w-5 h-5 text-[#666666]" strokeWidth={1.5} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-b border-[#EAE5D9] bg-transparent pl-8 py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="reset-password-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-2 w-5 h-5 text-[#666666]" strokeWidth={1.5} />
                    <input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full border-b border-[#EAE5D9] bg-transparent pl-8 py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                      required
                      data-testid="reset-confirm-input"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7A1F3D] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-50"
                  data-testid="reset-submit"
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
