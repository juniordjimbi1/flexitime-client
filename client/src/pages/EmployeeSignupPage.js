import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Spinner } from '../components/UX';
import { Link, useNavigate } from 'react-router-dom';

export default function EmployeeSignupPage() {
  const navigate = useNavigate();

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');

  const [departments, setDepartments] = useState([]);
  const [subdeps, setSubdeps] = useState([]);
  const [depId, setDepId] = useState('');
  const [subId, setSubId] = useState('');
  const [createSub, setCreateSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  async function loadDeps() {
    const r = await api.get('/public/departments');
    setDepartments(r.data.data || []);
  }
  async function loadSubdeps(did) {
    const r = await api.get('/public/subdepartments', { params: did ? { department_id: did } : {} });
    setSubdeps(r.data.data || []);
  }

  useEffect(() => {
    (async () => {
      try { await Promise.all([loadDeps(), loadSubdeps(null)]); }
      catch (e) { toast.error(e?.response?.data?.message || 'Erreur de chargement'); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (depId) await loadSubdeps(depId);
        setSubId('');
      } catch (e) { /* no-op */ }
    })();
  }, [depId]);

  async function submit(e) {
    e.preventDefault();
    if (!depId) return toast.error('Le département est obligatoire.');
    if (!pwd || pwd !== pwd2) return toast.error('Les mots de passe ne correspondent pas.');
    if (createSub && !newSubName.trim()) return toast.error('Nom du nouveau sous-département requis.');

    setWorking(true);
    try {
      const payload = {
        first_name: first.trim(),
        last_name: last.trim(),
        email: email.trim(),
        password: pwd,
        department_id: Number(depId),
        subdepartment_id: createSub ? null : (subId ? Number(subId) : null),
        new_subdep_name: createSub ? newSubName.trim() : null
      };
      await api.post('/auth/employee-signup', payload);
      toast.success('Compte créé, vous pouvez vous connecter.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur inscription');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-2">Créer un compte employé</h3>
              <p className="text-muted mb-4">Renseignez votre département (obligatoire) et, si besoin, créez un nouveau sous-département.</p>

              {loading ? (
                <div className="text-center py-5"><Spinner /></div>
              ) : (
                <form className="row g-3" onSubmit={submit}>
                  <div className="col-md-6">
                    <label className="form-label">Prénom</label>
                    <input className="form-control" value={first} onChange={e=>setFirst(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nom</label>
                    <input className="form-control" value={last} onChange={e=>setLast(e.target.value)} required />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" className="form-control" value={pwd} onChange={e=>setPwd(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <input type="password" className="form-control" value={pwd2} onChange={e=>setPwd2(e.target.value)} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Département <span className="text-danger">*</span></label>
                    <select className="form-select" value={depId} onChange={e=>setDepId(e.target.value)} required>
                      <option value="">— choisir —</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Sous-département</label>
                    {!createSub ? (
                      <select className="form-select" value={subId} onChange={e=>setSubId(e.target.value)} disabled={!depId}>
                        <option value="">— (aucun) —</option>
                        {subdeps
                          .filter(sd => !depId || Number(sd.department_id) === Number(depId))
                          .map(sd => <option key={sd.id} value={sd.id}>{sd.name}</option>)}
                      </select>
                    ) : (
                      <input
                        className="form-control"
                        value={newSubName}
                        onChange={e=>setNewSubName(e.target.value)}
                        placeholder="Nom du nouveau sous-département"
                      />
                    )}
                    <div className="form-text">
                      {createSub
                        ? 'Vous créez un nouveau sous-département dans le département choisi.'
                        : 'Vous pouvez aussi créer un nouveau sous-département.'}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="createSub" checked={createSub}
                             onChange={e=>{ setCreateSub(e.target.checked); setSubId(''); }} disabled={!depId}/>
                      <label className="form-check-label" htmlFor="createSub">
                        Créer un nouveau sous-département dans ce département
                      </label>
                    </div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary" type="submit" disabled={working}>
                      {working ? 'Création…' : 'Créer mon compte'}
                    </button>
                    <Link className="btn btn-outline-secondary" to="/login">J’ai déjà un compte</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="text-muted small mt-2">
            Besoin d’aide ? <Link to="/about">Voir “À propos”</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
