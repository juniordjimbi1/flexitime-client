import React, { useEffect, useMemo, useState } from 'react';
import PagedMySessionsTable from '../components/paged/PagedMySessionsTable';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';

export default function EmployeeHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState(''); // '', PENDING, APPROVED, REJECTED
  const [sort, setSort] = useState('date_desc'); // date_desc | date_asc | time_desc | time_asc

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
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (status) params.status = status;
    const r = await api.get('/history/my', { params });
    setRows(r.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try { await load(); } catch { toast.error('Erreur de chargement'); } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(e) {
    e.preventDefault();
    setLoading(true);
    load().finally(() => setLoading(false));
  }

  function sortedRows() {
    const arr = [...rows];
    switch (sort) {
      case 'date_asc':  arr.sort((a,b)=> (a.close_date||'').localeCompare(b.close_date||'')); break;
      case 'time_desc': arr.sort((a,b)=> (b.total_minutes||0)-(a.total_minutes||0)); break;
      case 'time_asc':  arr.sort((a,b)=> (a.total_minutes||0)-(b.total_minutes||0)); break;
      default:          arr.sort((a,b)=> (b.close_date||'').localeCompare(a.close_date||'')); break;
    }
    return arr;
  }

  function exportCsv() {
    const url = new URL(`${API_ORIGIN}/api/history/my.csv`);
    if (from)  url.searchParams.set('from', from);
    if (to)    url.searchParams.set('to', to);
    if (status) url.searchParams.set('status', status);
    window.open(url.toString(), '_blank');
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Mon historique</h2>

      <form className="row g-2 mb-3" onSubmit={applyFilters}>
        <div className="col-md-3">
          <label className="form-label">Du</label>
          <input type="date" className="form-control" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Au</label>
          <input type="date" className="form-control" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Statut</label>
          <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">— Tous —</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Validé</option>
            <option value="REJECTED">Rejeté</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end gap-2">
          <button className="btn btn-outline-primary flex-grow-1" type="submit">Appliquer</button>
          <button type="button" className="btn btn-success" onClick={exportCsv}>Exporter CSV</button>
        </div>
      </form>

      <div className="d-flex justify-content-end mb-2">
        <div className="input-group" style={{maxWidth: 280}}>
          <label className="input-group-text">Tri</label>
          <select className="form-select" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="date_desc">Date ↓</option>
            <option value="date_asc">Date ↑</option>
            <option value="time_desc">Temps ↓</option>
            <option value="time_asc">Temps ↑</option>
          </select>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : !rows.length ? (
            <EmptyState title="Aucune clôture trouvée" />
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Temps total</th>
                    <th>Tâches DONE</th>
                    <th>Statut</th>
                    <th>Commentaire validateur</th>
                    <th>Résumé employé</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows().map(r => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.close_date}</td>
                      <td>{r.total_minutes} min</td>
                      <td>{r.tasks_done}</td>
                      <td>
                        <span className={
                          'badge ' + (r.validation_status === 'APPROVED'
                            ? 'bg-success'
                            : r.validation_status === 'REJECTED'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          )
                        }>
                          {r.validation_status || '—'}
                        </span>
                      </td>
                      <td className="text-muted">{r.validator_comment || '—'}</td>
                      <td className="text-muted">{r.employee_comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  <div className="card mt-4">
    <div className="card-header">
      <strong>Sessions (pagination)</strong>
    </div>
    <div className="card-body">
      <PagedMySessionsTable defaultLimit={10} />
    </div>
  </div>
}
