// client/src/api/gdpr.js
import api from './axios';

export const previewGDPR = (userId) => api.get(`/gdpr/preview/${userId}`);
export const executeGDPR = (userId, note='') => api.post(`/gdpr/execute/${userId}`, { confirm: 'YES', note });
