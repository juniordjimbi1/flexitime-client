// client/src/pages/manager/BacklogPlanner.js
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { bulkPlan } from '../../api/planner';
import TasksFilters from '../../components/tasks/TasksFilters';

const DOW = [
  { v:1, label:'Lun' }, { v:2, label:'Mar' }, { v:3, label:'Mer' },
  { v:4, label:'Jeu' }, { v:5, label:'Ven' }, { v:6, label:'Sam' }, { v:7, label:'Dim' },
];

export default function BacklogPlanner() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState({});
  const [filters, setFilters] = useState({ statuses:['TODO'] }); // défaut: backlog TODO
  const [mode, setMode] = useState('WEEKDAYS');
  const [days, setDays] = useState([1,2,3,4,5]);
  const [start, setStart] = useState(() => new Date().toISOString().slice(0,10));
  const [end, setEnd] = useState(() => { const d=new Date(); d.setDate(d.getDate()+21); return d.toISOString().slice(0,10); });
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.statuses?.length) params.status = filters.statuses.join(',');
      if (filters.due_from) params.due_from = filters.due_from;
      if (filters.due_to)   params.due_to = filters.due_to;
      if (filters.assignees) params.assignees = filters.assignees;
      if (filters.labels)    params.labels = filters.labels;
      const { data } = await api.get('/tasks', { params });
      setTasks(data?.data || []);
    } catch {
      setTasks([]);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []); // mount
  useEffect(()=>{ // filtre projet global
    const onChange = async () => { await load(); };
    window.addEventListener('ft_project_filter_changed', onChange);
    return () => window.removeEventListener('ft_project_filter_changed', onChange);
  }, []); // eslint-disable-line

  const allChecked = useMemo(() => tasks.length > 0 && tasks.every(t => sel[t.id]), [tasks, sel]);
  const toggleAll = (e) => { const checked = e.target.checked; const next={}; if (checked) tasks.forEach(t=>next[t.id]=true); setSel(next); };
  const toggleOne = (id) => setSel(prev => ({ ...prev, [id]: !prev[id] }));

  const changeDay = (v) => setDays(prev => prev.includes(v) ? prev.filter(x => x!==v) : [...prev, v].sort((a,b)=>a-b));

  const run = async (e) => {
    e.preventDefault();
    const task_ids = Object.keys(sel).filter(k => sel[k]).map(Number);
    if (!task_ids.length) return alert('Sélectionne au moins une tâche.');
    if (!start || !end)   return alert('Renseigne une période.');
    const payload = { task_ids, mode, start_date: start, end_date: end };
    if (mode === 'DAYS') payload.days = days;

    setMsg('Programmation en cours…');
    try {
      const { data } = await bulkPlan(payload);
      setMsg(`OK: ${data?.data?.inserted || 0} insertions (doublons: ${data?.data?.duplicates || 0}) sur ${data?.data?.dates?.length || 0} dates.`);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || 'Erreur de planification');
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Programmation de masse — Backlog</h4>
      </div>

      {/* Filtres */}
      <div className="card mb-3">
        <div className="card-body">
          <TasksFilters value={filters} onChange={(f)=>{ setFilters(f); load(); }} />
        </div>
      </div>

      {/* Formulaire de planification */}
      <div className="card mb-3">
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={run}>
            <div className="col-sm-3">
              <label className="form-label">Période — début</label>
              <input type="date" className="form-control" value={start} onChange={e=>setStart(e.target.value)} />
            </div>
            <div className="col-sm-3">
              <label className="form-label">Période — fin</label>
              <input type="date" className="form-control" value={end} onChange={e=>setEnd(e.target.value)} />
            </div>
            <div className="col-sm-6">
              <label className="form-label">Mode</label>
              <div className="d-flex flex-wrap gap-2">
                {[
                  {id:'m1',v:'WEEKDAYS',label:'Lun→Ven'},
                  {id:'m2',v:'DAYS',label:'Jours choisis'},
                  {id:'m3',v:'ODD_WEEKS',label:'Semaines impaires (L→V)'},
                  {id:'m4',v:'EVEN_WEEKS',label:'Semaines paires (L→V)'}
                ].map(m=>(
                  <div className="form-check" key={m.id}>
                    <input className="form-check-input" type="radio" name="mode" id={m.id} checked={mode===m.v} onChange={()=>setMode(m.v)} />
                    <label className="form-check-label" htmlFor={m.id}>{m.label}</label>
                  </div>
                ))}
              </div>

              {mode==='DAYS' && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {DOW.map(d => (
                    <div className="form-check form-check-inline" key={d.v}>
                      <input className="form-check-input" type="checkbox" id={`d${d.v}`} checked={days.includes(d.v)} onChange={()=>changeDay(d.v)} />
                      <label className="form-check-label" htmlFor={`d${d.v}`}>{d.label}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-12">
              <button className="btn btn-primary">Programmer</button>
              {msg && <span className="ms-3 text-muted">{msg}</span>}
            </div>
          </form>
        </div>
      </div>

      {/* Liste */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div>Backlog {loading ? '…' : `— ${tasks.length} tâches`}</div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="chkAll" checked={allChecked} onChange={toggleAll} />
            <label className="form-check-label" htmlFor="chkAll">Tout sélectionner</label>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{width:40}}></th>
                <th>Titre</th>
                <th>Equipe</th>
                <th>Projet</th>
                <th>Échéance</th>
                <th>Priorité</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-muted">Chargement…</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan="6" className="text-muted">Aucune tâche.</td></tr>
              ) : tasks.map(t => (
                <tr key={t.id}>
                  <td><input className="form-check-input" type="checkbox" checked={!!sel[t.id]} onChange={()=>toggleOne(t.id)} /></td>
                  <td>{t.title}</td>
                  <td>{t.team_name || '—'}</td>
                  <td>{t.project_id || '—'}</td>
                  <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge text-bg-${t.priority==='HIGH'?'danger':t.priority==='MEDIUM'?'warning':'secondary'}`}>{t.priority || '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
