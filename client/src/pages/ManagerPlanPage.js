import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function ManagerPlanPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [drafts, setDrafts] = useState([]);

  // Form brouillon
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDesc, setDraftDesc] = useState('');

  // Form jour
  const [useDraftDay, setUseDraftDay] = useState('');
  const [titleDay, setTitleDay] = useState('');
  const [descDay, setDescDay] = useState('');
  const [dateDay, setDateDay] = useState('');
  const [assigneesDay, setAssigneesDay] = useState({}); // id -> bool

  // Form semaine
  const [useDraftWeek, setUseDraftWeek] = useState('');
  const [titleWeek, setTitleWeek] = useState('');
  const [descWeek, setDescWeek] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [days, setDays] = useState({ MON:false, TUE:false, WED:false, THU:false, FRI:false, SAT:false, SUN:false });
  const [assigneesWeek, setAssigneesWeek] = useState({}); // id -> bool

  async function load() {
    const [m, d] = await Promise.all([
      api.get('/manager/my-team/members'),
      api.get('/tasks/schedule/drafts')
    ]);
    setMembers(m.data.data || []);
    setDrafts(d.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try { await load(); } catch (e) { toast.error('Erreur de chargement'); } finally { setLoading(false); }
    })();
  }, []);

  function selectedAssignees(stateObj) {
    return Object.entries(stateObj)
      .filter(([_, v]) => !!v)
      .map(([k]) => Number(k));
  }

  async function createDraft(e) {
    e.preventDefault();
    try {
      if (!draftTitle.trim()) return toast.error('Titre requis');
      await api.post('/tasks/schedule/drafts', { title: draftTitle.trim(), description: draftDesc || null });
      setDraftTitle(''); setDraftDesc('');
      await load();
      toast.success('Brouillon créé');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur création brouillon');
    }
  }

  async function planDay(e) {
    e.preventDefault();
    try {
      if (!dateDay) return toast.error('Choisis une date');
      const assignees = selectedAssignees(assigneesDay);
      if (!assignees.length) return toast.error('Sélectionne au moins un membre');

      const body = {
        from_task_id: useDraftDay ? Number(useDraftDay) : null,
        title: useDraftDay ? null : (titleDay || '').trim(),
        description: useDraftDay ? null : (descDay || null),
        due_date: dateDay,
        assignees
      };
      await api.post('/tasks/schedule/day', body);
      // reset léger
      setUseDraftDay('');
      setTitleDay(''); setDescDay('');
      setDateDay('');
      setAssigneesDay({});
      toast.success('Tâche programmée pour le jour choisi');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur programmation jour');
    }
  }

  async function planWeek(e) {
    e.preventDefault();
    try {
      if (!weekStart) return toast.error('Choisis le début de semaine');
      const daysArr = Object.entries(days).filter(([_,v]) => !!v).map(([k]) => k);
      if (!daysArr.length) return toast.error('Sélectionne au moins un jour');
      const assignees = selectedAssignees(assigneesWeek);
      if (!assignees.length) return toast.error('Sélectionne au moins un membre');

      const body = {
        from_task_id: useDraftWeek ? Number(useDraftWeek) : null,
        title: useDraftWeek ? null : (titleWeek || '').trim(),
        description: useDraftWeek ? null : (descWeek || null),
        week_start: weekStart,
        days: daysArr,
        assignees
      };
      await api.post('/tasks/schedule/week', body);
      // reset
      setUseDraftWeek('');
      setTitleWeek(''); setDescWeek('');
      setWeekStart('');
      setDays({ MON:false, TUE:false, WED:false, THU:false, FRI:false, SAT:false, SUN:false });
      setAssigneesWeek({});
      toast.success('Tâches programmées sur la semaine');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur programmation semaine');
    }
  }

  const MemberChecks = ({ state, setState, name }) => (
    <div className="border rounded p-2 bg-light">
      <div className="fw-semibold mb-2">{name}</div>
      <div className="row g-2">
        {members.map(m => (
          <div key={m.id} className="col-6 col-md-4">
            <div className="form-check">
              <input className="form-check-input" type="checkbox"
                id={`${name}_${m.id}`}
                checked={!!state[m.id]}
                onChange={e => setState(prev => ({ ...prev, [m.id]: e.target.checked }))} />
              <label className="form-check-label" htmlFor={`${name}_${m.id}`}>
                {m.last_name} {m.first_name} <span className="text-muted small">({m.team_name})</span>
              </label>
            </div>
          </div>
        ))}
        {!members.length && <div className="text-muted ps-2">Aucun membre dans vos équipes.</div>}
      </div>
    </div>
  );

  const DraftSelect = ({ value, onChange, id }) => (
    <select id={id} className="form-select" value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">— Utiliser un brouillon (facultatif) —</option>
      {drafts.map(d => (
        <option key={d.id} value={d.id}>
          #{d.id} — {d.title} {d.team_name ? `(${d.dep}/${d.subdep}/${d.team_name})` : ''}
        </option>
      ))}
    </select>
  );

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Programmation des tâches</h2>

      {loading ? (
        <div className="text-center py-5">Chargement…</div>
      ) : (
        <>
          {/* Brouillons */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Créer un brouillon (sans assignation)</h5>
              <form className="row g-2" onSubmit={createDraft}>
                <div className="col-md-4">
                  <label className="form-label">Titre</label>
                  <input className="form-control" value={draftTitle} onChange={e=>setDraftTitle(e.target.value)} placeholder="Ex: Rapport hebdo" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={draftDesc} onChange={e=>setDraftDesc(e.target.value)} placeholder="Détails (optionnel)" />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-secondary w-100" type="submit">Créer brouillon</button>
                </div>
              </form>

              <div className="mt-3">
                <div className="text-muted small">Brouillons existants : {drafts.length}</div>
              </div>
            </div>
          </div>

          {/* Programmation Jour */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Programmer pour un jour</h5>
              <form className="row g-3" onSubmit={planDay}>
                <div className="col-md-6">
                  <label className="form-label">Brouillon (optionnel)</label>
                  <DraftSelect id="useDraftDay" value={useDraftDay} onChange={setUseDraftDay} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={dateDay} onChange={e=>setDateDay(e.target.value)} />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button className="btn btn-primary w-100" type="submit">Programmer (Jour)</button>
                </div>

                {!useDraftDay && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Titre</label>
                      <input className="form-control" value={titleDay} onChange={e=>setTitleDay(e.target.value)} placeholder="Titre de la tâche" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input className="form-control" value={descDay} onChange={e=>setDescDay(e.target.value)} placeholder="Description (optionnel)" />
                    </div>
                  </>
                )}

                <div className="col-12">
                  <MemberChecks state={assigneesDay} setState={setAssigneesDay} name="day" />
                </div>
              </form>
            </div>
          </div>

          {/* Programmation Semaine */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Programmer sur une semaine</h5>
              <form className="row g-3" onSubmit={planWeek}>
                <div className="col-md-4">
                  <label className="form-label">Brouillon (optionnel)</label>
                  <DraftSelect id="useDraftWeek" value={useDraftWeek} onChange={setUseDraftWeek} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Début de semaine</label>
                  <input type="date" className="form-control" value={weekStart} onChange={e=>setWeekStart(e.target.value)} />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Jours</label>
                  <div className="d-flex flex-wrap gap-2">
                    {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
                      <div key={d} className="form-check me-3">
                        <input className="form-check-input" type="checkbox" id={`d_${d}`}
                          checked={!!days[d]} onChange={e=>setDays(prev=>({...prev,[d]:e.target.checked}))} />
                        <label className="form-check-label" htmlFor={`d_${d}`}>{d}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {!useDraftWeek && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Titre</label>
                      <input className="form-control" value={titleWeek} onChange={e=>setTitleWeek(e.target.value)} placeholder="Titre de la tâche" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input className="form-control" value={descWeek} onChange={e=>setDescWeek(e.target.value)} placeholder="Description (optionnel)" />
                    </div>
                  </>
                )}

                <div className="col-12">
                  <MemberChecks state={assigneesWeek} setState={setAssigneesWeek} name="week" />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Programmer (Semaine)</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
