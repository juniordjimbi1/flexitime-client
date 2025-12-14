import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { FiCheck, FiUsers } from 'react-icons/fi';
import { Spinner, EmptyState } from '../components/UX';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/users');
      setUsers(r.data.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function changeRole(id, role_code) {
    setUpdatingId(id);
    try {
      await api.patch(`/users/${id}/role`, { role_code });
      toast.success(`Rôle défini: ${role_code}`);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Comptes utilisateurs</h2>
      <p className="text-muted">Promouvoir/dégrader les rôles. <FiUsers /></p>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          {/* DESKTOP: TABLE */}
          <div className="ft-table-desktop table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Nom</th><th>Email</th><th>Rôle</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge bg-light text-dark">{u.role_code}</span></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {['EMPLOYEE','MANAGER','ADMIN'].map(r => (
                          <button
                            key={r}
                            className={`btn ${u.role_code === r ? 'btn-primary' : 'btn-outline-secondary'}`}
                            disabled={updatingId === u.id}
                            onClick={() => changeRole(u.id, r)}
                          >
                            {u.role_code === r ? <FiCheck /> : null} {r}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td colSpan="4"><EmptyState title="Aucun utilisateur" /></td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE: CARDS */}
          <div className="ft-cards-mobile">
            {!users.length ? (
              <EmptyState title="Aucun utilisateur" />
            ) : users.map(u => (
              <div key={u.id} className="ft-card-item mb-2">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="fw-semibold">{u.first_name} {u.last_name}</div>
                    <div className="text-muted small">{u.email}</div>
                  </div>
                  <span className="badge bg-light text-dark">{u.role_code}</span>
                </div>

                <div className="dropdown mt-2">
                  <button
                    className="btn btn-outline-secondary btn-sm w-100 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    disabled={updatingId === u.id}
                  >
                    Changer le rôle
                  </button>
                  <ul className="dropdown-menu w-100">
                    {['EMPLOYEE','MANAGER','ADMIN'].map(r => (
                      <li key={r}>
                        <button
                          className={`dropdown-item ${u.role_code === r ? 'active' : ''}`}
                          onClick={() => changeRole(u.id, r)}
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
