// client/src/services/reportingApi.js
import http from './http';

export const getProjectSummary = (params = {}) => {
  const q = new URLSearchParams(params);
  return http.get(`/reporting/projects/summary?${q.toString()}`);
};
