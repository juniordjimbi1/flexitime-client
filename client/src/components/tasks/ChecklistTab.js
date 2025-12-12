// src/components/tasks/ChecklistTab.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  listChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklist,
  getChecklistItemLaps
} from '../../services/checklistApi';
import { useAuth } from '../../context/AuthContext';


function LapBadge({ taskId, itemId }) {
  const [minutes, setMinutes] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    getChecklistItemLaps(taskId, itemId)
      .then((r) => {
        if (!mounted) return;
        const payload = r?.data?.data || {};
        let m = 0;

        if (typeof payload.total_minutes === 'number') {
          m = payload.total_minutes;
        } else if (Array.isArray(payload.items)) {
          const totalSeconds = payload.items.reduce(
            (acc, lap) => acc + (Number(lap.duration_seconds) || 0),
            0
          );
          m = Math.round(totalSeconds / 60);
        }

        setMinutes(m);
      })
      .catch(() => {
        if (!mounted) return;
        setMinutes(0);
      });

    return () => {
      mounted = false;
    };
  }, [taskId, itemId]);

  if (minutes === null) {
    return <span className="badge text-bg-secondary ms-2">⏱ …</span>;
  }

  if (!minutes) {
    // Pas encore de temps enregistré pour cet item -> on n'affiche rien
    return null;
  }

  return (
    <span
      className="badge text-bg-secondary ms-2"
      title="Temps passé sur cet item (approximation)"
    >
      ⏱ {minutes} min
    </span>
  );
}


export default function ChecklistTab({ task, onProgress }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, done: 0, progress: 0, visibility: 'public' });
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  const canSeePrivate = meta.visibility === 'all'; // côté backend, employé assigné
  const canCreatePrivate = (user?.role?.code === 'EMPLOYEE') && canSeePrivate;

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await listChecklist(task.id);
      setRows(data.data || []);
      setMeta(data.meta || { total: 0, done: 0, progress: 0, visibility: 'public' });
      onProgress?.(data.meta?.progress || 0);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur checklist');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (task?.id) fetchData(); /* eslint-disable-next-line */ }, [task?.id]);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createChecklistItem(task.id, { content: content.trim(), is_private: isPrivate });
      setContent(''); setIsPrivate(false);
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Ajout impossible');
    }
  };

  const toggleDone = async (item) => {
    try {
      await updateChecklistItem(task.id, item.id, { is_done: !item.is_done });
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Mise à jour impossible');
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm('Supprimer cet item ?')) return;
    try {
      await deleteChecklistItem(task.id, item.id);
      await fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Suppression impossible');
    }
  };

  // Drag & drop simple pour réordonner
  const [dragId, setDragId] = useState(null);
  const onDragStart = (e, id) => { setDragId(id); };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = async (e, targetId) => {
    e.preventDefault();
    if (dragId == null || dragId === targetId) return;

    const current = [...rows];
    const from = current.findIndex(i => i.id === dragId);
    const to = current.findIndex(i => i.id === targetId);
    if (from < 0 || to < 0) return;

    const moved = current.splice(from, 1)[0];
    current.splice(to, 0, moved);

    // recalcul des sort_order en mémoire
    const orders = current.map((it, idx) => ({ id: it.id, sort_order: idx }));
    setRows(current);

    try {
      await reorderChecklist(task.id, orders);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Réordonnancement impossible');
      fetchData();
    } finally {
      setDragId(null);
    }
  };

  const progressBar = useMemo(() => {
    const p = meta.progress || 0;
    return (
      <div className="progress" role="progressbar" aria-valuenow={p} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-bar" style={{ width: `${p}%` }}>{p}%</div>
      </div>
    );
  }, [meta.progress]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-light">Items: {meta.total}</span>
          <span className="badge text-bg-success">Done: {meta.done}</span>
          <span className="badge text-bg-primary">Progress: {meta.progress}%</span>
          {canSeePrivate ? (
            <span className="badge text-bg-dark">Vue: tout</span>
          ) : (
            <span className="badge text-bg-secondary">Vue: public</span>
          )}
        </div>
        <div style={{ minWidth: 180 }}>{progressBar}</div>
      </div>

      {/* Formulaire ajout */}
      <form className="row g-2 align-items-center mb-3" onSubmit={onAdd}>
        <div className="col">
          <input
            className="form-control"
            placeholder="Nouvel item…"
            value={content}
            onChange={(e)=>setContent(e.target.value)}
          />
        </div>
        {canCreatePrivate && (
          <div className="col-auto form-check">
            <input className="form-check-input" type="checkbox" id="chkPrivate" checked={isPrivate} onChange={(e)=>setIsPrivate(e.target.checked)} />
            <label className="form-check-label" htmlFor="chkPrivate">Privé</label>
          </div>
        )}
        <div className="col-auto">
          <button className="btn btn-primary">Ajouter</button>
        </div>
      </form>

      {/* Liste des items */}
      {loading ? (
        <div className="text-muted">Chargement…</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : rows.length === 0 ? (
        <div className="alert alert-light">Aucun item pour l’instant.</div>
      ) : (
        <ul className="list-group">
          {rows.map(item => (
            <li
              key={item.id}
              className="list-group-item d-flex align-items-center justify-content-between"
              draggable
              onDragStart={(e)=>onDragStart(e, item.id)}
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(e, item.id)}
              style={{ cursor: 'grab' }}
              aria-label={`Checklist ${item.content} <LapBadge taskId={task.id} itemId={item.id} />`}
            >
              <div className="d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={!!item.is_done}
                  onChange={()=>toggleDone(item)}
                  title="Marquer terminé"
                />
                <span className={item.is_done ? 'text-decoration-line-through text-muted' : ''}>
                  {item.content} <LapBadge taskId={task.id} itemId={item.id} />
                </span>
                {item.is_private ? <span className="badge text-bg-dark ms-1">Privé</span> : null}
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>removeItem(item)} title="Supprimer">
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
