// src/services/checklistApi.js
import http from './http';

export const listChecklist = (taskId) =>
  http.get(`/tasks/${taskId}/checklist`);

export const createChecklistItem = (taskId, payload) =>
  http.post(`/tasks/${taskId}/checklist`, payload);

export const updateChecklistItem = (taskId, itemId, payload) =>
  http.patch(`/tasks/${taskId}/checklist/${itemId}`, payload);

export const deleteChecklistItem = (taskId, itemId) =>
  http.delete(`/tasks/${taskId}/checklist/${itemId}`);

export const reorderChecklist = (taskId, orders) =>
  http.patch(`/tasks/${taskId}/checklist/reorder/batch`, { orders });


export const getChecklistItemLaps = (taskId, itemId) =>
  http.get(`/tasks/${taskId}/checklist/${itemId}/laps`);

export const getTaskTimeTracking = (taskId) =>
  http.get(`/tasks/${taskId}/time-tracking`);
