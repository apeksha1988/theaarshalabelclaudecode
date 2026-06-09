import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// The Client ID is public (it ships in the frontend bundle); env var can override.
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '52599065883-2o7m5adv4j45d30gdqqgks1elcsrdv0l.apps.googleusercontent.com';

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function GoogleSignInButton({ onError }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const clientRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const init = () => {
      if (!window.google?.accounts?.oauth2) return;
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: async (resp) => {
          if (resp.error || !resp.access_token) {
            setBusy(false);
            return; // user closed the popup
          }
          try {
            const res = await api.post('/auth/google', { access_token: resp.access_token });
            login(res.data);
            navigate('/');
          } catch (err) {
            if (onError) onError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
          } finally {
            setBusy(false);
          }
        },
      });
      setReady(true);
    };

    if (window.google?.accounts?.oauth2) {
      init();
    } else {
      let script = document.getElementById('google-gsi');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
      script.addEventListener('load', init);
      return () => script.removeEventListener('load', init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (!clientRef.current) return;
    setBusy(true);
    clientRef.current.requestAccessToken();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready || busy}
      className="w-full flex items-center justify-center gap-3 border border-[#D8CFC0] bg-white py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF7F1] transition-colors disabled:opacity-60"
      data-testid="google-signin"
    >
      <GoogleLogo />
      {busy ? 'Connecting…' : 'Continue with Google'}
    </button>
  );
}
