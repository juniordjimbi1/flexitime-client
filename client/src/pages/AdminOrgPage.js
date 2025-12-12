import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { Spinner, EmptyState, ConfirmModal, LoadingOverlay } from '../components/UX';

export default function AdminOrgPage() {
  // lists
  const [deps, setDeps] = useState([]);
  const [subs, setSubs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // forms
  const [depName, setDepName] = useState('');
  const [editingDep, setEditingDep] = useState(null);
  const [depSubmitting, setDepSubmitting] = useState(false);

  const [subName, setSubName] = useState('');
  const [subDepId, setSubDepId] = useState('');
  const [editingSub, setEditingSub] = useState(null);
  const [subSubmitting, setSubSubmitting] = useState(false);

  // team members
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [toAdd, setToAdd] = useState([]);
  const [membersSubmitting, setMembersSubmitting] = useState(false);

  // confirm modal
  const [confirm, setConfirm] = useState({ show:false });

  const subsByDep = useMemo(() => {
    const map = {};
    subs.forEach(s => {
      map[s.department_id] = map[s.department_id] || [];
      map[s.department_id].push(s);
    });
    return map;
  }, [subs]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setInitialLoading(true);
    try {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        api.get('/org/departments'),
        api.get('/org/subdepartments'),
        api.get('/org/teams'),
        api.get('/users', { params: { role: 'MANAGER' } }),
        api.get('/users', { params: { role: 'EMPLOYEE' } }),
      ]);
      setDeps(r1.data.data);
      setSubs(r2.data.data);
      setTeams(r3.data.data);
      setManagers(r4.data.data);
      setEmployees(r5.data.data);
      if (!selectedTeamId && r3.data.data.length) setSelectedTeamId(String(r3.data.data[0].id));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setInitialLoading(false);
    }
  }

  async function loadMembers(teamId) {
    try {
      const r = await api.get('/org/team-members', { params: { team_id: teamId } });
      setTeamMembers(r.data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur de chargement des membres');
    }
  }

  useEffect(() => {
    if (selectedTeamId) {
      loadMembers(Number(selectedTeamId));
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeamId]);

  // ---- Departments
  async function submitDep(e) {
    e.preventDefault();
    if (!depName.trim()) return;
    setDepSubmitting(true);
    try {
      if (editingDep) {
        const res = await api.put(`/org/departments/${editingDep.id}`, { name: depName.trim() });
        setDeps(d => d.map(x => (x.id === editingDep.id ? res.data.data : x)));
        toast.success('Département mis à jour');
      } else {
        const res = await api.post('/org/departments', { name: depName.trim() });
        setDeps(d => [...d, res.data.data]);
        toast.success('Département créé');
      }
      setDepName('');
      setEditingDep(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setDepSubmitting(false);
    }
  }

  function editDep(dep) {
    setEditingDep(dep);
    setDepName(dep.name);
  }

  function askDelDep(id) {
    setConfirm({
      show:true,
      title:'Supprimer ce département ?',
      body:'Les sous-départements et équipes associées seront également supprimés.',
      onConfirm: async () => {
        setConfirm({ show:false });
        try {
          await api.delete(`/org/departments/${id}`);
          setDeps(d => d.filter(x => x.id !== id));
          setSubs(s => s.filter(x => x.department_id !== id));
          const teamsToRemove = teams.filter(t => t.department_id === id).map(t => t.id);
          if (teamsToRemove.includes(Number(selectedTeamId))) {
            setSelectedTeamId('');
            setTeamMembers([]);
          }
          setTeams(t => t.filter(x => x.department_id !== id));
          toast.success('Département supprimé');
        } catch (e) { toast.error(e?.response?.data?.message || 'Erreur'); }
      },
      onCancel: () => setConfirm({ show:false })
    });
  }

  // ---- Subdepartments
  async function submitSub(e) {
    e.preventDefault();
    if (!subName.trim() || !subDepId) return;
    setSubSubmitting(true);
    try {
      if (editingSub) {
        const res = await api.put(`/org/subdepartments/${editingSub.id}`, {
          name: subName.trim(),
          department_id: Number(subDepId),
        });
        setSubs(s => s.map(x => (x.id === editingSub.id ? res.data.data : x)));
        toast.success('Sous-département mis à jour');
      } else {
        const res = await api.post('/org/subdepartments', {
          name: subName.trim(),
          department_id: Number(subDepId),
        });
        setSubs(s => [...s, res.data.data]);
        toast.success('Sous-département créé');
      }
      setSubName('');
      setSubDepId('');
      setEditingSub(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setSubSubmitting(false);
    }
  }

  function editSub(s) {
    setEditingSub(s);
    setSubName(s.name);
    setSubDepId(String(s.department_id));
  }

  function askDelSub(id) {
    setConfirm({
      show:true,
      title:'Supprimer ce sous-département ?',
      body:'Les équipes associées seront également supprimées.',
      onConfirm: async () => {
        setConfirm({ show:false });
        try {
          await api.delete(`/org/subdepartments/${id}`);
          setSubs(s => s.filter(x => x.id !== id));
          const teamsToRemove = teams.filter(t => t.subdepartment_id === id).map(t => t.id);
          if (teamsToRemove.includes(Number(selectedTeamId))) {
            setSelectedTeamId('');
            setTeamMembers([]);
          }
          setTeams(t => t.filter(x => x.subdepartment_id !== id));
          toast.success('Sous-département supprimé');
        } catch (e) { toast.error(e?.response?.data?.message || 'Erreur'); }
      },
      onCancel: () => setConfirm({ show:false })
    });
  }

  // ---- Team Members (add/remove)
  async function addMembers(e) {
    e.preventDefault();
    if (!selectedTeamId || !toAdd.length) return;
    setMembersSubmitting(true);
    try {
      await api.post('/org/team-members', { team_id: Number(selectedTeamId), user_ids: toAdd.map(Number) });
      setToAdd([]);
      toast.success('Membres ajoutés');
      await loadMembers(Number(selectedTeamId));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur lors de l’ajout');
    } finally {
      setMembersSubmitting(false);
    }
  }

  function askRemoveMember(userId) {
    setConfirm({
      show:true,
      title:'Retirer ce membre ?',
      body:'Ce collaborateur ne sera plus rattaché à cette équipe.',
      onConfirm: async () => {
        setConfirm({ show:false });
        try {
          await api.delete('/org/team-members', { data: { team_id: Number(selectedTeamId), user_id: userId } });
          await loadMembers(Number(selectedTeamId));
          toast.success('Membre retiré');
        } catch (e) { toast.error(e?.response?.data?.message || 'Erreur'); }
      },
      onCancel: () => setConfirm({ show:false })
    });
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Organisation</h2>
      <p className="text-muted">
        Structure : Départements → Sous-départements → Équipes, et gestion des membres.
        <br />
        La création des équipes se fait désormais via le menu <strong>“Créer équipe”</strong>.
      </p>

      {/* LOADING global */}
      {initialLoading && (
        <div className="text-center py-5">
          <Spinner />
        </div>
      )}

      {!initialLoading && (
        <>
          <div className="row g-4 mb-4">
            {/* Departments */}
            <div className="col-lg-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Départements</h5>

                  <form className="row g-2 align-items-end" onSubmit={submitDep}>
                    <div className="col-md-6">
                      <label className="form-label">Nom</label>
                      <input
                        className={`form-control ${!depName && editingDep !== null ? 'is-invalid':''}`}
                        value={depName}
                        onChange={e=>setDepName(e.target.value)}
                        required
                      />
                      {!depName && editingDep !== null && (
                        <div className="invalid-feedback">Nom requis</div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <button className="btn btn-primary w-100" type="submit" disabled={depSubmitting}>
                        {depSubmitting ? 'Enregistrement…' : (editingDep ? 'Mettre à jour' : 'Ajouter')}
                      </button>
                    </div>
                    {editingDep && (
                      <div className="col-md-3">
                        <button
                          className="btn btn-outline-secondary w-100"
                          type="button"
                          onClick={() => { setEditingDep(null); setDepName(''); }}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </form>

                  <div className="table-responsive mt-3">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deps.map(d => (
                          <tr key={d.id}>
                            <td>{d.name}</td>
                            <td className="text-end">
                              <div className="actions-inline btn-group btn-group-sm">
                                <button className="btn btn-light" onClick={() => editDep(d)}>
                                  <FiEdit2 /> Éditer
                                </button>
                                <button className="btn btn-danger" onClick={() => askDelDep(d.id)}>
                                  <FiTrash2 /> Supprimer
                                </button>
                              </div>
                              <div className="actions-dropdown dropdown">
                                <button
                                  className="btn btn-light btn-sm dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                >
                                  <FiMoreVertical />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <button className="dropdown-item" onClick={() => editDep(d)}>
                                      Éditer
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => askDelDep(d.id)}
                                    >
                                      Supprimer
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!deps.length && (
                          <tr>
                            <td colSpan="2">
                              <EmptyState title="Aucun département" />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Subdepartments */}
            <div className="col-lg-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Sous-départements</h5>

                  <form className="row g-2 align-items-end" onSubmit={submitSub}>
                    <div className="col-md-4">
                      <label className="form-label">Département</label>
                      <select
                        className={`form-select ${!subDepId && editingSub !== null ? 'is-invalid':''}`}
                        value={subDepId}
                        onChange={e=>setSubDepId(e.target.value)}
                        required
                      >
                        <option value="">— choisir —</option>
                        {deps.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      {!subDepId && editingSub !== null && (
                        <div className="invalid-feedback">Sélection requise</div>
                      )}
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">Nom</label>
                      <input
                        className={`form-control ${!subName && editingSub !== null ? 'is-invalid':''}`}
                        value={subName}
                        onChange={e=>setSubName(e.target.value)}
                        required
                      />
                      {!subName && editingSub !== null && (
                        <div className="invalid-feedback">Nom requis</div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <button className="btn btn-primary w-100" type="submit" disabled={subSubmitting}>
                        {subSubmitting ? 'Enregistrement…' : (editingSub ? 'Mettre à jour' : 'Ajouter')}
                      </button>
                    </div>
                    {editingSub && (
                      <div className="col-md-12 mt-2">
                        <button
                          className="btn btn-outline-secondary w-100"
                          type="button"
                          onClick={() => {
                            setEditingSub(null);
                            setSubName('');
                            setSubDepId('');
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </form>

                  <div className="table-responsive mt-3">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Département</th>
                          <th>Sous-département</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subs.map(s => (
                          <tr key={s.id}>
                            <td>{s.department_name}</td>
                            <td>{s.name}</td>
                            <td className="text-end">
                              <div className="actions-inline btn-group btn-group-sm">
                                <button className="btn btn-light" onClick={() => editSub(s)}>
                                  <FiEdit2 /> Éditer
                                </button>
                                <button className="btn btn-danger" onClick={() => askDelSub(s.id)}>
                                  <FiTrash2 /> Supprimer
                                </button>
                              </div>
                              <div className="actions-dropdown dropdown">
                                <button
                                  className="btn btn-light btn-sm dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                >
                                  <FiMoreVertical />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <button className="dropdown-item" onClick={() => editSub(s)}>
                                      Éditer
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => askDelSub(s.id)}
                                    >
                                      Supprimer
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!subs.length && (
                          <tr>
                            <td colSpan="3">
                              <EmptyState title="Aucun sous-département" />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="card shadow-sm">
                <LoadingOverlay show={membersSubmitting} />
                <div className="card-body">
                  <h5 className="card-title mb-3">Membres d’équipe</h5>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Équipe</label>
                      <select
                        className="form-select"
                        value={selectedTeamId}
                        onChange={e => setSelectedTeamId(e.target.value)}
                      >
                        <option value="">— choisir —</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.department_name} / {t.subdep_name} / {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">Ajouter des employés</label>
                      <div className="d-flex gap-2">
                        <select
                          multiple
                          className="form-select"
                          value={toAdd}
                          onChange={e => {
                            const vals = [...e.target.selectedOptions].map(o => o.value);
                            setToAdd(vals);
                          }}
                          disabled={!selectedTeamId}
                        >
                          {employees.map(e => (
                            <option key={e.id} value={e.id}>
                              {e.first_name} {e.last_name} — {e.email}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-primary"
                          onClick={addMembers}
                          disabled={!selectedTeamId || !toAdd.length}
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="table-responsive">
                        <table className="table table-sm align-middle">
                          <thead>
                            <tr>
                              <th>Nom</th>
                              <th>Email</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teamMembers.map(m => (
                              <tr key={m.id}>
                                <td>
                                  {m.first_name} {m.last_name}
                                </td>
                                <td>{m.email}</td>
                                <td className="text-end">
                                  <div className="actions-inline">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => askRemoveMember(m.id)}
                                    >
                                      <FiTrash2 /> Retirer
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {!teamMembers.length && (
                              <tr>
                                <td colSpan="3">
                                  <EmptyState title="Aucun membre" />
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ConfirmModal
            show={confirm.show}
            title={confirm.title}
            body={confirm.body}
            onCancel={confirm.onCancel}
            onConfirm={confirm.onConfirm}
            confirmText="Oui, confirmer"
            confirmVariant="danger"
          />
        </>
      )}
    </div>
  );
}
