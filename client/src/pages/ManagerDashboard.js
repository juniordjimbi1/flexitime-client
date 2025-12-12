import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Badge({ status }) {
  const map = { TODO: 'secondary', IN_PROGRESS: 'warning', DONE: 'success' };
  return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  // form create
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [due, setDue] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [msg, setMsg] = useState(null);

  // charger équipes (si ADMIN → toutes, si MANAGER → seulement les siennes)
  async function loadTeams() {
    const r = await api.get('/org/teams');
    const all = r.data.data;
    const filtered = user.role.code === 'MANAGER'
      ? all.filter(t => t.manager_user_id === user.id)
      : all;
    setTeams(filtered);
    if (!filtered.length) return;
    setTeamId(String(filtered[0].id));
  }

  async function loadTasks() {
    if (!teamId) return;
    const r = await api.get('/tasks', { params: { team_id: teamId } });
    setTasks(r.data.data);
  }

  async function loadMembers() {
    if (!teamId) { setMembers([]); return; }
    const r = await api.get('/org/team-members', { params: { team_id: teamId } });
    setMembers(r.data.data);
  }

  useEffect(() => { loadTeams().catch(console.error); }, []);
  useEffect(() => { loadTasks().catch(console.error); loadMembers().catch(console.error); }, [teamId]);

  async function createTask(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const payload = { title, description: desc, priority, team_id: Number(teamId), due_date: due || null };
      const res = await api.post('/tasks', payload);
      const task = res.data.data;

      // assignations si choisi
      if (assignees.length) {
        await api.post(`/tasks/${task.id}/assign`, { user_ids: assignees.map(Number) });
      }
      setTitle(''); setDesc(''); setPriority('MEDIUM'); setDue(''); setAssignees([]);
      setMsg('Tâche créée ✔');
      await loadTasks();
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Erreur');
    }
  }

  async function updateStatus(id, status) {
    await api.patch(`/tasks/${id}/status`, { status });
    await loadTasks();
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Tâches de mon équipe</h2>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Équipe</label>
          <select className="form-select" value={teamId} onChange={e=>setTeamId(e.target.value)}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.department_name} / {t.subdep_name} / {t.name}</option>)}
            {!teams.length && <option value="">(Aucune équipe)</option>}
          </select>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Créer une tâche</h5>
          {msg && <div className={`alert ${msg.includes('✔') ? 'alert-success':'alert-danger'} py-2`}>{msg}</div>}
          <form className="row g-3" onSubmit={createTask}>
            <div className="col-md-4">
              <label className="form-label">Titre</label>
              <input className="form-control" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Priorité</label>
              <select className="form-select" value={priority} onChange={e=>setPriority(e.target.value)}>
                <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Échéance</label>
              <input type="date" className="form-control" value={due} onChange={e=>setDue(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="2" value={desc} onChange={e=>setDesc(e.target.value)}></textarea>
            </div>
            <div className="col-12">
              <label className="form-label">Assigner à (employés de l’équipe)</label>
              <select multiple className="form-select" value={assignees} onChange={e=>{
                const opts=[...e.target.selectedOptions].map(o=>o.value);
                setAssignees(opts);
              }}>
                {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} — {m.email}</option>)}
              </select>
              <div className="form-text">Maintenir Ctrl (ou Cmd) pour sélectionner plusieurs.</div>
            </div>
            <div className="col-12">
              <button className="btn btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Tâches</h5>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Titre</th><th>Priorité</th><th>Échéance</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="fw-semibold">{t.title}</div>
                      <div className="text-muted small">{t.description || '—'}</div>
                    </td>
                    <td>{t.priority}</td>
                    <td>{t.due_date || '—'}</td>
                    <td><Badge status={t.status} /></td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="btn btn-light btn-sm" onClick={()=>updateStatus(t.id,'TODO')}>TODO</button>
                        <button className="btn btn-light btn-sm" onClick={()=>updateStatus(t.id,'IN_PROGRESS')}>IN PROGRESS</button>
                        <button className="btn btn-light btn-sm" onClick={()=>updateStatus(t.id,'DONE')}>DONE</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!tasks.length && <tr><td colSpan="5" className="text-muted">Aucune tâche</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
