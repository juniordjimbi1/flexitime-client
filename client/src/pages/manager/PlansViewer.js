// client/src/pages/manager/PlansViewer.js
import React, { useEffect, useMemo, useState } from 'react';
import { listPlans } from '../../api/planner';

export default function PlansViewer() {
  const today = new Date();
  const startDefault = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const endDefault = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10);

  const [start, setStart] = useState(startDefault);
  const [end, setEnd] = useState(endDefault);
  const [status, setStatus] = useState('ALL'); // filtre optionnel
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Utilise le filtre projet global depuis localStorage (comme P6)
  const projectId = (() => {
    const s = localStorage.getItem('ft_project_filter');
    return s ? Number(s) : null;
  })();

  const fetchData = async () => {
    setLoading(true); setMsg('');
    try {
      const params = { start_date: start, end_date: end };
      if (projectId) params.project_id = projectId;
      if (status !== 'ALL') params.status = status;
      const { data } = await listPlans(params);
      setRows(data?.data || []);
      setMsg(`Résultats: ${data?.data?.length || 0}`);
    } catch (e) {
      setRows([]);
      setMsg(e?.response?.data?.message || 'Erreur de chargement');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchData(); /* mount */ }, []); // eslint-disable-line

  // Rafraîchit quand le filtre projet global change
  useEffect(() => {
    const onChange = () => fetchData();
    window.addEventListener('ft_project_filter_changed', onChange);
    return () => window.removeEventListener('ft_project_filter_changed', onChange);
  }, []); // eslint-disable-line

  const grouped = useMemo(() => {
    const g = {};
    for (const r of rows) {
      (g[r.planned_date] ||= []).push(r);
    }
    return g;
  }, [rows]);

  const header = (
    <div className="card mb-3">
      <div className="card-body">
        <form className="row g-2 align-items-end" onSubmit={e=>{e.preventDefault(); fetchData();}}>
          <div className="col-sm-3">
            <label className="form-label">Début</label>
            <input type="date" className="form-control" value={start} onChange={e=>setStart(e.target.value)} />
          </div>
          <div className="col-sm-3">
            <label className="form-label">Fin</label>
            <input type="date" className="form-control" value={end} onChange={e=>setEnd(e.target.value)} />
          </div>
          <div className="col-sm-3">
            <label className="form-label">Statut</label>
            <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="ALL">Tous</option>
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="BLOCKED">Bloqué</option>
              <option value="DONE">Terminé</option>
            </select>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-primary w-100">Filtrer</button>
          </div>
        </form>
        <div className="small text-muted mt-2">
          Filtre projet global : {projectId ? `#${projectId}` : 'Tous les projets'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="m-0">Consultation des programmations</h4>
        <div className="text-muted">{loading ? 'Chargement…' : msg}</div>
      </div>

      {header}

      {Object.keys(grouped).length === 0 ? (
        <div className="alert alert-light">Aucune programmation sur la période.</div>
      ) : (
        Object.keys(grouped).sort().map(date => (
          <div key={date} className="card mb-3">
            <div className="card-header">
              <strong>{new Date(date + 'T00:00:00').toLocaleDateString()}</strong>
              <span className="ms-2 text-muted">({grouped[date].length} tâche(s))</span>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Tâche</th>
                    <th>Équipe</th>
                    <th>Projet</th>
                    <th>Statut</th>
                    <th>Priorité</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[date].map(r => (
                    <tr key={`${date}-${r.task_id}`}>
                      <td>#{r.task_id} — {r.title}</td>
                      <td>{r.team_name || '—'}</td>
                      <td>{r.project_id || '—'}</td>
                      <td>
                        <span className={`badge text-bg-${
                          r.status==='DONE' ? 'success' :
                          r.status==='IN_PROGRESS' ? 'primary' :
                          r.status==='BLOCKED' ? 'danger' : 'secondary'
                        }`}>{r.status}</span>
                      </td>
                      <td>
                        <span className={`badge text-bg-${
                          r.priority==='HIGH' ? 'danger' :
                          r.priority==='MEDIUM' ? 'warning' : 'secondary'
                        }`}>{r.priority || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
