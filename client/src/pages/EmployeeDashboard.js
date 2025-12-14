import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';

function Badge({ status }) {
  const map = { TODO: 'secondary', IN_PROGRESS: 'warning', DONE: 'success' };
  return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
}
function fmtMins(m) {
  const n = Math.max(0, Number(m || 0));
  const h = Math.floor(n / 60);
  const mm = n % 60;
  if (h <= 0) return `${mm} min`;
  return `${h} h ${mm} min`;
}
function todayYMD() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function EmployeeDashboard() {
  // Sessions
  const [openSession, setOpenSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sumMinutes, setSumMinutes] = useState(0);

  // States
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  // Disponibilité du jour (inclut already_closed + new_after_close)
  const [availability, setAvailability] = useState({
    total_today: 0,
    remaining_today: 0,
    has_tasks: false,
    has_remaining: false,
    already_closed: false,
    new_after_close: false
  });

  // Tâches du jour (affichées UNIQUEMENT si une session est ouverte)
  const [tasksToday, setTasksToday] = useState([]);

  // Clôture
  const today = useMemo(() => todayYMD(), []);
  const [preview, setPreview] = useState(null);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [valStatus, setValStatus] = useState(null); // {close, validation, files}

  // ------------ Loaders ------------
  async function loadOpen() {
    const r = await api.get('/sessions/my/open');
    setOpenSession(r.data.data);
  }
  async function loadSessions() {
    const r = await api.get('/sessions/my', { params: { date: today } });
    const list = r.data.data || [];
    setSessions(list);
    const tot = list.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0);
    setSumMinutes(tot);
  }
  async function loadAvailability() {
    const r = await api.get('/tasks/my-today/availability');
    setAvailability(r.data.data || {});
  }
  async function loadTasksTodayWithTime() {
    const r = await api.get('/tasks/my-today/with-time');
    setTasksToday(r.data.data || []);
  }
  async function loadPreview() {
    const r = await api.get('/day-close/preview', { params: { date: today } });
    setPreview(r.data.data);
  }
  async function loadTodayStatus() {
    const r = await api.get('/validations/today/status');
    setValStatus(r.data.data);
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          loadOpen(),
          loadSessions(),
          loadAvailability(),
          loadPreview(),
          loadTodayStatus()
        ]);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharger tâches du jour uniquement quand une session est ouverte
  useEffect(() => {
    (async () => {
      try {
        if (openSession) await loadTasksTodayWithTime();
        else setTasksToday([]);
      } catch {
        toast.error('Erreur chargement tâches du jour');
      }
    })();
  }, [openSession]);

  // ------------ Actions ------------
  async function startSession(e) {
    e.preventDefault();
    setWorking(true);
    try {
      await api.post('/sessions/start', {});
      await Promise.all([
        loadOpen(),
        loadSessions(),
        loadAvailability(),
        loadPreview(),
        loadTasksTodayWithTime(),
        loadTodayStatus()
      ]);
      toast.success('Session démarrée');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setWorking(false);
    }
  }

  async function stopSession() {
    setWorking(true);
    try {
      await api.post('/sessions/stop', {});
      await Promise.all([loadOpen(), loadSessions(), loadAvailability(), loadPreview(), loadTodayStatus()]);
      toast.success('Session arrêtée');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setWorking(false);
    }
  }

  async function closeDay() {
    setWorking(true);
    try {
      // 1) Clôture (création ou re-clôture ; renvoie l’ID)
      const r1 = await api.post('/day-close', { date: today, comment: comment || null });
      const closeId = r1?.data?.data?.id || null;

      // 2) Upload PDF si fourni
      if (file && closeId) {
        const form = new FormData();
        form.append('file', file);
        await api.post(`/day-close/${closeId}/files`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3) Soumettre (ou re-soumettre) à validation
      await api.post('/validations/submit', { date: today });

      setComment('');
      setFile(null);
      await Promise.all([loadAvailability(), loadPreview(), loadTodayStatus()]);
      toast.success('Journée clôturée et envoyée en validation');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la clôture');
    } finally {
      setWorking(false);
    }
  }

  async function move(id, nextStatus) {
    setWorking(true);
    try {
      await api.patch(`/tasks/${id}/status`, { status: nextStatus });
      await Promise.all([loadTasksTodayWithTime(), loadAvailability(), loadPreview()]);
      toast.success('Statut mis à jour');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setWorking(false);
    }
  }

  // ------------ Render helpers ------------
  const renderValidationStatus = () => {
    if (!valStatus) return null;
    const s = valStatus.validation?.status || 'PENDING';
    const c = valStatus.validation?.comment || null;
    const map = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
    return (
      <div className="mt-3">
        <div className="text-muted small">Validation</div>
        <span className={`badge bg-${map[s]}`}>{s}</span>
        {c && <div className="text-muted small mt-1">Commentaire: {c}</div>}
      </div>
    );
  };

  // ------------ UI ------------
  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Mon espace</h2>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          {/* --- Bloc Session --- */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Mes sessions — aujourd’hui</h5>
                <div className="text-muted small">{today}</div>
              </div>

              {/* Start / Stop */}
              {openSession ? (
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-3">
  <span className="badge bg-success">En cours</span>
  <span className="text-muted">
    démarrée à <strong>{new Date(openSession.start_time.replace(' ', 'T')).toLocaleTimeString()}</strong>
  </span>
  <button
    className="btn btn-danger btn-sm w-100 w-sm-auto ms-sm-auto"
    disabled={working}
    onClick={stopSession}
  >
    {working ? 'Arrêt…' : 'Arrêter la session'}
  </button>
</div>
              ) : (
                <form className="row g-2 align-items-end mb-3" onSubmit={startSession}>
                  <div className="col-md-9">
                    {availability.has_tasks ? (
                      <div className="text-muted small">
                        Tâches du jour : <strong>{availability.remaining_today}</strong> à réaliser sur {availability.total_today}.
                        {availability.remaining_today === 0 && ' (toutes terminées)'}
                      </div>
                    ) : (
                      <div className="text-danger small">Aucune tâche disponible pour aujourd’hui</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-primary w-100"
                      type="submit"
                      disabled={
                        working ||
                        !availability.has_remaining ||
                        (availability.already_closed && !availability.new_after_close)
                      }
                      title={
                        availability.already_closed && !availability.new_after_close
                          ? 'Journée déjà clôturée (aucune nouvelle tâche)'
                          : (!availability.has_remaining ? 'Aucune tâche à faire aujourd’hui' : '')
                      }
                    >
                      {working ? 'Démarrage…' : 'Démarrer une session'}
                    </button>
                    {availability.already_closed && !availability.new_after_close && (
                      <div className="form-text text-danger">
                        Journée déjà clôturée. Un démarrage sera possible si de nouvelles tâches sont ajoutées aujourd’hui.
                      </div>
                    )}
                    {availability.already_closed && availability.new_after_close && (
                      <div className="form-text text-success">
                        Nouvelles tâches détectées depuis la clôture — démarrage autorisé.
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* Liste des sessions du jour */}
              <div className="ft-table-desktop table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Début</th><th>Fin</th><th>Durée</th><th>Tâche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id}>
                        <td>{new Date(s.start_time.replace(' ', 'T')).toLocaleTimeString()}</td>
                        <td>{s.end_time ? new Date(s.end_time.replace(' ', 'T')).toLocaleTimeString() : <span className="text.warning">en cours</span>}</td>
                        <td>{s.duration_minutes != null ? fmtMins(s.duration_minutes) : '—'}</td>
                        <td>{s.task_id || <span className="text-muted">—</span>}</td>
                      </tr>
                    ))}
                    {!sessions.length && <tr><td colSpan="4"><EmptyState title="Aucune session aujourd’hui" /></td></tr>}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="2" className="text-end">Total :</th>
                      <th>{fmtMins(sumMinutes)}</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="ft-cards-mobile">
  {!sessions.length ? (
    <div className="state-box"><EmptyState title="Aucune session aujourd’hui" /></div>
  ) : (
    <>
      {sessions.map(s => (
        <div key={s.id} className="ft-card-item mb-2">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div className="fw-semibold">
              {new Date(s.start_time.replace(' ', 'T')).toLocaleTimeString()}
              {' '}→{' '}
              {s.end_time ? new Date(s.end_time.replace(' ', 'T')).toLocaleTimeString() : 'en cours'}
            </div>
            <span className="badge bg-light text-dark">{s.duration_minutes != null ? fmtMins(s.duration_minutes) : '—'}</span>
          </div>

          <div className="ft-kv"><span className="k">Tâche</span><span className="v">{s.task_id || '—'}</span></div>
        </div>
      ))}

      <div className="ft-card-item">
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">Total</span>
          <span className="fw-semibold">{fmtMins(sumMinutes)}</span>
        </div>
      </div>
    </>
  )}
</div>

            </div>
          </div>

          {/* --- Mes tâches du jour (visible UNIQUEMENT si une session est ouverte) --- */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Mes tâches du jour</h5>

              {!openSession ? (
                <div className="text-muted">Démarre une session pour afficher tes tâches du jour.</div>
              ) : (
               <div className="ft-table-desktop table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Titre</th><th>Équipe</th><th>Échéance</th><th>Statut</th><th>Temps aujourd’hui</th><th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasksToday.map(t => (
                        <tr key={t.id}>
                          <td>
                            <div className="fw-semibold">{t.title}</div>
                            <div className="text-muted small">{t.description || '—'}</div>
                          </td>
                          <td>{t.department_name} / {t.subdep_name} / {t.team_name || '—'}</td>
                          <td>{t.due_date || '—'}</td>
                          <td><Badge status={t.status} /></td>
                          <td>{fmtMins(t.minutes_spent_today)}</td>
                          <td className="text-end">
                            <div className="btn-group">
                              <button className="btn btn-light btn-sm" disabled={working} onClick={()=>move(t.id,'TODO')}>TODO</button>
                              <button className="btn btn-light btn-sm" disabled={working} onClick={()=>move(t.id,'IN_PROGRESS')}>IN PROGRESS</button>
                              <button className="btn btn-light btn-sm" disabled={working} onClick={()=>move(t.id,'DONE')}>DONE</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!tasksToday.length && (
                        <tr><td colSpan="6"><EmptyState title="Aucune tâche du jour" /></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="ft-cards-mobile">
  {!tasksToday.length ? (
    <div className="state-box"><EmptyState title="Aucune tâche du jour" /></div>
  ) : tasksToday.map(t => (
    <div key={t.id} className="ft-card-item mb-2">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="fw-semibold">{t.title}</div>
        <Badge status={t.status} />
      </div>

      <div className="text-muted small mt-1">{t.description || '—'}</div>

      <div className="ft-kv">
        <span className="k">Équipe</span>
        <span className="v">{t.department_name} / {t.subdep_name} / {t.team_name || '—'}</span>
      </div>
      <div className="ft-kv"><span className="k">Échéance</span><span className="v">{t.due_date || '—'}</span></div>
      <div className="ft-kv"><span className="k">Temps aujourd’hui</span><span className="v">{fmtMins(t.minutes_spent_today)}</span></div>

      <div className="dropdown mt-2">
        <button
          className="btn btn-outline-secondary btn-sm w-100 dropdown-toggle"
          data-bs-toggle="dropdown"
          disabled={working}
        >
          Changer statut
        </button>
        <ul className="dropdown-menu w-100">
          <li><button className="dropdown-item" disabled={working} onClick={()=>move(t.id,'TODO')}>TODO</button></li>
          <li><button className="dropdown-item" disabled={working} onClick={()=>move(t.id,'IN_PROGRESS')}>IN PROGRESS</button></li>
          <li><button className="dropdown-item" disabled={working} onClick={()=>move(t.id,'DONE')}>DONE</button></li>
        </ul>
      </div>
    </div>
  ))}
</div>

          </div>

          {/* --- Clôture de journée --- */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Clôture de journée</h5>

              {preview && (
                <>
                  <div className="row g-3">
                    <div className="col-6 col-md-3">

                      <div className="p-3 border rounded bg-light">
                        <div className="text-muted small">Date</div>
                        <div className="fw-semibold">{preview.date}</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">

                      <div className="p-3 border rounded bg-light">
                        <div className="text-muted small">Temps total</div>
                        <div className="fw-semibold">{fmtMins(preview.total_minutes)}</div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">

                      <div className="p-3 border rounded bg-light">
                        <div className="text-muted small">Tâches terminées</div>
                        <div className="fw-semibold">{preview.tasks_done}</div>
                      </div>
                    </div>
                   <div className="col-6 col-md-3">

                      <div className="p-3 border rounded bg-light">
                        <div className="text-muted small">Statut</div>
                        <div className="fw-semibold">
                          {preview.already_closed ? 'Déjà clôturée' : (preview.open_session ? 'Session ouverte' : 'Prête')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mt-3 align-items-end">
                    <div className="col-md-6">
                      <label className="form-label">Commentaire (optionnel)</label>
                      <input
                        className="form-control"
                        value={comment}
                        onChange={e=>setComment(e.target.value)}
                        maxLength={255}
                        placeholder="Notes sur la journée…"
                      />
                    </div>
                    <div className="col-6 col-md-3">

                      <label className="form-label">Justificatif (PDF)</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="application/pdf"
                        onChange={e=>setFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="col-6 col-md-3">

                      <button
                        className="btn btn-success w-100"
                        onClick={closeDay}
                        disabled={
                          preview.open_session ||
                          (preview.already_closed && !availability.new_after_close) ||
                          working
                        }
                      >
                        {working ? 'Clôture…' : 'Clôturer & Envoyer'}
                      </button>
                      {preview.open_session && <div className="form-text text-danger">Arrête d’abord ta session.</div>}
                      {preview.already_closed && !availability.new_after_close && (
                        <div className="form-text text-muted">Journée déjà clôturée (aucune nouvelle activité).</div>
                      )}
                      {preview.already_closed && availability.new_after_close && (
                        <div className="form-text text-success">Nouvelles activités détectées — re-clôture possible.</div>
                      )}
                    </div>
                  </div>

                  {/* Statut/Commentaire de validation */}
                  {renderValidationStatus()}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
