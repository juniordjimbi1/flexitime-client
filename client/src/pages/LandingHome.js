import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo';

export default function LandingHome() {
  return (
    <div className="container py-5">
      <div className="row align-items-center g-4">
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Logo size={36} />
            <span className="badge bg-primary">Gestion flexible du temps</span>
          </div>
          <h1 className="fw-bold display-6">Du présentéisme à la performance</h1>
          <p className="lead text-muted">
            FlexiTime replace les heures figées par une logique <strong>centrée résultats</strong> :
            tâches, sessions start/stop, clôture quotidienne et KPIs pour piloter.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary btn-lg" to="/signup">Créer un compte</Link>
            <Link className="btn btn-outline-primary btn-lg" to="/login">Se connecter</Link>
            <Link className="btn btn-outline-warning btn-lg" to="/admin/login">Espace Admin</Link>
          </div>
          <div className="row g-3 mt-4">
            <div className="col-md-4">
              <div className="p-3 border rounded bg-light h-100">
                <div className="text-muted small">Employés</div>
                <div className="fw-semibold">Sessions & Clôture</div>
                <div className="small text-muted">Focus exécution</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded bg-light h-100">
                <div className="text-muted small">Managers</div>
                <div className="fw-semibold">Tâches & KPIs</div>
                <div className="small text-muted">Pilotage d’équipe</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 border rounded bg-light h-100">
                <div className="text-muted small">Admin</div>
                <div className="fw-semibold">Organisation</div>
                <div className="small text-muted">Départements & équipes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-2">Pourquoi FlexiTime ?</h5>
              <ul className="mb-0">
                <li>Réduit le présentéisme et le stress.</li>
                <li>Mesure le <strong>temps utile</strong>, pas la présence.</li>
                <li>Donne de la <strong>flexibilité</strong> aux collaborateurs.</li>
              </ul>
            </div>
          </div>
          <div className="text-muted small mt-2">Besoin d’un aperçu ? <Link to="/about">Voir la page “À propos”</Link>.</div>
        </div>
      </div>
    </div>
  );
}
