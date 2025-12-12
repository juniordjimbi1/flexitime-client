// client/src/services/pagedApi.js
import http from './http';

const qs = (obj = {}) => new URLSearchParams(obj).toString();

export const getMySessionsPaged = (params = {}) =>
  http.get(`/paged/sessions/my?${qs(params)}`);

export const getDayCloseFilesPaged = (dayCloseId, params = {}) =>
  http.get(`/paged/dayclose/${dayCloseId}/files?${qs(params)}`);

export const getTeamCloseFilesPaged = (teamCloseId, params = {}) =>
  http.get(`/paged/teamclose/${teamCloseId}/files?${qs(params)}`);

export const getProjectsPaged = (params = {}) =>
  http.get(`/paged/projects?${qs(params)}`);

export const getProjectMembersPaged = (projectId, params = {}) =>
  http.get(`/paged/projects/${projectId}/members?${qs(params)}`);

export const getTeamsPaged = (params = {}) =>
  http.get(`/paged/teams?${qs(params)}`);
