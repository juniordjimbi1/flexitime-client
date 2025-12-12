// client/src/components/paged/PaginatedFilesList.js
import React from 'react';
import usePagination from '../../hooks/usePagination';
import { getDayCloseFilesPaged, getTeamCloseFilesPaged } from '../../services/pagedApi';

/**
 * type: 'day' | 'team'
 * closeId: number (obligatoire)
 */
export default function PaginatedFilesList({ type = 'day', closeId, defaultLimit = 10 }) {
  const { page, setPage, limit, setLimit, meta, setMeta } = usePagination({ page: 1, limit: defaultLimit });
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(() => {
    if (!closeId) return;
    setLoading(true); setError('');
    const params = { page, limit };
    const fn = type === 'team' ? getTeamCloseFilesPaged : getDayCloseFilesPaged;
    fn(closeId, params)
      .then(r => {
        setRows(r?.data?.data || []);
        setMeta(r?.data?.meta || { page, limit, total: 0, pages: 0 });
      })
      .catch(e => setError(e?.response?.data?.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [type, closeId, page, limit]);

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
            <tr><th>ID</th><th>Nom d’origine</th><th>Fichier</th><th className="text-end">Taille</th><th>MIME</th><th>Ajouté</th></tr>
          </thead>
          <tbody>
            {rows.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.original_name}</td>
                <td className="text-break">{f.filename}</td>
                <td className="text-end">{f.size}</td>
                <td>{f.mime}</td>
                <td>{f.created_at}</td>
              </tr>
            ))}
            {!rows.length && !loading ? (
              <tr><td colSpan={6}><div className="alert alert-warning mb-0">Aucun fichier.</div></td></tr>
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
