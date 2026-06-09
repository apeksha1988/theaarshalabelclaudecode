import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, formData);
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center" data-testid="login-page">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-light tracking-tight text-[#1A1A1A] mb-4" data-testid="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-[#666666]" data-testid="auth-subtitle">
            {isLogin ? 'Sign in to your account' : 'Join The Aarsha\'s Edit'}
          </p>
        </div>

        <div className="bg-[#F5F0E6] p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-0 top-2 w-5 h-5 text-[#666666]" strokeWidth={1.5} />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-b border-[#EAE5D9] bg-transparent pl-8 py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                    required={!isLogin}
                    data-testid="name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-2 w-5 h-5 text-[#666666]" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b border-[#EAE5D9] bg-transparent pl-8 py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm uppercase tracking-wide text-[#666666] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-2 w-5 h-5 text-[#666666]" strokeWidth={1.5} />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border-b border-[#EAE5D9] bg-transparent pl-8 py-2 focus:outline-none focus:border-[#7A1F3D] transition-colors"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7A1F3D] text-white px-8 py-3 text-sm tracking-[0.1em] uppercase hover:bg-[#5C172E] transition-all duration-300 disabled:opacity-50"
              data-testid="submit-button"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-[#7A1F3D] hover:underline"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#EAE5D9]" />
            <span className="text-xs uppercase tracking-wide text-[#999999]">or</span>
            <div className="flex-1 h-px bg-[#EAE5D9]" />
          </div>

          <div className="mt-6">
            <GoogleSignInButton onError={setError} />
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#666666] hover:text-[#7A1F3D] transition-colors"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-[#666666] hover:text-[#7A1F3D] transition-colors"
              data-testid="continue-guest"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}