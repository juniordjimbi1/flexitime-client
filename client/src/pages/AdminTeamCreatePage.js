// client/src/pages/AdminTeamCreatePage.js
import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function AdminTeamCreatePage() {
  const [loading, setLoading] = useState(true);
  const [deps, setDeps] = useState([]);
  const [users, setUsers] = useState([]);

  // filtres
  const [depId, setDepId] = useState('');
  const [q, setQ] = useState('');

  // form création
  const [teamName, setTeamName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [selected, setSelected] = useState({}); // { userId: true }
  const [creating, setCreating] = useState(false);

  async function loadDeps() {
    const r = await api.get('/teams/manage/departments');
    setDeps(r.data.data || []);
  }

  async function loadUsers(params = {}) {
    const r = await api.get('/teams/manage/users', { params });
    setUsers(r.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadDeps();
        await loadUsers({});
      } catch (e) {
        console.error(e);
        toast.error("Erreur de chargement des données d'organisation");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function applyFilters(e) {
    e?.preventDefault?.();
    const params = {};
    if (depId) params.department_id = depId;
    if (q.trim()) params.q = q.trim();
    await loadUsers(params);
  }

  const managers = useMemo(
    () => users.filter((u) => u.role_code === 'MANAGER'),
    [users]
  );
  const employees = useMemo(
    () => users.filter((u) => u.role_code === 'EMPLOYEE'),
    [users]
  );

  function toggleUser(id) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  async function createTeam() {
    if (!teamName.trim()) {
      return toast.error("Nom d'équipe requis");
    }
    if (!depId) {
      return toast.error('Département requis');
    }
    if (!managerId) {
      return toast.error('Sélectionne un manager');
    }

    const memberIds = Object.entries(selected)
      .filter(([, v]) => !!v)
      .map(([k]) => Number(k));

    const body = {
      name: teamName.trim(),
      department_id: Number(depId),
      manager_user_id: Number(managerId),
      member_user_ids: memberIds,
    };

    setCreating(true);
    try {
      await api.post('/teams/manage/create', body);
      toast.success('Équipe créée');

      // reset partiel
      setTeamName('');
      setManagerId('');
      setSelected({});
      await applyFilters();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Créer une équipe</h2>
      <p className="text-muted">
        Choisis un département d’ancrage, un manager (parmi les managers) et compose une équipe
        avec des membres issus de n’importe quel département (équipes mixtes).
      </p>

      {loading && (
        <div className="text-center py-5">
          Chargement…
        </div>
      )}

      {!loading && (
        <div className="row g-4">
          {/* Colonne filtres */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header">Filtres</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Département (pour filtrer les utilisateurs)</label>
                  <select
                    className="form-select"
                    value={depId}
                    onChange={(e) => setDepId(e.target.value)}
                  >
                    <option value="">Tous</option>
                    {deps.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Recherche</label>
                  <input
                    className="form-control"
                    placeholder="Nom, prénom, email…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <button className="btn btn-primary w-100" onClick={applyFilters}>
                  Appliquer les filtres
                </button>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">Nouvelle équipe</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Nom de l’équipe</label>
                  <input
                    className="form-control"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ex : Équipe Projet X"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Département d’ancrage</label>
                  <select
                    className="form-select"
                    value={depId}
                    onChange={(e) => setDepId(e.target.value)}
                  >
                    <option value="">— choisir —</option>
                    {deps.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Manager (obligatoire)</label>
                  <select
                    className="form-select"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                  >
                    <option value="">— choisir un manager —</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name} — {m.email}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-success w-100"
                  onClick={createTeam}
                  disabled={creating}
                >
                  {creating ? 'Création en cours…' : 'Créer l’équipe'}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne liste utilisateurs */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header">Utilisateurs (managers & employés)</div>
              <div className="card-body p-0">
                {!users.length ? (
                  <div className="p-4 text-center text-muted">
                    Aucun utilisateur trouvé avec ces filtres.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th>Nom</th>
                          <th>Rôle</th>
                          <th>Département</th>
                          <th>Sous-département</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={!!selected[u.id]}
                                onChange={() => toggleUser(u.id)}
                              />
                            </td>
                            <td>
                              {u.first_name} {u.last_name}
                              <div className="small text-muted">{u.email}</div>
                            </td>
                            <td>
                              {u.role_code === 'MANAGER' ? (
                                <span className="badge bg-primary">Manager</span>
                              ) : (
                                <span className="badge bg-secondary">Employé</span>
                              )}
                            </td>
                            <td>{u.department_name || '—'}</td>
                            <td>{u.subdepartment_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
