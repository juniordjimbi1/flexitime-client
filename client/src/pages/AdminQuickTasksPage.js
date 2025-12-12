import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner } from '../components/UX';

export default function AdminQuickTasksPage() {
  const [loading, setLoading] = useState(true);

  // filtres utilisateurs (on réutilise /teams/manage/users)
  const [depId, setDepId] = useState('');
  const [subId, setSubId] = useState('');
  const [q, setQ] = useState('');
  const [deps, setDeps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');

  // tabs
  const [tab, setTab] = useState('assign'); // assign | backlog | schedule

  // forms
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [repeatWeek, setRepeatWeek] = useState(false);
  const [taskId, setTaskId] = useState('');

  async function loadDeps() {
    const r = await api.get('/teams/manage/departments');
    setDeps(r.data.data || []);
  }
  async function loadSubs(dep) {
    const params = {};
    if (dep) params.department_id = dep;
    const r = await api.get('/teams/manage/subdepartments', { params });
    setSubs(r.data.data || []);
  }
  async function loadUsers(params = {}) {
    const r = await api.get('/teams/manage/users', { params });
    setUsers(r.data.data || []);
  }
  async function applyFilters(e) {
    e?.preventDefault?.();
    const params = {};
    if (depId) params.department_id = depId;
    if (subId) params.subdepartment_id = subId;
    if (q.trim()) params.q = q.trim();
    await loadUsers(params);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadDeps();
        await loadSubs('');
        await loadUsers({});
      } catch {
        toast.error('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onChangeDep(e) {
    const v = e.target.value;
    setDepId(v);
    setSubId('');
    loadSubs(v);
  }

  async function submitAssign(e) {
    e.preventDefault();
    try {
      if (!assigneeId) return toast.error('Sélectionne un destinataire');
      if (!title.trim()) return toast.error('Titre requis');
      const r = await api.post('/admin/quick-tasks/create-assign', {
        title: title.trim(),
        description: desc || null,
        assignee_user_id: Number(assigneeId),
        due_date: date
      });
      toast.success('Tâche créée & assignée');
      setTitle(''); setDesc('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur création');
    }
  }

  async function submitBacklog(e) {
    e.preventDefault();
    try {
      if (!title.trim()) return toast.error('Titre requis');
      await api.post('/admin/quick-tasks/create-backlog', {
        title: title.trim(),
        description: desc || null
      });
      toast.success('Tâche ajoutée au backlog');
      setTitle(''); setDesc('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur backlog');
    }
  }

  async function submitSchedule(e) {
    e.preventDefault();
    try {
      if (!assigneeId) return toast.error('Sélectionne un destinataire');
      if (!date) return toast.error('Date requise');
      const body = {
        task_id: taskId ? Number(taskId) : null,
        title: taskId ? null : (title.trim() || 'Tâche'),
        description: taskId ? null : (desc || null),
        assignee_user_id: Number(assigneeId),
        due_date: date,
        repeat_week: !!repeatWeek
      };
      await api.post('/admin/quick-tasks/schedule', body);
      toast.success(repeatWeek ? 'Tâches programmées sur la semaine' : 'Tâche programmée');
      setTitle(''); setDesc(''); setTaskId('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur planification');
    }
  }

  const userLabel = (u) => `${u.last_name} ${u.first_name} — ${u.email} ${u.department_name ? `(${u.department_name}/${u.subdepartment_name || '—'})`:''}`;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Tâches rapides (Admin)</h2>

      {/* Filtres utilisateurs */}
      <form className="row g-2 mb-3" onSubmit={applyFilters}>
        <div className="col-md-3">
          <label className="form-label">Département</label>
          <select className="form-select" value={depId} onChange={onChangeDep}>
            <option value="">— Tous —</option>
            {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Sous-département</label>
          <select className="form-select" value={subId} onChange={e=>setSubId(e.target.value)}>
            <option value="">— Tous —</option>
            {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Recherche</label>
          <input className="form-control" placeholder="Nom / email…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-outline-primary w-100" type="submit">Filtrer</button>
        </div>
      </form>

      {/* Sélection destinataire */}
      <div className="mb-3">
        <label className="form-label">Destinataire</label>
        <select className="form-select" value={assigneeId} onChange={e=>setAssigneeId(e.target.value)}>
          <option value="">— Choisir un utilisateur —</option>
          {users.map(u => <option key={u.id} value={u.id}>{userLabel(u)}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab==='assign'?'active':''}`} onClick={()=>setTab('assign')}>Créer & assigner (jour)</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab==='schedule'?'active':''}`} onClick={()=>setTab('schedule')}>Programmer (existant / semaine)</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab==='backlog'?'active':''}`} onClick={()=>setTab('backlog')}>Créer (backlog)</button>
        </li>
      </ul>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : (
            <>
              {tab === 'assign' && (
                <form className="row g-3" onSubmit={submitAssign}>
                  <div className="col-md-8">
                    <label className="form-label">Titre</label>
                    <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Pour le</label>
                    <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" value={desc} onChange={e=>setDesc(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary">Créer & assigner</button>
                  </div>
                </form>
              )}

              {tab === 'schedule' && (
                <form className="row g-3" onSubmit={submitSchedule}>
                  <div className="col-md-6">
                    <label className="form-label">Task ID (optionnel si tu crées)</label>
                    <input className="form-control" value={taskId} onChange={e=>setTaskId(e.target.value)} placeholder="ID d’une tâche existante" />
                    <div className="form-text">Laisse vide pour créer une nouvelle tâche.</div>
                  </div>
                  {!taskId && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Titre (si création)</label>
                        <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description (si création)</label>
                        <textarea className="form-control" rows="3" value={desc} onChange={e=>setDesc(e.target.value)} />
                      </div>
                    </>
                  )}
                  <div className="col-md-6">
                    <label className="form-label">Date de base</label>
                    <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="form-check">
                      <input id="repeat" className="form-check-input" type="checkbox" checked={repeatWeek} onChange={e=>setRepeatWeek(e.target.checked)} />
                      <label htmlFor="repeat" className="form-check-label">Répéter Lun→Ven (semaine de la date)</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary">Programmer</button>
                  </div>
                </form>
              )}

              {tab === 'backlog' && (
                <form className="row g-3" onSubmit={submitBacklog}>
                  <div className="col-md-6">
                    <label className="form-label">Titre</label>
                    <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" value={desc} onChange={e=>setDesc(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-outline-primary">Ajouter au backlog</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
