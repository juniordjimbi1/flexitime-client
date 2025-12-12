import React, { useEffect, useState, useMemo } from 'react';
import PaginatedFilesList from '../components/paged/PaginatedFilesList';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';
import { FiPaperclip, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';

export default function ManagerValidationsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [decision, setDecision] = useState({}); // id -> comment
  const [openRow, setOpenRow] = useState(null); // validation id
  const [filesByClose, setFilesByClose] = useState({}); // day_close_id -> files[]

  // Détermine l'origine API absolue pour ouvrir les PDF dans un nouvel onglet
  const API_ORIGIN = useMemo(() => {
    // 1) priorité à la variable d'env explicite
    const env = process.env.REACT_APP_API_ORIGIN;
    if (env && /^https?:\/\//i.test(env)) return env.replace(/\/$/, '');
    // 2) si baseURL absolue, on en prend l'origin
    try {
      const base = api?.defaults?.baseURL;
      if (base && /^https?:\/\//i.test(base)) return new URL(base).origin;
    } catch {}
    // 3) fallback dev local
    return 'http://localhost:4000';
  }, []);

  async function load() {
    const r = await api.get('/validations/pending');
    setList(r.data.data || []);
  }

  async function loadFiles(dayCloseId) {
    try {
      const r = await api.get(`/day-close/${dayCloseId}/files`);
      setFilesByClose(prev => ({ ...prev, [dayCloseId]: r.data.data || [] }));
    } catch (e) {
      toast.error('Erreur chargement fichiers');
    }
  }

  useEffect(() => {
    (async () => {
      try { await load(); } catch (e) { toast.error('Erreur'); } finally { setLoading(false); }
    })();
  }, []);

  async function decide(id, status) {
    try {
      await api.post(`/validations/${id}/decision`, { status, comment: decision[id] || null });
      toast.success(status === 'APPROVED' ? 'Validé' : 'Rejeté');
      setOpenRow(null);
      setFilesByClose({});
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur décision');
    }
  }

  function toggleFiles(v) {
    const isOpen = openRow === v.id;
    if (isOpen) {
      setOpenRow(null);
      return;
    }
    setOpenRow(v.id);
    if (!filesByClose[v.day_close_id]) {
      loadFiles(v.day_close_id);
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Clôtures à valider</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th style={{width:36}}></th>
                    <th>Employé</th>
                    <th>Date</th>
                    <th>Temps</th>
                    <th>Tâches DONE</th>
                    <th>Pièces jointes</th>
                    <th>Commentaire (manager)</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(v => {
                    const isOpen = openRow === v.id;
                    const files = filesByClose[v.day_close_id] || [];
                    const fileBadge = Number(v.file_count || 0) > 0
                      ? (<span className="badge bg-light text-dark"><FiPaperclip className="me-1" /> {v.file_count}</span>)
                      : (<span className="text-muted">—</span>);
                    return (
                      <React.Fragment key={v.id}>
                        <tr>
                          <td>
                            <button className="btn btn-sm btn-light" onClick={()=>toggleFiles(v)} title="Détails & fichiers">
                              {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                          </td>
                          <td>
                            {v.last_name} {v.first_name}
                            <div className="small text-muted">{v.email}</div>
                          </td>
                          <td>{v.close_date}</td>
                          <td>{v.total_minutes} min</td>
                          <td>{v.tasks_done}</td>
                          <td>{fileBadge}</td>
                          <td style={{minWidth:220}}>
                            <input
                              className="form-control form-control-sm"
                              value={decision[v.id] || ''}
                              onChange={e=>setDecision(prev => ({...prev, [v.id]: e.target.value}))}
                              placeholder="Commentaire (optionnel du manager)"
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
                            <td colSpan="7">
                              <div className="p-3 border rounded bg-light">
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <div className="fw-semibold mb-2">
                                      <FiFileText className="me-1" />
                                      Résumé / note de l’employé
                                    </div>
                                    <div className="p-2 bg-white border rounded" style={{minHeight:48}}>
                                      {v.employee_comment ? v.employee_comment : <span className="text-muted">—</span>}
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="fw-semibold mb-2">
                                      <FiPaperclip className="me-1" />
                                      Pièces jointes
                                    </div>
                                    <PaginatedFilesList type="day" closeId={v.day_close_id} defaultLimit={10} />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {!list.length && <tr><td colSpan="8"><EmptyState title="Aucune validation en attente" /></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
