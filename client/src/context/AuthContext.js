import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('ft_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true); // hydratation /me au mount
  const [error, setError] = useState(null);

  async function login(email, password) {
    setError(null);
    const res = await api.post('/auth/login', { email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('ft_token', token);
    localStorage.setItem('ft_user', JSON.stringify(u));
    setUser(u);
    return u; // pour router en fonction du rôle
  }

  function logout() {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    setUser(null);
    window.location.href = '/login';
  }

  async function refreshMe() {
    try {
      const res = await api.get('/users/me');
      const u = res.data.data;
      localStorage.setItem('ft_user', JSON.stringify(u));
      setUser(u);
    } catch {
      // 401 est géré par l’interceptor → logout automatique
    }
  }

  useEffect(() => {
    // Si token présent → tente /me ; sinon fin du loading
    const token = localStorage.getItem('ft_token');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshMe().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { user, loading, error, setError, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
