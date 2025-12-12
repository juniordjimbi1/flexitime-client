import React from 'react';
import Logo from '../assets/Logo';

function Bullet({ title, items, tone='light' }) {
  const toneClass = tone === 'warning' ? 'bg-warning-subtle' : tone === 'success' ? 'bg-success-subtle' : 'bg-light';
  return (
    <div className={`p-4 border rounded ${toneClass} h-100`}>
      <h5 className="fw-bold mb-3">{title}</h5>
      <ul className="mb-0">
        {items.map((it, i) => <li key={i} className="mb-1">{it}</li>)}
      </ul>
    </div>
  );
}

export default function AboutPitchPage() {
  return (
    <div className="container py-4">
      {/* HERO */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Logo size={28} />
            <span className="badge bg-primary">Projet de soutenance</span>
          </div>
          <h1 className="fw-bold mb-2">Du présentéisme à la performance</h1>
          <p className="text-muted lead mb-0">
            FlexiTime est une application web de <strong>gestion flexible du temps de travail</strong> :
            tâches centrées sur les résultats, sessions de travail <em>start/stop</em>, et <strong>clôture de journée</strong> transparente.
          </p>
        </div>
      </div>

      {/* 3 bullets : Problème / Solution / Bénéfices */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <Bullet
            title="Problème"
            tone="light"
            items={[
              'Journées figées (7h–18h) même lorsque les tâches sont terminées.',
              'Présentéisme → perte de motivation, stress, coûts cachés.',
              'Manque de visibilité sur la valeur créée vs. heures passées.'
            ]}
          />
        </div>
        <div className="col-lg-4">
          <Bullet
            title="Solution"
            tone="warning"
            items={[
              'Portails séparés : Admin, Manager, Employé (RBAC strict).',
              'Tâches par équipe, assignations ciblées, statuts TODO/IN PROGRESS/DONE.',
              'Sessions de travail (start/stop) + Clôture quotidienne synthétique.'
            ]}
          />
        </div>
        <div className="col-lg-4">
          <Bullet
            title="Bénéfices"
            tone="success"
            items={[
              'Productivité ↑ : focus sur l’exécution, pas sur la présence.',
              'Qualité de vie ↑ : flexibilité, moins de stress.',
              'Pilotage ↑ : KPIs (temps, tâches, clôtures) par équipe/manager.'
            ]}
          />
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="card-title mb-3">Comment ça marche ?</h5>
          <ol className="mb-0">
            <li className="mb-2"><strong>Employés</strong> : s’inscrivent et se connectent, rejoignent une équipe, reçoivent des tâches.</li>
            <li className="mb-2"><strong>Managers</strong> : créent/assignent des tâches aux membres de leurs équipes, suivent l’avancement.</li>
            <li className="mb-2"><strong>Employés</strong> : lancent/arrêtent des <em>sessions</em>, clôturent leur journée (récap minutes + tâches DONE).</li>
            <li className="mb-2"><strong>Admin/Managers</strong> : consultent les <strong>KPIs</strong> (temps par équipe, tâches par statut, clôtures).</li>
          </ol>
        </div>
      </div>

      {/* Points forts */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="p-3 border rounded bg-light h-100">
            <div className="text-muted small">Accès</div>
            <div className="fw-semibold">Portails séparés</div>
            <div className="small text-muted">/login, /signup, /admin/login</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 border rounded bg-light h-100">
            <div className="text-muted small">Tâches</div>
            <div className="fw-semibold">Assignations par équipe</div>
            <div className="small text-muted">Statuts en 1 clic</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 border rounded bg-light h-100">
            <div className="text-muted small">Temps</div>
            <div className="fw-semibold">Sessions & Clôture</div>
            <div className="small text-muted">Récap de la journée</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 border rounded bg-light h-100">
            <div className="text-muted small">Pilotage</div>
            <div className="fw-semibold">KPIs</div>
            <div className="small text-muted">Admin & Managers</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card shadow-sm">
        <div className="card-body p-4 d-flex flex-wrap gap-2 align-items-center">
          <div className="me-auto">
            <h5 className="mb-1 fw-bold">Envie de voir la démo ?</h5>
            <div className="text-muted small">Crée un compte employé ou connecte-toi avec les identifiants de démo.</div>
          </div>
          <a className="btn btn-primary" href="/signup">Créer un compte</a>
          <a className="btn btn-outline-primary" href="/login">Se connecter</a>
          <a className="btn btn-outline-warning" href="/admin/login">Espace Admin</a>
        </div>
      </div>
    </div>
  );
}
