// client/src/api/planner.js
import api from './axios';

export function bulkPlan(payload) {
  return api.post('/planner/bulk-plan', payload);
}

export function listPlans(params) {
  // params = { start_date, end_date, project_id?, team_id?, status? }
  return api.get('/planner/plans', { params });
}
