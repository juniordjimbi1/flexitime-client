// client/src/pages/admin/LabelsAdmin.js
import React, { useEffect, useState } from 'react';
import { listLabels, createLabel, updateLabel, deleteLabel } from '../../api/labels';

export default function LabelsAdmin() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', color: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listLabels();
      setRows(data?.data || []);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createLabel({ name: form.name.trim(), color: form.color.trim() || null });
    setForm({ name: '', color: '' });
    await load();
  };

  const onUpdate = async (l) => {
    const name = window.prompt('Nom', l.name);
    if (name == null) return;
    const color = window.prompt('Couleur (optionnel)', l.color || '');
    await updateLabel(l.id, { name: name.trim(), color: color.trim() || null });
    await load();
  };

  const onDelete = async (l) => {
    if (!window.confirm('Supprimer ce label ?')) return;
    await deleteLabel(l.id);
    await load();
  };

  return (
    <div className="container py-3">
      <h4 className="mb-3">Labels (catalogue)</h4>

      <div className="card mb-3">
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={onCreate}>
            <div className="col-sm-5">
              <label className="form-label">Nom</label>
              <input className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            </div>
            <div className="col-sm-4">
              <label className="form-label">Couleur (ex: red, #AABBCC)</label>
              <input className="form-control" value={form.color} onChange={e=>setForm({...form, color:e.target.value})} />
            </div>
            <div className="col-sm-3">
              <button className="btn btn-primary w-100">Créer</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th>#</th><th>Nom</th><th>Couleur</th><th className="text-end">Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-muted">Chargement…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="4" className="text-muted">Aucun label.</td></tr>
              ) : rows.map(l => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.name}</td>
                  <td>{l.color || '—'}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>onUpdate(l)}>Renommer</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(l)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
