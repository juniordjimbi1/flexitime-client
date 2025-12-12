// client/src/pages/projects/ProjectMembersPanel.js
import React, { useEffect, useState } from 'react';
import {
  listProjectMembers,
  removeProjectMember,
  addMembersBatch
} from '../../services/projectsApi';
import PeoplePickerModal from '../../components/people/PeoplePickerModal';

export default function ProjectMembersPanel({ projectId, canManage }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchMembers() {
    setLoading(true);
    setErr('');
    try {
      const { data } = await listProjectMembers(projectId);
      setRows(data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function onRemove(uid) {
    if (!window.confirm('Retirer ce membre du projet ?')) return;
    try {
      await removeProjectMember(projectId, uid);
      await fetchMembers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Suppression impossible');
    }
  }

  async function onBatchAdd(userIds) {
    try {
      setSaving(true);
      await addMembersBatch(projectId, userIds);
      setPickerOpen(false);
      await fetchMembers();
    } catch (e) {
      alert(e?.response?.data?.message || 'Ajout impossible (vérifiez vos droits et équipes)');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <span>Membres du projet</span>
        {canManage && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setPickerOpen(true)}
            disabled={saving}
          >
            + Ajouter des membres
          </button>
        )}
      </div>

      <div className="card-body">
        {loading ? (
          <div className="text-muted">Chargement…</div>
        ) : err ? (
          <div className="alert alert-danger">{err}</div>
        ) : rows.length === 0 ? (
          <div className="alert alert-light mb-0">Aucun membre.</div>
        ) : (
          <ul className="list-group mb-0">
            {rows.map((m) => (
              <li
                key={m.user_id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{m.user_name || `${m.first_name || ''} ${m.last_name || ''}`.trim()}</strong>
                  {' '}
                  <span className="badge text-bg-light ms-2">
                    {m.role || m.member_role || 'MEMBER'}
                  </span>
                  {m.email ? <span className="text-muted small ms-2">{m.email}</span> : null}
                </div>
                {canManage && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onRemove(m.user_id)}
                  >
                    Retirer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modale People Picker */}
      <PeoplePickerModal
        show={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Ajouter des membres au projet"
        onConfirm={onBatchAdd}
      />
    </div>
  );
}
