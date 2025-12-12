// client/src/api/lookup.js
import api from './axios';

export const getDepartments = () => api.get('/lookup/org/departments');
export const getSubdepartments = (department_id) => api.get('/lookup/org/subdepartments', { params: { department_id } });
export const getTeams = (params) => api.get('/lookup/org/teams', { params });
export const getTeamMembers = (team_id) => api.get('/lookup/org/team-members', { params: { team_id } });
