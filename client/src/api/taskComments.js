// client/src/api/taskComments.js
import api from './axios';

export const listTaskComments = (taskId) =>
  api.get(`/tasks/${taskId}/comments`);

export const addTaskComment = (taskId, body) =>
  api.post(`/tasks/${taskId}/comments`, { body });
