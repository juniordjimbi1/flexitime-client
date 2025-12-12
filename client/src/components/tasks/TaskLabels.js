// client/src/components/tasks/TaskLabels.js
import React, { useEffect, useState } from 'react';
import {
  listLabels, listTaskLabels, addLabelsToTask, removeLabelFromTask
} from '../../api/labels';

export default function TaskLabels({ taskId, canEdit }) {
  const [all, setAll] = useState([]);
  const [rows, setRows] = useState([]);
  const [pick, setPick] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([listLabels(), listTaskLabels(taskId)]);
      setAll(a.data?.data || []);
      setRows(r.data?.data || []);
    } catch (e) {
      // silencieux
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [taskId]); // eslint-disable-line

  const onAdd = async (e) => {
    e.preventDefault();
    if (!pick.length) return;
    setMsg('Ajout…');
    try {
      const { data } = await addLabelsToTask(taskId, pick.map(Number));
      setRows(data.data || []);
      setPick([]);
      setMsg('Ajout OK');
    } catch (e2) {
      setMsg(e2?.response?.data?.message || 'Erreur');
    }
  };

  const onRemove = async (labelId) => {
    if (!window.confirm('Retirer ce label ?')) return;
    setMsg('Suppression…');
    try {
      const { data } = await removeLabelFromTask(taskId, labelId);
      setRows(data.data || []);
      setMsg('OK');
    } catch (e2) {
      setMsg(e2?.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <div className="mb-2">
        {rows.length === 0 ? (
          <span className="text-muted">Aucun label</span>
        ) : rows.map(l => (
          <span key={l.id} className="badge rounded-pill text-bg-secondary me-2">
            {l.name}{l.color ? ` (${l.color})` : ''}
            {canEdit && (
              <button type="button" className="btn btn-sm btn-link text-light ms-1 p-0"
                      onClick={()=>onRemove(l.id)} aria-label="Remove label">✕</button>
            )}
          </span>
        ))}
      </div>

      {canEdit && (
        <form className="d-flex align-items-center gap-2" onSubmit={onAdd}>
          <select className="form-select" multiple style={{ minHeight: 90 }} value={pick} onChange={(e)=>{
            const opts = Array.from(e.target.selectedOptions).map(o=>o.value);
            setPick(opts);
          }}>
            {all.map(l => <option value={l.id} key={l.id}>{l.name}{l.color ? ` (${l.color})` : ''}</option>)}
          </select>
          <button className="btn btn-outline-primary">Ajouter</button>
          {msg && <span className="small text-muted">{msg}</span>}
        </form>
      )}

      {loading && <div className="text-muted mt-1">Chargement…</div>}
    </div>
  );
}
