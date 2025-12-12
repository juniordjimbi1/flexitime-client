// client/src/api/axios.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE =
  window.__API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Injecte le Bearer avant chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ft_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;

    if (status === 401) {
      // Session expirée ou invalide → logout global
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_user');
      toast.error(msg || 'Session expirée. Merci de vous reconnecter.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(msg || 'Accès interdit.');
    } else if (status >= 500) {
      toast.error(msg || 'Erreur serveur.');
    } else {
      // Autres erreurs (400/404/422…) — on affiche le message si présent
      if (msg) toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;
