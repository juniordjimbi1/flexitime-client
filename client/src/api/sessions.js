// client/src/api/sessions.js
import api from './axios';

// Liste des sessions de l'utilisateur (optionnel : filtre par date YYYY-MM-DD)
export const listMySessions = async (date) => {
  const params = {};
  if (date) params.date = date;
  const { data } = await api.get('/sessions/my', { params });
  return data.data || data;
};

// Session ouverte actuelle de l'utilisateur
export const getActiveSession = async () => {
  const { data } = await api.get('/sessions/my/open');
  return data.data || data;
};

// Démarrer une session (optionnel : task_id)
export const startSession = async ({ task_id = null } = {}) => {
  const { data } = await api.post('/sessions/start', { task_id });
  return data.data || data;
};

// Arrêter une session par id
export const stopSession = async ({ session_id }) => {
  const { data } = await api.post('/sessions/stop', { session_id });
  return data.data || data;
};
