// client/src/api/labels.js
import api from './axios';

export const listLabels = () => api.get('/labels');
export const createLabel = (payload) => api.post('/labels', payload);
export const updateLabel = (id, payload) => api.patch(`/labels/${id}`, payload);
export const deleteLabel = (id) => api.delete(`/labels/${id}`);

export const listTaskLabels = (taskId) => api.get(`/labels/tasks/${taskId}`);
export const addLabelsToTask = (taskId, label_ids) => api.post(`/labels/tasks/${taskId}`, { label_ids });
export const removeLabelFromTask = (taskId, labelId) => api.delete(`/labels/tasks/${taskId}/${labelId}`);
