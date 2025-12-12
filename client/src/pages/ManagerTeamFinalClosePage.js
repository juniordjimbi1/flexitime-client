import React, { useEffect, useMemo, useState } from 'react';
import PaginatedFilesList from '../components/paged/PaginatedFilesList';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';

export default function ManagerTeamFinalClosePage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));

  const [preview, setPreview] = useState(null);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [working, setWorking] = useState(false);

  const API_ORIGIN = useMemo(() => {
    const env = process.env.REACT_APP_API_ORIGIN;
    if (env && /^https?:\/\//i.test(env)) return env.replace(/\/$/, '');
    try {
      const base = api?.defaults?.baseURL;
      if (base && /^https?:\/\//i.test(base)) return new URL(base).origin;
    } catch {}
    return 'http://localhost:4000';
  }, []);

  async function loadTeams() {
    const r = await api.get('/manager/teams');
    const items = r.data.data || [];
    setTeams(items);
    if (items.length && !teamId) setTeamId(String(items[0].id));
  }
  async function loadPreview(tid, d) {
    if (!tid) return;
    const r = await api.get('/team-close/preview', { params: { team_id: tid, date: d } });
    setPreview(r.data.data || null);
  }

  useEffect(() => {
    (async () => {
      try { await loadTeams(); } catch { toast.error('Erreur chargement équipes'); } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (teamId) await loadPreview(teamId, date);
    })();
  }, [teamId, date]);

  async function doClose() {
    if (!teamId) return toast.error('Sélectionne une équipe');
    setWorking(true);
    try {
      const r = await api.post('/team-close', { team_id: Number(teamId), date, comment: comment || null });
      const id = r?.data?.data?.id;
      if (file && id) {
        const form = new FormData();
        form.append('file', file);
        await api.post(`/team-close/${id}/files`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await loadPreview(teamId, date);
      setComment('');
      setFile(null);
      toast.success('Clôture équipe envoyée à l’Admin');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur clôture équipe');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Clôture finale d’équipe</h2>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-5">
              <label className="form-label">Équipe</label>
              <select className="form-select" value={teamId} onChange={e=>setTeamId(e.target.value)}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name} — {t.department_name} / {t.subdepartment_name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Résumé / Note (optionnel)</label>
              <input className="form-control" value={comment} onChange={e=>setComment(e.target.value)} maxLength={255} />
            </div>
          </div>

          {!preview ? (
            <EmptyState title="Aucun aperçu" />
          ) : (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-3">
                    <div className="p-3 border rounded bg-light">
                      <div className="text-muted small">Membres (soumis / total)</div>
                      <div className="fw-semibold">{preview.members_submitted} / {preview.members_total}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded bg-light">
                      <div className="text-muted small">Temps total</div>
                      <div className="fw-semibold">{preview.total_minutes} min</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded bg-light">
                      <div className="text-muted small">Tâches DONE</div>
                      <div className="fw-semibold">{preview.tasks_done_total}</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded bg-light">
                      <div className="text-muted small">Statut</div>
                      <div className="fw-semibold">{preview.validation?.status || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Liste des closes individuelles */}
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Employé</th><th>Temps</th><th>Tâches</th><th>Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(preview.submitted || []).map(r => (
                        <tr key={r.id}>
                          <td>{r.user_id}</td>
                          <td>{r.total_minutes} min</td>
                          <td>{r.tasks_done}</td>
                          <td><span className="badge bg-secondary">{r.validation_status || '—'}</span></td>
                        </tr>
                      ))}
                      {!preview.submitted?.length && (
                        <tr><td colSpan="4"><span className="text-muted">Aucune clôture individuelle reçue ce jour</span></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Fichiers + action */}
                <div className="row g-3 align-items-end mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Joindre un PDF (optionnel)</label>
                    <input type="file" className="form-control" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)} />
                    {/* fichiers existants */}
                    <div className="mt-2">
                      {(preview.files || []).length ? (
                        <ul className="mb-0">
                          {preview.files.map(f => (
                            <li key={f.id}>
                              <a href={`${API_ORIGIN}/api/team-close/files/${f.filename}`} target="_blank" rel="noopener noreferrer">
                                {f.original_name}
                              </a>
                              <span className="text-muted small ms-2">({Math.round((f.size||0)/1024)} Ko)</span>
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-muted small">Aucun fichier</span>}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-primary w-100" onClick={doClose} disabled={working}>
                      {working ? 'Envoi…' : 'Clôturer l’équipe & Envoyer'}
                    </button>
                  </div>
                  <div className="col-md-3 text-end text-muted">
                    {preview.team_close && <span className="small">Dernière clôture: {new Date(preview.team_close.closed_at.replace(' ','T')).toLocaleString()}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
