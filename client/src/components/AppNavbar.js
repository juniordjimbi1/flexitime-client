// client/src/components/AppNavbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/Logo';
import ProjectFilterGlobal from './ProjectFilterGlobal';
import '../styles/theme.css';
import NotificationsBell from './NotificationsBell';
import useDarkMode from '../hooks/useDarkMode';

function initials(u) {
  const a = (u?.first_name || '').trim()[0] || '';
  const b = (u?.last_name || '').trim()[0] || '';
  return (a + b || (u?.email?.[0] || '?')).toUpperCase();
}

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.code;
  const { isDark, toggle } = useDarkMode();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" aria-label="Accueil">
          <Logo size={22} />
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Basculer la navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="nav">
          {/* Gauche */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Accueil</Link>
            </li>

            {/* Projets */}
            {user && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Projets
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/projects">Liste &amp; Kanban</Link></li>
                </ul>
              </li>
            )}

            {/* Manager */}
            {(role === 'MANAGER' || role === 'ADMIN') && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Chef d’équipe
                </a>
                <ul className="dropdown-menu">
                  <li className="dropdown-header">Planification</li>
                  <li><Link className="dropdown-item" to="/manager/plan">Programmation</Link></li>
                  <li><Link className="dropdown-item" to="/manager/backlog-planner">Backlog Planner</Link></li>
                  <li><Link className="dropdown-item" to="/manager/plans">Calendrier Backlog</Link></li>

                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-header">Opérations</li>
                  <li><Link className="dropdown-item" to="/manager/quick-tasks">Tâches rapides</Link></li>
                  <li><Link className="dropdown-item" to="/manager/team-members">Membres de l’équipe</Link></li>
                  <li><Link className="dropdown-item" to="/manager/team-final-close">Clôture d’équipe</Link></li>

                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-header">Suivi</li>
                  <li><Link className="dropdown-item" to="/manager/validations">Validations</Link></li>
                  <li><Link className="dropdown-item" to="/manager/kpis">KPIs</Link></li>
                </ul>
              </li>
            )}

            {/* Admin */}
            {role === 'ADMIN' && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Administration
                </a>
                <ul className="dropdown-menu">
                  <li className="dropdown-header">Organisation</li>
                  <li><Link className="dropdown-item" to="/admin/org">Organisation</Link></li>
                  <li><Link className="dropdown-item" to="/admin/teams/new">Créer équipe</Link></li>
                  <li><Link className="dropdown-item" to="/admin/employees">Employés</Link></li>
                  <li><Link className="dropdown-item" to="/admin/users">Comptes</Link></li>

                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-header">Tâches &amp; Labels</li>
                  <li><Link className="dropdown-item" to="/admin/quick-tasks">Tâches rapides</Link></li>
                  <li><Link className="dropdown-item" to="/admin/labels">Labels</Link></li>

                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-header">Conformité &amp; Suivi</li>
                  <li><Link className="dropdown-item" to="/admin/gdpr">GDPR Delete</Link></li>
                  <li><Link className="dropdown-item" to="/admin/validations">Validations</Link></li>
                  <li><Link className="dropdown-item" to="/admin/team-validations">Validations d’équipe</Link></li>
                  <li><Link className="dropdown-item" to="/admin/kpis">KPIs</Link></li>
                </ul>
              </li>
            )}

            {/* Employé */}
            {role === 'EMPLOYEE' && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Employé
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/employee">Tableau de bord</Link></li>
                  <li><Link className="dropdown-item" to="/employee/history">Historique</Link></li>
                </ul>
              </li>
            )}

            {/* A propos */}
            <li className="nav-item">
              <Link className="nav-link" to="/about">À propos</Link>
            </li>
          </ul>

          {/* Droite : filtre + cloche + compte */}
          <ul className="navbar-nav ms-auto align-items-center gap-2">

            {user && (
              <li className="nav-item d-none d-lg-block">
                <ProjectFilterGlobal />
              </li>
            )}

            {user && (
              <li className="nav-item">
                <NotificationsBell />
              </li>
            )}

            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-light rounded-circle"
                  style={{ width:36, height:36, padding:0 }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Menu utilisateur"
                >
                  <span className="d-inline-block w-100 h-100 d-flex align-items-center justify-content-center fw-bold">
                    {initials(user)}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="px-3 py-2">
                    <div className="fw-semibold">{user.first_name} {user.last_name}</div>
                    <div className="small text-muted">{user.email}</div>
                    <div><span className="badge bg-light text-dark mt-1">{user.role.code}</span></div>
                  </li>

                  {/* Toggle Dark/Light */}
                  <li><hr className="dropdown-divider" /></li>
                  <li className="px-3 py-2 d-flex align-items-center justify-content-between">
                    <span>Apparence</span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={toggle}
                      aria-label="Basculer le thème clair/sombre"
                      title="Basculer le thème clair/sombre"
                    >
                      {isDark ? '🌙 Sombre' : '☀️ Clair'}
                    </button>
                  </li>

                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={()=>navigate('/profile')}>Profil</button></li>
                  <li><button className="dropdown-item" onClick={()=>navigate('/profile?tab=settings')}>Paramètres</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={logout}>Se déconnecter</button></li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm" to="/login">Connexion</Link>
                </li>
                <li className="nav-item d-none d-md-block">
                  <Link className="btn btn-outline-light btn-sm" to="/signup">Créer un compte</Link>
                </li>
                <li className="nav-item d-none d-lg-block">
                  <Link className="btn btn-outline-warning btn-sm" to="/admin/login">Espace Admin</Link>
                </li>
              </>
            )}
          </ul>

          {user && (
            <div className="w-100 mt-2 d-lg-none">
              <ProjectFilterGlobal />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
