// client/src/api/notifications.js
import api from './axios';

export const listNotifications = (params) => api.get('/notifications', { params });
export const markRead = (ids) => api.patch('/notifications/read', { ids });

// Pour tests depuis l'app (Manager/Admin)
export const simulateNotification = (payload) => api.post('/notifications/simulate', payload);
