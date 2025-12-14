// client/src/components/tasks/TaskDrawer.js
import React, { useEffect, useState, useMemo } from 'react';
import ChecklistTab from './ChecklistTab';
import { useAuth } from '../../context/AuthContext';
import { updateTaskStatus } from '../../services/projectsApi';
import { startSession, stopSession, getActiveSession } from '../../api/sessions';
import { listTaskComments, addTaskComment } from '../../api/taskComments';
import { getTaskTimeTracking } from '../../services/checklistApi';

const STATUS_OPTIONS = [
  { v: 'TODO', label: 'À faire' },
  { v: 'IN_PROGRESS', label: 'En cours' },
  { v: 'BLOCKED', label: 'Bloqué' },
  { v: 'DONE', label: 'Terminé' },
];

function fmtMinutes(m) {
  const n = Number(m || 0);
  if (!n) return '0 min';
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const r = n % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

function TaskDrawer({ task, onClose, onUpdated }) {
  const { user } = useAuth();

  const [local, setLocal] = useState(task || null);
  const [tab, setTab] = useState('details');

  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [newComment, setNewComment] = useState('');

  const [timeData, setTimeData] = useState(null);
  const [timeLoading, setTimeLoading] = useState(false);
  const [timeError, setTimeError] = useState('');

  const canEditTask = useMemo(() => {
    if (!user || !local) return false;
    if (user.role_code === 'ADMIN') return true;
    if (user.role_code === 'MANAGER') {
      return (
        local.team_manager_id === user.id ||
        local.project_manager_id === user.id ||
        local.created_by_user_id === user.id
      );
    }
    return local.assignees?.some((a) => a.user_id === user.id);
  }, [user, local]);

  async function loadTimeForTask(opts = {}) {
    const { silent } = opts;
    if (!local?.id) return;
    if (!silent) setTimeLoading(true);
    setTimeError('');
    try {
      const res = await getTaskTimeTracking(local.id);
      const data = res.data?.data || res.data || res;
      setTimeData(data);
    } catch (e) {
      console.error(e);
      setTimeError(
        e?.response?.data?.message ||
          'Impossible de charger le temps passé sur cette tâche'
      );
    } finally {
      if (!silent) setTimeLoading(false);
    }
  }

  // Re-synchroniser quand on ouvre une autre tâche
  useEffect(() => {
    setLocal(task);
    setTab('details');
    setStatusError('');
    setSessionError('');
    setCommentsError('');
    setTimeError('');
    setTimeData(null);
    if (task?.id) {
      loadTimeForTask({ silent: true });
    }
  }, [task]);

  // Charger la session active pour savoir si le chrono est en cours sur cette tâche
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getActiveSession();
        if (!mounted) return;
        if (data && data.task_id === task.id) {
          setSession(data);
        } else {
          setSession(null);
        }
      } catch (e) {
        if (!mounted) return;
        setSession(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [task]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!local || !canEditTask) return;

    let blockedReason = null;
    if (newStatus === 'BLOCKED') {
      const answer = window.prompt(
        'Expliquez pourquoi cette tâche est bloquée (obligatoire) :'
      );
      if (answer === null || !answer.trim()) {
        setStatusError(
          'Un commentaire est obligatoire pour passer la tâche en "Bloqué".'
        );
        // On remet la valeur du select sur l’ancien statut
        e.target.value = local.status;
        return;
      }
      blockedReason = answer.trim();
    }

    setStatusLoading(true);
    setStatusError('');
    try {
      const res = await updateTaskStatus(local.id, newStatus);
      const updated = res.data?.data || res.data || res;
      const next = { ...local, ...(updated || {}), status: newStatus };
      setLocal(next);
      onUpdated && onUpdated(next);

      if (blockedReason) {
        try {
          await addTaskComment(local.id, `[BLOQUÉ] ${blockedReason}`);
          if (tab === 'comments') {
            await loadComments();
          }
        } catch (e2) {
          console.error(e2);
          // On n’annule pas le changement de statut si le commentaire échoue
        }
      }
    } catch (err) {
      console.error(err);
      setStatusError(
        err?.response?.data?.message || 'Impossible de mettre à jour le statut'
      );
      // rollback de la valeur sélectionnée
      e.target.value = local.status;
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!local || !canEditTask || session) return;
    setSessionLoading(true);
    setSessionError('');
    try {
      const data = await startSession({ task_id: local.id });
      setSession(data);

      if (local.status === 'TODO') {
        // On force local.status en IN_PROGRESS côté UI
        const next = { ...local, status: 'IN_PROGRESS' };
        setLocal(next);
        onUpdated && onUpdated(next);
      }
    } catch (e) {
      console.error(e);
      setSessionError(
        e?.response?.data?.message || 'Impossible de démarrer la session'
      );
    } finally {
      setSessionLoading(false);
    }
  };

  const handleStopSession = async () => {
    if (!session) return;
    setSessionLoading(true);
    setSessionError('');
    try {
      await stopSession({ session_id: session.id });
      setSession(null);
      if (local?.id) {
        await loadTimeForTask({ silent: true });
      }
    } catch (e) {
      console.error(e);
      setSessionError(
        e?.response?.data?.message || 'Impossible d’arrêter la session'
      );
    } finally {
      setSessionLoading(false);
    }
  };

  const loadComments = async () => {
    if (!local) return;
    setCommentsLoading(true);
    setCommentsError('');
    try {
      const res = await listTaskComments(local.id);
      const data = res.data?.data || res.data || [];
      const raw = Array.isArray(data) ? data : data.comments || [];
      const mapped = raw.map((c) => ({
        ...c,
        author_name: c.author_name || c.user_name || 'Utilisateur',
        content: c.content || c.body || '',
      }));
      setComments(mapped);
    } catch (e) {
      console.error(e);
      setCommentsError(
        e?.response?.data?.message || 'Impossible de charger les commentaires'
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'comments') {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, local?.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !local) return;
    setCommentsError('');
    try {
      await addTaskComment(local.id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (e2) {
      console.error(e2);
      setCommentsError(
        e2?.response?.data?.message || 'Impossible d’ajouter le commentaire'
      );
    }
  };

  if (!local) return null;

  const statusSelect = (
    <select
      className="form-select form-select-sm d-inline-block w-auto ms-2"
      value={local.status || 'TODO'}
      onChange={handleStatusChange}
      disabled={!canEditTask || statusLoading}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.v} value={s.v}>
          {s.label}
        </option>
      ))}
    </select>
  );

  const renderDetails = () => (
    <div className="mt-3">
      <div className="mb-2">
        <strong>Projet :</strong>{' '}
        {local.project_name || <span className="text-muted">Aucun</span>}
      </div>
      <div className="mb-2">
        <strong>Assignés :</strong>{' '}
        {local.assignees && local.assignees.length > 0 ? (
          local.assignees.map((a) => a.user_name).join(', ')
        ) : (
          <span className="text-muted">Personne</span>
        )}
      </div>
      <div className="mb-2">
        <strong>Description :</strong>
        <div>{local.description || <span className="text-muted">—</span>}</div>
      </div>

      <div className="mb-3">
        <strong>Session de travail :</strong>
        <div className="mt-1 d-flex align-items-center gap-2">
          {session ? (
            <>
              <span className="badge bg-success">En cours</span>
              <button
                className="btn btn-sm btn-outline-light text-danger border-danger"
                disabled={sessionLoading}
                onClick={handleStopSession}
              >
                {sessionLoading ? 'Arrêt…' : 'Arrêter la session'}
              </button>
            </>
          ) : (
            <>
              <span className="badge bg-secondary">Aucune session</span>
              <button
                className="btn btn-sm btn-outline-light border-secondary"
                disabled={sessionLoading || !canEditTask}
                onClick={handleStartSession}
              >
                {sessionLoading ? 'Démarrage…' : 'Démarrer une session'}
              </button>
            </>
          )}
        </div>
        {sessionError && (
          <div className="text-danger small mt-1">{sessionError}</div>
        )}
      </div>

      {timeData && (
        <div className="mt-3 border-top pt-2">
          <div className="fw-bold mb-1">Temps sur la tâche</div>
          <div className="small text-muted mb-1">
            Aujourd’hui :{' '}
            <strong>{fmtMinutes(timeData.today_minutes || 0)}</strong>
          </div>
          <div className="small">
            Total cumulé :{' '}
            <strong>{fmtMinutes(timeData.total_minutes || 0)}</strong>
          </div>
        </div>
      )}

      {timeError && (
        <div className="text-danger small mt-2">{timeError}</div>
      )}

      {statusError && (
        <div className="alert alert-danger py-1 small mt-2">
          {statusError}
        </div>
      )}
    </div>
  );

  const renderComments = () => (
    <div className="mt-3">
      <form className="mb-3" onSubmit={handleAddComment}>
        <div className="mb-2">
          <textarea
            className="form-control"
            rows={2}
            placeholder="Ajouter un commentaire…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-sm btn-primary">
          Publier
        </button>
        {commentsError && (
          <div className="text-danger small mt-1">{commentsError}</div>
        )}
      </form>

      {commentsLoading && (
        <div className="text-muted small">Chargement des commentaires…</div>
      )}

      {!commentsLoading && comments.length === 0 && (
        <div className="text-muted small">Aucun commentaire pour le moment.</div>
      )}

      <ul className="list-unstyled mb-0">
        {comments.map((c) => (
          <li key={c.id} className="mb-2">
            <div className="small">
              <strong>
                {c.author_name || c.user_name || 'Utilisateur'}
              </strong>{' '}
              <span className="text-muted">
                {c.created_at
                  ? new Date(c.created_at).toLocaleString()
                  : ''}
              </span>
            </div>
            <div>{c.content || c.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderTime = () => {
    if (timeLoading) {
      return <div className="mt-3 small text-muted">Chargement du temps…</div>;
    }
    if (timeError) {
      return <div className="mt-3 text-danger small">{timeError}</div>;
    }
    if (!timeData || !timeData.total_minutes) {
      return (
        <div className="mt-3 small text-muted">
          Aucun temps enregistré pour l’instant sur cette tâche.
        </div>
      );
    }

    const { total_minutes, by_day = {}, by_user = {} } = timeData;

    const dayEntries = Object.entries(by_day).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    const userEntries = Object.entries(by_user);

    return (
      <div className="mt-3">
        <div className="mb-3">
          <h6 className="mb-1">Total cumulé</h6>
          <div>{fmtMinutes(total_minutes)}</div>
        </div>

        {dayEntries.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-1">Par jour</h6>
            <ul className="list-unstyled mb-0">
              {dayEntries.map(([day, m]) => (
                <li key={day}>
                  <span className="text-muted">{day} :</span>{' '}
                  <strong>{fmtMinutes(m)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {userEntries.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-1">Par utilisateur</h6>
            <ul className="list-unstyled mb-0">
              {userEntries.map(([uid, m]) => (
                <li key={uid}>
                  <span className="text-muted">User #{uid} :</span>{' '}
                  <strong>{fmtMinutes(m)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
  className="offcanvas offcanvas-end show ft-offcanvas"
  style={{ visibility: 'visible' }}
>

      <div className="offcanvas-header border-bottom">
        <div>
          <h5 className="offcanvas-title mb-0">{local.title}</h5>
          <div className="small text-muted">Statut : {statusSelect}</div>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
        />
      </div>

      <div className="offcanvas-body">
        <ul className="nav nav-tabs mt-3 ft-tabs-scroll">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'details' ? 'active' : ''}`}
              onClick={() => setTab('details')}
            >
              Détails
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'checklist' ? 'active' : ''}`}
              onClick={() => setTab('checklist')}
            >
              Checklist
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'time' ? 'active' : ''}`}
              onClick={() => setTab('time')}
            >
              Temps
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'comments' ? 'active' : ''}`}
              onClick={() => setTab('comments')}
            >
              Commentaires
            </button>
          </li>
        </ul>

        {tab === 'details' && renderDetails()}
        {tab === 'checklist' && (
          <ChecklistTab task={local} onUpdated={onUpdated} />
        )}
        {tab === 'time' && renderTime()}
        {tab === 'comments' && renderComments()}
      </div>
    </div>
  );
}

export default TaskDrawer;
