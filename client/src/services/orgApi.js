// client/src/services/orgApi.js
import http from './http';

/**
 * ⚙️ Si tes endpoints sont /org/departments et /org/teams,
 * change simplement BASE = '/org' ci-dessous (et ajuste les .get()).
 */
const BASE = ''; // rester vide si /departments et /teams existent à la racine

export const listDepartments = () => http.get(`${BASE}/departments`);

export const listTeams = (params = {}) => {
  const q = new URLSearchParams(params);
  // attendu: /teams?departmentId=<id>
  return http.get(`${BASE}/teams?${q.toString()}`);
};

const orgApi = { listDepartments, listTeams };
export default orgApi;
