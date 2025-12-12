// client/src/pages/projects/ProjectReporting.js
import React from 'react';
import { getProjectSummary } from '../../services/reportingApi';
import { listProjects } from '../../services/projectsApi'; // ← correction ici
import TeamDepartmentPicker from '../../components/org/TeamDepartmentPicker';
import { useAuth } from '../../context/AuthContext';

export default function ProjectReporting() {
  const { user } = useAuth();
  const [from, setFrom] = React.useState(() => new Date().toISOString().slice(0,10).replace(/-\d{2}$/, '-01'));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0,10));
  const [filters, setFilters] = React.useState({ departmentId: '', teamId: '' });
  const [projectId, setProjectId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [data, setData] = React.useState(null);
  const [projects, setProjects] = React.useState([]);

  // charger projets pour le select
  React.useEffect(() => {
    let mounted = true;
    listProjects().then(r => {
      if (!mounted) return;
      setProjects(r?.data?.data || r?.data || []);
    }).catch(()=>{});
    return () => { mounted = false; };
  }, []);

  const load = React.useCallback(() => {
    setLoading(true); setError('');
    const params = {
      from,
      to,
      projectId: projectId || '',
    };
    if (filters.teamId) params.teamId = filters.teamId;
    getProjectSummary(params)
      .then(r => setData(r?.data?.data || null))
      .catch(e => setError(e?.response?.data?.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [from, to, projectId, filters.teamId]);

  React.useEffect(() => { load(); }, []);

  const total = data?.total || {};
  const list = data?.projects || [];

  return (
    <div className="container py-3">
      <h2 className="mb-3">Reporting par projet</h2>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-sm-6 col-md-3">
              <label className="form-label">Du</label>
              <input type="date" className="form-control" value={from} onChange={e=>setFrom(e.target.value)} />
            </div>
            <div className="col-sm-6 col-md-3">
              <label className="form-label">Au</label>
              <input type="date" className="form-control" value={to} onChange={e=>setTo(e.target.value)} />
            </div>

            <div className="col-12">
              <TeamDepartmentPicker
                value={filters}
                onChange={setFilters}
                className="mt-2"
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <label className="form-label">Projet</label>
              <select className="form-select" value={projectId} onChange={e=>setProjectId(e.target.value)}>
                <option value="">Tous</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name || `#${p.id}`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? 'Chargement…' : 'Actualiser'}
            </button>
            {error ? <span className="text-danger">{error}</span> : null}
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <span className="badge text-bg-primary">Total minutes : {total.total_minutes ?? 0}</span>
        <span className="badge text-bg-secondary">Sessions : {total.sessions_count ?? 0}</span>
        <span className="badge text-bg-success">Utilisateurs : {total.distinct_users ?? 0}</span>
        <span className="badge text-bg-dark">DONE : {total.tasks_done ?? 0}</span>
        <span className="badge text-bg-light">
          Période : {(data?.range?.from || from)} → {(data?.range?.to || to)}
        </span>
      </div>

      {loading ? (
        <div className="alert alert-info">Chargement…</div>
      ) : !list.length ? (
        <div className="alert alert-warning">Aucune donnée pour ces filtres.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Projet</th>
                <th className="text-end">Minutes</th>
                <th className="text-end">Sessions</th>
                <th className="text-end">Utilisateurs</th>
                <th className="text-end">DONE</th>
              </tr>
            </thead>
            <tbody>
              {list.map(row => (
                <tr key={row.project_id}>
                  <td>{row.project_name || `Projet #${row.project_id}`}</td>
                  <td className="text-end">{row.total_minutes}</td>
                  <td className="text-end">{row.sessions_count}</td>
                  <td className="text-end">{row.distinct_users}</td>
                  <td className="text-end">{row.tasks_done}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
