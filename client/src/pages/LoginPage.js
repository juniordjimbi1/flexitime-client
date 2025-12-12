import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, setError, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await login(email, password);
      if (u.role.code === 'ADMIN') {
        // Si un admin débarque ici, on l’envoie dans l’espace admin
        window.location.href = '/admin';
      } else if (u.role.code === 'MANAGER') {
        window.location.href = '/manager';
      } else {
        window.location.href = '/employee';
      }
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
              <h1 className="h4 fw-bold mb-1">Connexion (Employés)</h1>
              <p className="text-muted mb-4">Accédez à votre espace pour gérer vos tâches et votre temps.</p>

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
                <button className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>

              <div className="text-center small mt-3">
                Pas de compte ? <a href="/signup">Créer un compte</a>
              </div>
            </div>
          </div>
          <p className="text-center text-muted small mt-3">© {new Date().getFullYear()} FlexiTime</p>
        </div>
      </div>
    </div>
  );
}
