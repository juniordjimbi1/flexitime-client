import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';
import { FiChevronDown, FiChevronUp, FiPaperclip } from 'react-icons/fi';

export default function AdminTeamValidationsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [comment, setComment] = useState({}); // id -> text
  const [filesByClose, setFilesByClose] = useState({}); // team_close_id -> files[]

  const API_ORIGIN = useMemo(() => {
    const env = process.env.REACT_APP_API_ORIGIN;
    if (env && /^https?:\/\//i.test(env)) return env.replace(/\/$/, '');
    try {
      const base = api?.defaults?.baseURL;
      if (base && /^https?:\/\//i.test(base)) return new URL(base).origin;
    } catch {}
    return 'http://localhost:4000';
  }, []);

  async function load() {
    const r = await api.get('/team-validations/pending');
    setList(r.data.data || []);
  }
  async function loadFiles(teamCloseId) {
    try {
      const r = await api.get(`/team-close/${teamCloseId}/files`);
      setFilesByClose(prev => ({ ...prev, [teamCloseId]: r.data.data || [] }));
    } catch {
      toast.error('Erreur chargement fichiers');
    }
  }

  useEffect(() => {
    (async () => { try { await load(); } catch { toast.error('Erreur'); } finally { setLoading(false); } })();
  }, []);

  function toggleRow(v) {
    const isOpen = openRow === v.id;
    if (isOpen) { setOpenRow(null); return; }
    setOpenRow(v.id);
    if (!filesByClose[v.team_close_id]) loadFiles(v.team_close_id);
  }

  async function decide(id, status) {
    try {
      await api.post(`/team-validations/${id}/decision`, { status, comment: comment[id] || null });
      toast.success(status === 'APPROVED' ? 'Validé' : 'Rejeté');
      setOpenRow(null);
      setFilesByClose({});
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur décision');
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Validations d’équipe</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : !list.length ? (
            <EmptyState title="Aucune clôture d’équipe en attente" />
          ) : (
            <div className="ft-table-desktop table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th style={{width:36}}></th>
                    <th>Équipe</th>
                    <th>Date</th>
                    <th>Membres</th>
                    <th>Temps total</th>
                    <th>Tâches DONE</th>
                    <th>Pièces</th>
                    <th>Commentaire (Admin)</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(v => {
                    const isOpen = openRow === v.id;
                    const files = filesByClose[v.team_close_id] || [];
                    return (
                      <React.Fragment key={v.id}>
                        <tr>
                          <td>
                            <button className="btn btn-sm btn-light" onClick={()=>toggleRow(v)}>
                              {isOpen ? <FiChevronUp/> : <FiChevronDown/>}
                            </button>
                          </td>
                          <td>
                            <div className="fw-semibold">{v.team_name}</div>
                            <div className="small text-muted">Mgr: {v.mgr_last} {v.mgr_first} — {v.mgr_email}</div>
                          </td>
                          <td>{v.close_date}</td>
                          <td>{v.members_submitted} / {v.members_total}</td>
                          <td>{v.total_minutes} min</td>
                          <td>{v.tasks_done_total}</td>
                          <td>
                            {Number(v.file_count||0) > 0 ? (
                              <span className="badge bg-light text-dark"><FiPaperclip className="me-1"/> {v.file_count}</span>
                            ) : <span className="text-muted">—</span>}
                          </td>
                          <td style={{minWidth:200}}>
                            <input
                              className="form-control form-control-sm"
                              placeholder="Commentaire (optionnel)"
                              value={comment[v.id] || ''}
                              onChange={e=>setComment(prev=>({ ...prev, [v.id]: e.target.value }))}
                            />
                          </td>
                          <td className="text-end">
                            <div className="btn-group">
                              <button className="btn btn-success btn-sm" onClick={()=>decide(v.id,'APPROVED')}>Valider</button>
                              <button className="btn btn-outline-danger btn-sm" onClick={()=>decide(v.id,'REJECTED')}>Rejeter</button>
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td></td>
                            <td colSpan="8">
                              <div className="p-3 border rounded bg-light">
                                <div className="mb-2"><span className="text-muted small">Résumé du manager :</span> <span className="fw-semibold">{v.manager_comment || '—'}</span></div>
                                <div className="fw-semibold mb-2">Pièces jointes</div>
                                {files.length ? (
                                  <ul className="mb-0">
                                    {files.map(f => (
                                      <li key={f.id}>
                                        <a href={`${API_ORIGIN}/api/team-close/files/${f.filename}`} target="_blank" rel="noopener noreferrer">
                                          {f.original_name}
                                        </a>
                                        <span className="text-muted small ms-2">({Math.round((f.size||0)/1024)} Ko)</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : <div className="text-muted">Aucun fichier</div>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div className="ft-cards-mobile">
  {!list.length ? (
    <EmptyState title="Aucune clôture d’équipe en attente" />
  ) : list.map(v => {
    const isOpen = openRow === v.id;
    const fileCount = Number(v.file_count || 0);
    const files = filesByClose[v.team_close_id] || [];

    return (
      <div key={v.id} className="ft-card-item mb-2">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div className="fw-semibold">{v.team_name}</div>
            <div className="text-muted small">Mgr: {v.mgr_last} {v.mgr_first}</div>
            <div className="text-muted small">{v.mgr_email}</div>
          </div>
          <button className="btn btn-light btn-sm" onClick={()=>toggleRow(v)}>
            {isOpen ? '▲' : '▼'}
          </button>
        </div>

        <div className="ft-kv"><span className="k">Date</span><span className="v">{v.close_date}</span></div>
        <div className="ft-kv"><span className="k">Membres</span><span className="v">{v.members_submitted} / {v.members_total}</span></div>
        <div className="ft-kv"><span className="k">Temps total</span><span className="v">{v.total_minutes} min</span></div>
        <div className="ft-kv"><span className="k">DONE</span><span className="v">{v.tasks_done_total}</span></div>
        <div className="ft-kv"><span className="k">Pièces</span><span className="v">{fileCount ? `${fileCount}` : '—'}</span></div>

        <div className="mt-2">
          <input
            className="form-control form-control-sm"
            placeholder="Commentaire (optionnel)"
            value={comment[v.id] || ''}
            onChange={e=>setComment(prev=>({ ...prev, [v.id]: e.target.value }))}
          />
        </div>

        <div className="ft-actions-mobile mt-2">
          <button className="btn btn-success btn-sm" onClick={()=>decide(v.id,'APPROVED')}>Valider</button>
          <button className="btn btn-outline-danger btn-sm mt-2" onClick={()=>decide(v.id,'REJECTED')}>Rejeter</button>
        </div>

        {isOpen && (
          <div className="mt-3 p-2 border rounded bg-light">
            <div className="mb-2">
              <span className="text-muted small">Résumé du manager :</span>{' '}
              <span className="fw-semibold">{v.manager_comment || '—'}</span>
            </div>

            <div className="fw-semibold mb-2">Pièces jointes</div>
            {files.length ? (
              <ul className="mb-0">
                {files.map(f => (
                  <li key={f.id}>
                    <a href={`${API_ORIGIN}/api/team-close/files/${f.filename}`} target="_blank" rel="noopener noreferrer">
                      {f.original_name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted">Aucun fichier</div>
            )}
          </div>
        )}
      </div>
    );
  })}
</div>

            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}
