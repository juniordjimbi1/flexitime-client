// src/pages/projects/ProjectsList.js
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, createProject, archiveProject } from '../../services/projectsApi';
import http from '../../services/http'; // axios préconfiguré de l'app

// (optionnel) détection rôle best-effort pour réduire le flicker visuel
function readRoleFrom(obj) {
  try {
    if (!obj) return null;
    if (typeof obj === 'string') {
      try { obj = JSON.parse(obj); } catch {}
    }
    if (obj && typeof obj === 'object') {
      if (obj.role) return obj.role;
      if (obj.user && obj.user.role) return obj.user.role;
      if (obj.me && obj.me.role) return obj.me.role;
      if (obj.currentUser && obj.currentUser.role) return obj.currentUser.role;
    }
  } catch {}
  return null;
}
function getCurrentRole() {
  const lsKeys = ['auth','user','me','currentUser','profile','session','state'];
  for (const k of lsKeys) {
    const v = localStorage.getItem(k);
    const r = readRoleFrom(v);
    if (r) return r;
  }
  const globals = [window.__ME__, window.__AUTH__, window.__USER__];
  for (const g of globals) {
    const r = readRoleFrom(g);
    if (r) return r;
  }
  return null;
}

export default function ProjectsList() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [form, setForm] = useState({
  name: '',
  code: '',
  description: '',
  end_date: '',
});

  const [creating, setCreating] = useState(false);

  // ---- Capability probe (RBAC front-only fiable) ----
  // Stratégie anti-flicker : si on détecte explicitement EMPLOYEE, on cache d’emblée.
  const roleInitial = (getCurrentRole() || '').toString().toUpperCase();
  const [canCreate, setCanCreate] = useState(roleInitial === 'EMPLOYEE' ? false : true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Envoi volontairement invalide pour provoquer 422 chez ADMIN/MANAGER,
        // et 403 chez EMPLOYEE (RBAC) — aucun projet n'est créé.
        await http.post('/projects', {}); // pas de name => 422 attendu si autorisé
        if (!alive) return;
        // Si le back n’a pas renvoyé 403, on autorise l’affichage
        setCanCreate(true);
      } catch (e) {
        if (!alive) return;
        const s = e?.response?.status;
        if (s === 403) {
          setCanCreate(false); // employé
        } else {
          // 400/422/500 → on ne masque pas (le back gérera l'échec de création réelle)
          setCanCreate(true);
        }
      }
    })();
    return () => { alive = false; };
  }, []);
  // ---- fin probe ----

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await listProjects({ status, q });
      setRows(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [status]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter(r =>
      (r.name || '').toLowerCase().includes(needle) ||
      (r.code || '').toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const onCreate = async (e) => {
  e.preventDefault();
  if (!form.name.trim()) return;
  setCreating(true);
  try {
    await createProject({
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || null,
      // end_date est une date HTML (YYYY-MM-DD) → on envoie tel quel
      end_date: form.end_date || null,
    });
    setForm({ name: '', code: '', description: '', end_date: '' });
    await fetchData();
  } catch (e) {
    alert(e.response?.data?.message || 'Création impossible');
  } finally {
    setCreating(false);
  }
};


  const onArchive = async (id) => {
    if (!window.confirm('Archiver ce projet ?')) return;
    try {
      await archiveProject(id);
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Action impossible');
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Projets</h4>
        <div>
          <select
            className="form-select form-select-sm d-inline-block me-2"
            style={{ width: 160 }}
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
          >
            <option value="ACTIVE">Actifs</option>
            <option value="ARCHIVED">Archivés</option>
          </select>
          <input
            className="form-control form-control-sm d-inline-block"
            style={{ width: 220 }}
            placeholder="Recherche..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Create — affiché si autorisé par le probe (EMPLOYEE => caché) */}
      {canCreate && (
        <div className="card mb-3">
          <div className="card-body">
            <form className="row g-2 align-items-end" onSubmit={onCreate}>
  <div className="col-md-4">
    <label className="form-label">Nom</label>
    <input
      className="form-control"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      required
    />
  </div>
  <div className="col-md-3">
    <label className="form-label">Code</label>
    <input
      className="form-control"
      value={form.code}
      onChange={(e) => setForm({ ...form, code: e.target.value })}
      placeholder="Optionnel"
    />
  </div>
  <div className="col-md-3">
    <label className="form-label">Échéance du projet</label>
    <input
      type="date"
      className="form-control"
      value={form.end_date}
      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
      required
    />
  </div>
  <div className="col-md-12">
    <label className="form-label">Description</label>
    <textarea
      className="form-control"
      rows={2}
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
      placeholder="Objectif, périmètre, contexte…"
    />
  </div>
  <div className="col-md-2 ms-auto">
    <button className="btn btn-primary w-100" disabled={creating}>
      {creating ? 'Création...' : 'Créer'}
    </button>
  </div>
</form>

          </div>
        </div>
      )}

      {loading ? (
        <div className="alert alert-info">Chargement...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-light">Aucun projet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Code</th>
                <th>Manager</th>
                <th>Période</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><Link to={`/projects/${p.id}`}>{p.name}</Link></td>
                  <td>{p.code || '-'}</td>
                  <td>{p.manager_name || '-'}</td>
                  <td>
                    <small>
                      {p.start_date ? new Date(p.start_date).toLocaleDateString() : '—'} → {p.end_date ? new Date(p.end_date).toLocaleDateString() : '—'}
                    </small>
                  </td>
                  <td>
                    <span className={`badge text-bg-${p.status === 'ARCHIVED' ? 'secondary':'success'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link to={`/projects/${p.id}`} className="btn btn-sm btn-outline-primary me-2">Ouvrir</Link>
                    {p.status !== 'ARCHIVED' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>onArchive(p.id)}>Archiver</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
