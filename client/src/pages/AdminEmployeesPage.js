import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Spinner, EmptyState } from '../components/UX';
import { toast } from 'react-hot-toast';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function AdminEmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [depId, setDepId] = useState('');

  const [sortKey, setSortKey] = useState('last_name'); // 'department_name' | 'subdepartment_name' | 'email'
  const [sortDir, setSortDir] = useState('asc');       // 'asc' | 'desc'

  async function loadDeps() {
    const r = await api.get('/lookup/departments');
    setDepartments(r.data.data || []);
  }
  async function loadEmployees() {
    const r = await api.get('/users/employees', { params: depId ? { department_id: depId } : {} });
    setEmployees(r.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadDeps(), loadEmployees()]);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    (async () => {
      try { await loadEmployees(); } catch(e){ toast.error('Erreur employés'); }
    })();
    // eslint-disable-next-line
  }, [depId]);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    const arr = [...employees];
    const dir = sortDir === 'asc' ? 1 : -1;
    return arr.sort((a, b) => {
      const va =
        sortKey === 'department_name' ? (a.department_name || '') :
        sortKey === 'subdepartment_name' ? (a.subdepartment_name || '') :
        sortKey === 'email' ? (a.email || '') :
        (a.last_name || '') + ' ' + (a.first_name || '');
      const vb =
        sortKey === 'department_name' ? (b.department_name || '') :
        sortKey === 'subdepartment_name' ? (b.subdepartment_name || '') :
        sortKey === 'email' ? (b.email || '') :
        (b.last_name || '') + ' ' + (b.first_name || '');
      return va.localeCompare(vb) * dir;
    });
  }, [employees, sortKey, sortDir]);

  const SortIcon = ({ k }) =>
    k === sortKey ? (sortDir === 'asc' ? <FiChevronUp /> : <FiChevronDown />) : null;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Employés</h2>
      <p className="text-muted">Liste des employés avec département / sous-département. Filtre et tri disponibles.</p>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Filtrer par département</label>
              <select className="form-select" value={depId} onChange={e=>setDepId(e.target.value)}>
                <option value="">(Tous)</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary" onClick={()=>loadEmployees().catch(()=>{})}>Rafraîchir</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5"><Spinner /></div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th role="button" onClick={()=>toggleSort('last_name')}>Nom <SortIcon k="last_name" /></th>
                    <th role="button" onClick={()=>toggleSort('email')}>Email <SortIcon k="email" /></th>
                    <th role="button" onClick={()=>toggleSort('department_name')}>Département <SortIcon k="department_name" /></th>
                    <th role="button" onClick={()=>toggleSort('subdepartment_name')}>Sous-département <SortIcon k="subdepartment_name" /></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(u => (
                    <tr key={u.id}>
                      <td>{u.last_name} {u.first_name}</td>
                      <td>{u.email}</td>
                      <td>{u.department_name || <span className="text-muted">—</span>}</td>
                      <td>{u.subdepartment_name || <span className="text-muted">—</span>}</td>
                    </tr>
                  ))}
                  {!sorted.length && <tr><td colSpan="4"><EmptyState title="Aucun employé" /></td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
