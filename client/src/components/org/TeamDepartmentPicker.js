// client/src/components/org/TeamDepartmentPicker.js
import React from 'react';
import orgApi from '../../services/orgApi';
import { useAuth } from '../../context/AuthContext';

/**
 * Props:
 *  - value: { departmentId, teamId }
 *  - onChange: (next) => void
 *  - disabled?: boolean
 *  - className?: string
 *
 * Affiche deux selects:
 *  - Département: charge via /departments
 *  - Équipe: charge via /teams?departmentId=...
 * RBAC: l'API retourne déjà la portée autorisée (MANAGER: ses équipes).
 */
export default function TeamDepartmentPicker({ value, onChange, disabled, className }) {
  const { user } = useAuth();
  const [deps, setDeps] = React.useState([]);
  const [teams, setTeams] = React.useState([]);
  const [loadingDeps, setLoadingDeps] = React.useState(true);
  const [loadingTeams, setLoadingTeams] = React.useState(false);
  const [err, setErr] = React.useState('');

  const departmentId = value?.departmentId || '';
  const teamId = value?.teamId || '';

  // Charger départements accessibles
  React.useEffect(() => {
    let mounted = true;
    setLoadingDeps(true); setErr('');
    orgApi.listDepartments()
      .then(r => {
        if (!mounted) return;
        setDeps(r?.data?.data || r?.data || []);
      })
      .catch(e => setErr(e?.response?.data?.message || 'Erreur départements'))
      .finally(() => setLoadingDeps(false));
    return () => { mounted = false; };
  }, []);

  // Charger équipes filtrées par département
  React.useEffect(() => {
    let mounted = true;
    if (!departmentId) { setTeams([]); return; }
    setLoadingTeams(true); setErr('');
    orgApi.listTeams({ departmentId })
      .then(r => {
        if (!mounted) return;
        setTeams(r?.data?.data || r?.data || []);
      })
      .catch(e => setErr(e?.response?.data?.message || 'Erreur équipes'))
      .finally(() => setLoadingTeams(false));
    return () => { mounted = false; };
  }, [departmentId]);

  return (
    <div className={className}>
      <div className="row g-2">
        <div className="col-12 col-md-6">
          <label className="form-label">Département</label>
          <select
            className="form-select"
            disabled={disabled || loadingDeps}
            value={departmentId}
            onChange={e => {
              const nextDep = e.target.value;
              onChange({ departmentId: nextDep, teamId: '' }); // reset team lorsque le dep change
            }}
          >
            <option value="">Tous</option>
            {deps.map(d => (
              <option key={d.id} value={d.id}>{d.name || `#${d.id}`}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Équipe</label>
          <select
            className="form-select"
            disabled={disabled || loadingTeams || !departmentId}
            value={teamId}
            onChange={e => onChange({ departmentId, teamId: e.target.value })}
          >
            <option value="">Toutes</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>
                {t.name ? t.name : `Équipe #${t.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err ? <div className="text-danger mt-2">{err}</div> : null}
    </div>
  );
}
