import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// The Client ID is public (it ships in the frontend bundle); env var can override.
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '52599065883-2o7m5adv4j45d30gdqqgks1elcsrdv0l.apps.googleusercontent.com';

export default function GoogleSignInButton({ onError }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const divRef = useRef(null);

  useEffect(() => {
    const handleCredential = async (resp) => {
      try {
        const res = await api.post('/auth/google', { credential: resp.credential });
        login(res.data);
        navigate('/');
      } catch (err) {
        if (onError) onError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
      }
    };

    const init = () => {
      if (!window.google?.accounts?.id || !divRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
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

  return <div ref={divRef} className="flex justify-center" data-testid="google-signin" />;
}
