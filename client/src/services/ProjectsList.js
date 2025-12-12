// src/pages/projects/ProjectsList.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, createProject, archiveProject } from '../../services/projectsApi';

export default function ProjectsList() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  // On met un filtre "ALL" pour éviter d'envoyer status si non supporté côté backend
  const [status, setStatus] = useState('ALL');
  const [form, setForm] = useState({ name: '', code: '' });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      // On n'envoie status que s'il est différent de ALL
      const params = {};
      if (status !== 'ALL') params.status = status;
      if (q.trim().length >= 2) params.q = q.trim();

      const { data } = await listProjects(params);
      setRows(data?.data || data || []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Erreur de chargement des projets';
      setError(msg);
      // Essaye d'extraire les détails de validation si présents
      const details = e?.response?.data?.details;
      if (details && Array.isArray(details)) {
        console.warn('Validation details:', details);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); /* au montage */ }, []);
  // Filtrage client sur saisie q pour être confortable (appel API sur Enter/btn)
  const filtered = useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter(r =>
      (r.name || '').toLowerCase().includes(needle) ||
      (r.code || '').toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const onSearch = (e) => {
    e?.preventDefault?.();
    fetchData();
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await createProject({ name: form.name.trim(), code: form.code.trim() || undefined });
      setForm({ name: '', code: '' });
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Création impossible');
    } finally { setCreating(false); }
  };

  const onArchive = async (id) => {
    if (!window.confirm('Archiver ce projet ?')) return;
    try {
      await archiveProject(id);
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Action impossible');
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Projets</h4>
        <form className="d-flex align-items-center gap-2" onSubmit={onSearch}>
          <select
            className="form-select form-select-sm"
            style={{ width: 160 }}
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
            title="Filtrer côté API si supporté"
          >
            <option value="ALL">Tous</option>
            <option value="ACTIVE">Actifs</option>
            <option value="ARCHIVED">Archivés</option>
          </select>
          <input
            className="form-control form-control-sm"
            style={{ width: 220 }}
            placeholder="Recherche (min. 2 lettres)…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <button className="btn btn-sm btn-outline-primary" type="submit">Rechercher</button>
        </form>
      </div>

      {/* Create (Admin/Manager) */}
      <div className="card mb-3">
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={onCreate}>
            <div className="col-sm-5">
              <label className="form-label">Nom</label>
              <input className="form-control" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col-sm-4">
              <label className="form-label">Code</label>
              <input className="form-control" value={form.code} onChange={(e)=>setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="col-sm-3">
              <button className="btn btn-primary w-100" disabled={creating}>{creating ? 'Création...' : 'Créer'}</button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Chargement…</div>
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
                    <span className={`badge text-bg-${p.status === 'ARCHIVED' ? 'secondary':'success'}`}>{p.status || '—'}</span>
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
