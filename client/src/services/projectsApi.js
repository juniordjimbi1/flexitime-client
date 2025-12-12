// client/src/services/projectsApi.js
import api from '../api/axios';

// ---- Projects ----
export const listProjects = async (params = {}) => {
  const clean = {};
  if (typeof params.q === 'string' && params.q.trim().length >= 2) {
    clean.q = params.q.trim();
  }
  if (params.status && ['ACTIVE', 'ARCHIVED'].includes(params.status)) {
    clean.status = params.status;
  }

  try {
    return await api.get(
      '/projects',
      Object.keys(clean).length ? { params: clean } : undefined
    );
  } catch (e) {
    if (e?.response?.status === 422) {
      // fallback sans filtres si la validation côté back râle
      return await api.get('/projects');
    }
    throw e;
  }
};

export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (payload) => api.post('/projects', payload);
export const updateProject = (id, payload) =>
  api.patch(`/projects/${id}`, payload);
export const archiveProject = (id) => api.delete(`/projects/${id}`);

// ---- Project members ----
export const listProjectMembers = (projectId) =>
  api.get(`/projects/${projectId}/members`);

export const addProjectMember = (projectId, payload) =>
  api.post(`/projects/${projectId}/members`, payload);

export const removeProjectMember = (projectId, userId) =>
  api.delete(`/projects/${projectId}/members/${userId}`);

// Batch add (ProjectMembersPanel)
export const addMembersBatch = (projectId, userIds) =>
  api.post(`/projects/${projectId}/members/batch`, { user_ids: userIds });

// ✅ Membres éligibles pour les tâches (EMPLOYEE + MANAGER dans le projet/équipe)
export const listEligibleMembers = (projectId) =>
  api.get(`/projects/${projectId}/eligible-members`);

// ---- Tasks (by project / status moves) ----
export const listTasksByProject = (projectId, params = {}) =>
  api.get('/tasks', { params: { project_id: projectId, ...params } });

export const createTaskForProject = (projectId, payload) =>
  api.post('/tasks', { ...payload, project_id: projectId });

export const updateTask = (id, payload) =>
  api.put(`/tasks/${id}`, payload);

// ✅ Utilise l’endpoint dédié au changement de statut
//    => PATCH /tasks/:id/status (ouvert à tout user authentifié, contrôles dans updateStatus)
export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status });

// Assignation des utilisateurs à une tâche
export const setTaskAssignees = (taskId, userIds) =>
  api.post(`/tasks/${taskId}/assign`, { user_ids: userIds });

export const listMyTasks = (params = {}) =>
  api.get('/tasks/my', { params });
