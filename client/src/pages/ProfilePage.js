import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UX';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deps, setDeps] = useState([]);
  const [subs, setSubs] = useState([]);

  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [subId, setSubId] = useState('');

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const myDepId = useMemo(() => {
    const sd = subs.find(s => String(s.id) === String(subId));
    return sd ? String(sd.department_id) : '';
  }, [subs, subId]);

  async function load() {
    const r = await api.get('/profile/me');
    const d = r.data.data;
    setDeps(d.deps || []);
    setSubs(d.subs || []);
    if (d.me) {
      setFirst(d.me.first_name || '');
      setLast(d.me.last_name || '');
      setEmail(d.me.email || '');
      setSubId(d.me.subdepartment_id ? String(d.me.subdepartment_id) : '');
      // hydrater aussi le contexte user
      setUser(prev => ({ ...prev, ...d.me }));
    }
  }

  useEffect(() => {
    (async () => {
      try { await load(); } catch (e) { toast.error('Erreur de chargement'); } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveBasic(e) {
    e.preventDefault();
    try {
      const body = {
        first_name: first,
        last_name: last,
        subdepartment_id: subId ? Number(subId) : null
      };
      const r = await api.patch('/profile/me', body);
      setUser(prev => ({ ...prev, ...r.data.data }));
      toast.success('Profil mis à jour');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur maj profil');
    }
  }

  async function saveEmail(e) {
    e.preventDefault();
    try {
      const r = await api.patch('/profile/me/email', { email });
      setUser(prev => ({ ...prev, ...r.data.data }));
      toast.success('Email mis à jour');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur maj email');
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    try {
      if (newPass !== confirmPass) return toast.error('Confirmation différente');
      await api.patch('/profile/me/password', { current_password: curPass, new_password: newPass });
      setCurPass(''); setNewPass(''); setConfirmPass('');
      toast.success('Mot de passe mis à jour');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur maj mot de passe');
    }
  }

  async function doDelete() {
    if (!window.confirm('Confirmer la suppression de votre compte ? Cette action est irréversible.')) return;
    try {
      await api.delete('/profile/me');
      toast.success('Compte supprimé');
      logout();
      navigate('/login');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Suppression impossible');
    }
  }

  const subOptions = useMemo(() => {
    if (!myDepId) return subs;
    return subs.filter(s => String(s.department_id) === String(myDepId));
  }, [subs, myDepId]);

  const initials = useMemo(() => {
    const f = (first || user?.first_name || '').trim();
    const l = (last || user?.last_name || '').trim();
    return ((f[0] || '') + (l[0] || '')).toUpperCase() || 'U';
  }, [first, last, user]);

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Mon profil</h2>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <>
          {/* Header */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                 style={{width:56, height:56, fontWeight:700}}>
              {initials}
            </div>
            <div>
              <div className="fw-bold">{first} {last}</div>
              <div className="text-muted small">{user?.role_code}</div>
            </div>
          </div>

          <div className="row g-4">
            {/* Infos de base */}
            <div className="col-lg-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Informations</h5>
                  <form className="row g-3" onSubmit={saveBasic}>
                    <div className="col-md-6">
                      <label className="form-label">Prénom</label>
                      <input className="form-control" value={first} onChange={e=>setFirst(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nom</label>
                      <input className="form-control" value={last} onChange={e=>setLast(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Département</label>
                      <select
                        className="form-select"
                        value={myDepId}
                        onChange={e=>{
                          const dep = e.target.value;
                          if (!dep) { /* all subs */ }
                          // si changement de dep, reset sub si incompatible
                          setSubId('');
                        }}
                      >
                        <option value="">— Non renseigné —</option>
                        {deps.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Sous-département</label>
                      <select className="form-select" value={subId} onChange={e=>setSubId(e.target.value)}>
                        <option value="">— Non renseigné —</option>
                        {subOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary" type="submit">Enregistrer</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Email & mot de passe */}
            <div className="col-lg-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="card-title">Email</h5>
                  <form className="row g-3" onSubmit={saveEmail}>
                    <div className="col-md-8">
                      <label className="form-label">Email</label>
                      <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button className="btn btn-outline-primary w-100" type="submit">Mettre à jour</button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Mot de passe</h5>
                  <form className="row g-3" onSubmit={savePassword}>
                    <div className="col-12">
                      <label className="form-label">Mot de passe actuel</label>
                      <input type="password" className="form-control" value={curPass} onChange={e=>setCurPass(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nouveau mot de passe</label>
                      <input type="password" className="form-control" value={newPass} onChange={e=>setNewPass(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirmer</label>
                      <input type="password" className="form-control" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-outline-primary" type="submit">Changer le mot de passe</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="col-12">
              <div className="card border-danger">
                <div className="card-body">
                  <h5 className="card-title text-danger">Zone de danger</h5>
                  <p className="mb-3 text-muted">Supprimer définitivement votre compte et vos données personnelles (sessions, assignations, clôtures). Indisponible si vous êtes chef d’équipe.</p>
                  <button className="btn btn-danger" onClick={doDelete}>Supprimer mon compte</button>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
