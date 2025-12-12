// client/src/components/paged/PagedMySessionsTable.js
import React from 'react';
import usePagination from '../../hooks/usePagination';
import { getMySessionsPaged } from '../../services/pagedApi';

export default function PagedMySessionsTable({ defaultLimit = 10, date = '' }) {
  const { page, setPage, limit, setLimit, meta, setMeta } = usePagination({ page: 1, limit: defaultLimit });
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true); setError('');
    const params = { page, limit };
    if (date) params.date = date;
    getMySessionsPaged(params)
      .then(r => {
        setRows(r?.data?.data || []);
        setMeta(r?.data?.meta || { page, limit, total: 0, pages: 0 });
      })
      .catch(e => setError(e?.response?.data?.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [page, limit, date]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-2">
        <label>Par page</label>
        <select value={limit} onChange={e=>setLimit(Number(e.target.value))} className="form-select w-auto">
          {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="ms-auto small">Total: {meta.total} • Pages: {meta.pages} • Page: {meta.page}</span>
      </div>

      {loading ? <div className="alert alert-info">Chargement…</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive">
        <table className="table table-sm table-striped align-middle">
          <thead>
            <tr><th>ID</th><th>Task</th><th>Début</th><th>Fin</th><th className="text-end">Minutes</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.task_id}</td>
                <td>{r.start_time}</td>
                <td>{r.end_time || '—'}</td>
                <td className="text-end">{r.duration_minutes}</td>
              </tr>
            ))}
            {!rows.length && !loading ? (
              <tr><td colSpan={5}><div className="alert alert-warning mb-0">Aucune session trouvée.</div></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(page-1)}>Précédent</button>
        <button className="btn btn-outline-secondary" disabled={page>=meta.pages} onClick={()=>setPage(page+1)}>Suivant</button>
      </div>
    </div>
  );
}
