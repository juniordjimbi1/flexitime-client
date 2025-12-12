import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner, EmptyState } from '../components/UX';
import { FiUserPlus, FiUserMinus, FiSearch } from 'react-icons/fi';

export default function ManagerTeamMembersPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [members, setMembers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [q, setQ] = useState('');

  async function loadTeams() {
    const r = await api.get('/manager/teams');
    setTeams(r.data.data || []);
    if ((r.data.data || []).length && !teamId) {
      setTeamId(String(r.data.data[0].id));
    }
  }
  async function loadMembers(tid) {
    if (!tid) return;
    const r = await api.get(`/manager/teams/${tid}/members`);
    setMembers(r.data.data || []);
  }
  async function loadCandidates(tid, query='') {
    if (!tid) return;
    const params = {};
    if (query.trim()) params.q = query.trim();
    const r = await api.get(`/manager/teams/${tid}/candidates`, { params });
    setCandidates(r.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try { await loadTeams(); } catch (e) { toast.error('Erreur chargement'); } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (!teamId) return;
      try {
        await Promise.all([loadMembers(teamId), loadCandidates(teamId, q)]);
      } catch (e) {
        toast.error('Erreur équipe');
      }
    })();
  }, [teamId]);

  async function onSearch(e) {
    e.preventDefault();
    try { await loadCandidates(teamId, q); } catch { toast.error('Erreur recherche'); }
  }

  async function add(uid) {
    try {
      await api.post(`/manager/teams/${teamId}/members`, { user_id: uid });
      await Promise.all([loadMembers(teamId), loadCandidates(teamId, q)]);
      toast.success('Membre ajouté');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Impossible d’ajouter');
    }
  }

  async function remove(uid) {
    if (!window.confirm('Retirer ce membre de l’équipe ?')) return;
    try {
      await api.delete(`/manager/teams/${teamId}/members/${uid}`);
      await Promise.all([loadMembers(teamId), loadCandidates(teamId, q)]);
      toast.success('Membre retiré');
    } catch (e) {
      toast.error('Impossible de retirer');
    }
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Gestion des membres</h2>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-6">
              <label className="form-label">Mon équipe</label>
              <select className="form-select" value={teamId} onChange={e=>setTeamId(e.target.value)}>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.department_name} / {t.subdepartment_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <form className="d-flex gap-2" onSubmit={onSearch}>
                <div className="flex-grow-1">
                  <label className="form-label">Chercher un candidat (même sous-département)</label>
                  <input className="form-control" value={q} onChange={e=>setQ(e.target.value)} placeholder="Nom, prénom ou email…" />
                </div>
                <div className="pt-4">
                  <button className="btn btn-outline-primary"><FiSearch /></button>
                </div>
              </form>
            </div>
          </div>

          <div className="row g-3">
            {/* Membres actuels */}
            <div className="col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Membres actuels</h5>
                  {!members.length ? (
                    <EmptyState title="Aucun membre pour l’instant" />
                  ) : (
                    <ul className="list-group list-group-flush">
                      {members.map(m => (
                        <li key={m.id} className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <div className="fw-semibold">{m.last_name} {m.first_name}</div>
                            <div className="text-muted small">{m.email}</div>
                          </div>
                          <button className="btn btn-outline-danger btn-sm" onClick={()=>remove(m.id)}>
                            <FiUserMinus className="me-1" /> Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Candidats */}
            <div className="col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">Candidats éligibles</h5>
                  {!candidates.length ? (
                    <EmptyState title="Aucun candidat trouvé" />
                  ) : (
                    <ul className="list-group list-group-flush">
                      {candidates.map(c => (
                        <li key={c.id} className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <div className="fw-semibold">{c.last_name} {c.first_name}</div>
                            <div className="text-muted small">{c.email}</div>
                          </div>
                          <button className="btn btn-success btn-sm" onClick={()=>add(c.id)}>
                            <FiUserPlus className="me-1" /> Ajouter
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
