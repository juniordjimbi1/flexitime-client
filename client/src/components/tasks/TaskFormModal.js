// client/src/components/tasks/TaskFormModal.js
import React, { useEffect, useState } from 'react';
import {
  createTaskForProject,
  listEligibleMembers,
  setTaskAssignees,
} from '../../services/projectsApi';

const PRIORITY_OPTIONS = [
  { v: 'LOW', label: 'Basse' },
  { v: 'MEDIUM', label: 'Moyenne' },
  { v: 'HIGH', label: 'Haute' },
];

export default function TaskFormModal({
  projectId,
  show = true,
  onClose,
  onCreated,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!projectId) return;
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // reset quand on ouvre/ferme
  useEffect(() => {
    if (!show) return;
    setError('');
    setSuccessMsg('');
  }, [show]);

  if (!show) return null;

  async function loadMembers() {
    setLoadingMembers(true);
    setError('');
    try {
      const { data } = await listEligibleMembers(projectId);
      const list = data.data || data || [];
      setMembers(list);
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          "Impossible de charger la liste des collaborateurs"
      );
    } finally {
      setLoadingMembers(false);
    }
  }

  const toggleAssignee = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const resetFormFields = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    // priorité et assignés restent identiques pour enchaîner
  };

  async function handleSubmit(stayOpen) {
    if (!title.trim()) {
      setError('Le titre de la tâche est obligatoire.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
      };

      const { data } = await createTaskForProject(projectId, payload);
      const created = data.data || data;

      let assignedCount = 0;
      if (selectedIds.length > 0) {
        try {
          await setTaskAssignees(created.id, selectedIds);
          assignedCount = selectedIds.length;
        } catch (eAssign) {
          console.error(eAssign);
          // on n'annule pas la création, on signale seulement
          setError(
            eAssign?.response?.data?.message ||
              "La tâche a été créée mais l'assignation a échoué."
          );
        }
      }

      if (assignedCount > 0) {
        setSuccessMsg(
          `Tâche créée et assignée à ${assignedCount} collaborateur(s).`
        );
      } else {
        setSuccessMsg('Tâche créée pour aucun collaborateur (non assignée).');
      }

      onCreated && onCreated(created);

      if (stayOpen) {
        // on garde les assignés et la priorité pour enchaîner
        resetFormFields();
      } else {
        onClose && onClose();
      }
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          "Impossible de créer la tâche. Vérifiez les champs."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nouvelle mission / tâche</h5>
            <button type="button" className="btn-close" onClick={handleClose} />
          </div>
          <div className="modal-body">
            {successMsg && (
              <div className="alert alert-success py-2 mb-3">{successMsg}</div>
            )}
            {error && (
              <div className="alert alert-danger py-2 mb-3">{error}</div>
            )}

            <div className="mb-3">
              <label className="form-label">Titre de la tâche</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : faire la front-end"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description (optionnelle)</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails, contexte, liens..."
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Priorité</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.v} value={p.v}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Échéance (optionnelle)</label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label">Assigner à</label>
              {loadingMembers ? (
                <div className="text-muted small">Chargement des membres…</div>
              ) : members.length === 0 ? (
                <div className="alert alert-light mb-0">
                  Aucun collaborateur éligible pour ce projet.
                </div>
              ) : (
                <div
                  className="border rounded p-2"
                  style={{ maxHeight: 210, overflowY: 'auto' }}
                >
                  {members.map((m) => {
                    const id = m.user_id || m.id;
                    const fullName =
                      m.full_name ||
                      `${m.first_name || ''} ${m.last_name || ''}`.trim() ||
                      `Utilisateur #${id}`;
                    const selected = selectedIds.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        // client/src/components/tasks/TaskFormModal.js

className={`w-100 text-start mb-1 btn btn-sm ${
  selected ? 'btn-primary' : 'btn-outline-secondary'
}`}

                        onClick={() => toggleAssignee(id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{fullName}</span>
                          {selected && (
                            <span className="badge bg-light text-dark">
                              Assigné
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="form-text mt-1">
                👉 Clique simplement sur le nom pour l’ajouter / retirer des
                assignés.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              Fermer
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Créer et continuer'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Créer et fermer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
