import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';

export default function ManagerQuickTasksPage() {
  const [loading, setLoading] = useState(true);

  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [members, setMembers] = useState([]);

  // tabs
  const [tab, setTab] = useState('assign'); // assign | schedule | backlog

  // forms
  const [assigneeId, setAssigneeId] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [repeatWeek, setRepeatWeek] = useState(false);
  const [taskId, setTaskId] = useState('');

  const [backlog, setBacklog] = useState([]);

  async function loadTeams() {
    const r = await api.get('/manager/teams');
    const items = r.data.data || [];
    setTeams(items);
    if (items.length && !teamId) setTeamId(String(items[0].id));
  }
  async function loadMembers(tid) {
    if (!tid) return;
    const r = await api.get(`/manager/teams/${tid}/members`);
    setMembers(r.data.data || []);
  }
  async function loadBacklog() {
    const r = await api.get('/manager/quick-tasks/backlog');
    setBacklog(r.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try { await loadTeams(); await loadBacklog(); } catch { toast.error('Erreur de chargement'); } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (teamId) loadMembers(teamId);
  }, [teamId]);

  const memberLabel = (u) => `${u.last_name} ${u.first_name} — ${u.email}`;

  async function submitAssign(e) {
    e.preventDefault();
    try {
      if (!teamId) return toast.error("Choisis une équipe");
      if (!assigneeId) return toast.error('Choisis un membre');
      if (!title.trim()) return toast.error('Titre requis');
      await api.post('/manager/quick-tasks/create-assign', {
        team_id: Number(teamId),
        assignee_user_id: Number(assigneeId),
        title: title.trim(),
        description: desc || null,
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
      await api.post('/manager/quick-tasks/create-backlog', {
        title: title.trim(),
        description: desc || null
      });
      await loadBacklog();
      setTitle(''); setDesc('');
      toast.success('Tâche ajoutée au backlog');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur backlog');
    }
  }

  async function submitSchedule(e) {
    e.preventDefault();
    try {
      if (!teamId) return toast.error("Choisis une équipe");
      if (!assigneeId) return toast.error('Choisis un membre');
      if (!date) return toast.error('Date requise');

      const body = {
        team_id: Number(teamId),
        assignee_user_id: Number(assigneeId),
        due_date: date,
        repeat_week: !!repeatWeek,
        task_id: taskId ? Number(taskId) : null,
        title: taskId ? null : (title.trim() || 'Tâche'),
        description: taskId ? null : (desc || null),
      };
      await api.post('/manager/quick-tasks/schedule', body);
      await loadBacklog();
      setTitle(''); setDesc(''); setTaskId('');
      toast.success(repeatWeek ? 'Programmation semaine OK' : 'Programmation OK');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur planification');
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Tâches rapides (Manager)</h2>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Équipe</label>
              <select className="form-select" value={teamId} onChange={e=>setTeamId(e.target.value)}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} — {t.department_name} / {t.subdepartment_name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Membre</label>
              <select className="form-select" value={assigneeId} onChange={e=>setAssigneeId(e.target.value)}>
                <option value="">— Choisir —</option>
                {members.map(m => <option key={m.id} value={m.id}>{memberLabel(m)}</option>)}
              </select>
            </div>
          </div>

          <ul className="nav nav-tabs mb-3">
            <li className="nav-item"><button className={`nav-link ${tab==='assign'?'active':''}`} onClick={()=>setTab('assign')}>Créer & assigner (jour)</button></li>
            <li className="nav-item"><button className={`nav-link ${tab==='schedule'?'active':''}`} onClick={()=>setTab('schedule')}>Programmer (existant / semaine)</button></li>
            <li className="nav-item"><button className={`nav-link ${tab==='backlog'?'active':''}`} onClick={()=>setTab('backlog')}>Créer (backlog)</button></li>
          </ul>

          <div className="card shadow-sm">
            <div className="card-body">
              {tab==='assign' && (
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

              {tab==='schedule' && (
                <form className="row g-3" onSubmit={submitSchedule}>
                  <div className="col-md-6">
                    <label className="form-label">Task ID (si tu programmes une tâche existante)</label>
                    <input className="form-control" value={taskId} onChange={e=>setTaskId(e.target.value)} placeholder="ID d’une tâche backlog" />
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
                      <label htmlFor="repeat" className="form-check-label">Répéter Lun→Ven (semaine)</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary">Programmer</button>
                  </div>
                </form>
              )}

              {tab==='backlog' && (
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
            </div>
          </div>

          {/* Backlog visible (aide à récupérer un Task ID) */}
          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h5 className="card-title">Mon backlog (non planifié)</h5>
              {!backlog.length ? (
                <EmptyState title="Aucun élément"></EmptyState>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead><tr><th>ID</th><th>Titre</th><th>Description</th><th>Créée</th><th></th></tr></thead>
                    <tbody>
                      {backlog.map(b => (
                        <tr key={b.id}>
                          <td>{b.id}</td>
                          <td className="fw-semibold">{b.title}</td>
                          <td className="text-muted">{b.description || '—'}</td>
                          <td className="text-muted small">{new Date(b.created_at.replace(' ','T')).toLocaleString()}</td>
                          <td className="text-end">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setTaskId(String(b.id)); setTab('schedule'); }}>
                              Utiliser cet ID
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
}
