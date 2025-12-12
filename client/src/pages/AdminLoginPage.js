import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const { login, setError, error } = useAuth();
  const [email, setEmail] = useState('admin@flexitime.local');
  const [password, setPassword] = useState('password');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await login(email, password);
      if (u.role.code !== 'ADMIN') {
        // Empêche un non-admin d’entrer par cette porte
        setError('Accès réservé à l’Administration');
        return;
      }
      window.location.href = '/admin';
    } catch (err) {
      const msg = err?.response?.data?.message || 'Échec de connexion';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 fw-bold mb-1">Espace Admin</h1>
              <p className="text-muted mb-4">Réservé à l’équipe de gestion.</p>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button className="btn btn-warning w-100" disabled={submitting}>
                  {submitting ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>

              <div className="text-center small mt-3">
                Vous êtes employé ? <a href="/login">Aller à la connexion Employé</a>
              </div>
            </div>
          </div>
          <p className="text-center text-muted small mt-3">© {new Date().getFullYear()} FlexiTime</p>
        </div>
      </div>
    </div>
  );
}
