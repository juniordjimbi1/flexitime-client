import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">Dashboard Admin</h2>
      <p className="text-muted">Bienvenue, {user.first_name}. Gérez l’organisation (départements, sous-départements, équipes, utilisateurs).</p>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Utilisateurs</h5>
              <p className="card-text">Créer des comptes (Admin only), activer/désactiver.</p>
              <button className="btn btn-outline-primary w-100" disabled>Ouvrir (à venir)</button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Départements & Équipes</h5>
              <p className="card-text">Structurer l’organisation.</p>
              <Link className="btn btn-primary w-100" to="/admin/org">Ouvrir</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">KPIs</h5>
              <p className="card-text">Vue d’ensemble des performances.</p>
              <button className="btn btn-outline-primary w-100" disabled>Ouvrir (à venir)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
