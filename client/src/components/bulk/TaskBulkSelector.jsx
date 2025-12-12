// client/src/components/bulk/TaskBulkSelector.jsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

/**
 * Liste les tâches (TODO par défaut), avec cases à cocher
 * - Le filtre projet global (navbar) s'applique automatiquement via l'interceptor axios
 */
export default function TaskBulkSelector({ status = 'TODO', onSelectionChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [checked, setChecked] = useState({});
  const [err, setErr] = useState('');

  const fetchTasks = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await api.get('/tasks', { params: { status } });
      setRows(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur de chargement des tâches');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); /* eslint-disable-next-line */ }, [status]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const n = q.toLowerCase();
    return rows.filter(t =>
      (t.title || '').toLowerCase().includes(n) ||
      (t.description || '').toLowerCase().includes(n)
    );
  }, [rows, q]);

  useEffect(() => {
    const ids = Object.entries(checked).filter(([,v])=>!!v).map(([k])=>Number(k));
    onSelectionChange?.(ids);
  }, [checked]); // eslint-disable-line

  const toggleAll = (val) => {
    const next = {};
    filtered.forEach(t => { next[t.id] = val; });
    setChecked(next);
  };

  const toggleOne = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div>Backlog — Sélection multiple</div>
        <div className="d-flex align-items-center gap-2">
          <input
            className="form-control form-control-sm"
            style={{ width: 240 }}
            placeholder="Recherche…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchTasks}>Rafraîchir</button>
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="p-3 text-muted">Chargement…</div>
        ) : err ? (
          <div className="alert alert-danger m-3">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-muted">Aucune tâche.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle m-0">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      onChange={(e)=>toggleAll(e.target.checked)}
                      checked={filtered.every(t=>checked[t.id]) && filtered.length>0}
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Projet</th>
                  <th>Échéance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className={checked[t.id] ? 'table-active' : ''}>
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!checked[t.id]}
                        onChange={()=>toggleOne(t.id)}
                        aria-label={`Sélectionner tâche ${t.id}`}
                      />
                    </td>
                    <td>{t.id}</td>
                    <td><strong>{t.title}</strong><br/><small className="text-muted">{t.description || '—'}</small></td>
                    <td><span className={`badge text-bg-${t.status==='BLOCKED'?'danger':t.status==='IN_PROGRESS'?'warning':t.status==='DONE'?'success':'secondary'}`}>{t.status}</span></td>
                    <td><span className={`badge text-bg-${t.priority==='HIGH'?'danger':t.priority==='MEDIUM'?'warning':'secondary'}`}>{t.priority || '—'}</span></td>
                    <td>{t.project_id || '—'}</td>
                    <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
