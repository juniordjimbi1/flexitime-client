// client/src/components/people/PeoplePickerModal.js
import React, { useEffect, useMemo, useState } from 'react';
import { getDepartments, getSubdepartments, getTeams, getTeamMembers } from '../../api/lookup';

export default function PeoplePickerModal({ show, onClose, onConfirm, title = 'Ajouter des membres' }) {
  const [deps, setDeps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState({ dep:null, sub:null, team:null });
  const [selectedIds, setSelectedIds] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!show) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getDepartments();
        setDeps(data?.data || []);
      } finally { setLoading(false); }
    })();
  }, [show]);

  useEffect(() => {
    if (!sel.dep) { setSubs([]); setSel(s=>({ ...s, sub:null, team:null })); setTeams([]); setMembers([]); return; }
    (async ()=>{
      const { data } = await getSubdepartments(sel.dep);
      setSubs(data?.data || []);
      setTeams([]); setMembers([]);
      setSel(s=>({ ...s, sub:null, team:null }));
    })();
  }, [sel.dep]);

  useEffect(() => {
    if (!sel.dep && !sel.sub) { setTeams([]); setMembers([]); return; }
    (async ()=>{
      const params = sel.sub ? { subdepartment_id: sel.sub } : { department_id: sel.dep };
      const { data } = await getTeams(params);
      setTeams(data?.data || []);
      setMembers([]);
      setSel(s=>({ ...s, team:null }));
    })();
  }, [sel.sub]);

  useEffect(() => {
    if (!sel.team) { setMembers([]); return; }
    (async ()=>{
      const { data } = await getTeamMembers(sel.team);
      setMembers(data?.data || []);
    })();
  }, [sel.team]);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return members;
    return members.filter(m =>
      (m.first_name || '').toLowerCase().includes(kw) ||
      (m.last_name || '').toLowerCase().includes(kw) ||
      (m.email || '').toLowerCase().includes(kw)
    );
  }, [members, q]);

  const toggle = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const clearAll = () => setSelectedIds([]);

  const onOk = () => {
    if (!selectedIds.length) return onClose && onClose();
    onConfirm && onConfirm(selectedIds);
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : (
              <>
                <div className="row g-2 mb-3">
                  <div className="col-sm-4">
                    <label className="form-label">Département</label>
                    <select className="form-select" value={sel.dep || ''} onChange={e=>setSel(s=>({ ...s, dep: e.target.value ? Number(e.target.value) : null }))}>
                      <option value="">— Tous —</option>
                      {deps.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Sous-département</label>
                    <select className="form-select" value={sel.sub || ''} onChange={e=>setSel(s=>({ ...s, sub: e.target.value ? Number(e.target.value) : null }))} disabled={!deps.length && !sel.dep}>
                      <option value="">— Tous —</option>
                      {subs.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <label className="form-label">Équipe</label>
                    <select className="form-select" value={sel.team || ''} onChange={e=>setSel(s=>({ ...s, team: e.target.value ? Number(e.target.value) : null }))} disabled={!teams.length}>
                      <option value="">— Choisir —</option>
                      {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group mb-2">
                  <span className="input-group-text">🔎</span>
                  <input className="form-control" placeholder="Rechercher un nom ou un email…" value={q} onChange={e=>setQ(e.target.value)} />
                  <button className="btn btn-outline-secondary" onClick={clearAll}>Vider la sélection</button>
                </div>

                <div className="table-responsive" style={{maxHeight: 360, overflowY:'auto'}}>
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{width:40}}></th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr><td colSpan="4" className="text-center text-muted py-4">Aucun membre</td></tr>
                      ) : list.map(m => (
                        <tr key={m.id} onClick={()=>toggle(m.id)} style={{cursor:'pointer'}}>
                          <td>
                            <input className="form-check-input" type="checkbox" checked={selectedIds.includes(m.id)} readOnly />
                          </td>
                          <td>{m.first_name} {m.last_name}</td>
                          <td className="small">{m.email}</td>
                          <td><span className="badge text-bg-secondary">{m.role_code}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={onOk} disabled={!selectedIds.length}>Ajouter {selectedIds.length ? `(${selectedIds.length})` : ''}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
