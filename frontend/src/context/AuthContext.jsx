import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      localStorage.setItem('wasAuthenticated', '1');
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('wasAuthenticated', '1');
  };

  const logout = async () => {
    // Remove the flag first so the 401 interceptor doesn't treat logout as an
    // expired session.
    localStorage.removeItem('wasAuthenticated');
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    // Empty the cart on logout.
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('clear-cart'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAuth: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}