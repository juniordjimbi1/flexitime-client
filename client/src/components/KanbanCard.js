// src/components/KanbanCard.js
import React, { useEffect, useState } from 'react';
import { listChecklist } from '../services/checklistApi';

export default function KanbanCard({ task, onDragStart, onClick }) {
  // 🔹 Hooks toujours en haut, jamais après un return conditionnel
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadChecklist() {
      if (!task?.id) return;
      try {
        const res = await listChecklist(task.id);
        const data = res.data?.data || res.data || [];
        const items = Array.isArray(data) ? data : data.items || [];
        if (!cancelled) {
          setChecklistItems(items);
        }
      } catch (e) {
        console.error('Erreur checklist sur carte', e);
        if (!cancelled) {
          setChecklistItems([]);
        }
      }
    }

    loadChecklist();
    return () => {
      cancelled = true;
    };
  }, [task?.id]);

  // 🔹 Maintenant seulement on peut faire le early-return
  if (!task) return null;

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const priorityVariant =
    task.priority === 'HIGH'
      ? 'danger'
      : task.priority === 'MEDIUM'
      ? 'warning'
      : task.priority === 'LOW'
      ? 'secondary'
      : 'secondary';

  const assignees = Array.isArray(task.assignees) ? task.assignees : [];

  const formatAssignee = (a) => {
    if (a.full_name) return a.full_name;
    if (a.email) return a.email;
    if (a.name) return a.name;
    return 'Inconnu';
  };

  return (
    <div
      className="card mb-2 shadow-sm"
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      aria-label={`Tâche ${task.title}`}
    >
      <div className="card-body p-2">
        {/* Titre + priorité */}
        <div className="d-flex justify-content-between align-items-start">
          <strong className="me-2 text-truncate" title={task.title}>
            {task.title}
          </strong>
          {task.priority && (
            <span className={`badge text-bg-${priorityVariant}`}>
              {task.priority}
            </span>
          )}
        </div>

        {/* Description courte */}
        {task.description && (
          <small
            className="text-muted d-block mt-1 text-truncate"
            title={task.description}
          >
            {task.description}
          </small>
        )}

        {/* Checklist : items visibles sur la carte */}
        {checklistItems.length > 0 && (
          <ul className="list-unstyled small mt-2 mb-0">
            {checklistItems.map((item) => (
              <li key={item.id} className="d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  checked={!!item.is_done}
                  readOnly
                />
                <span
                  className={
                    item.is_done
                      ? 'text-decoration-line-through text-muted'
                      : ''
                  }
                  title={item.content}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.content}
                </span>
                {item.is_private ? (
                  <span className="badge text-bg-dark ms-2">Privé</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {/* Échéance */}
        {task.due_date && (
          <small className="text-muted d-block mt-1">
            Échéance:{' '}
            {new Date(task.due_date).toLocaleDateString(undefined, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </small>
        )}

        {/* Assignés */}
        {assignees.length > 0 && (
          <div className="mt-2 d-flex flex-wrap align-items-center gap-1">
            {assignees.slice(0, 3).map((a) => (
              <span
                key={a.user_id || a.id || a.email}
                className="badge rounded-pill text-bg-light border text-muted"
              >
                {formatAssignee(a)}
              </span>
            ))}
            {assignees.length > 3 && (
              <span className="badge rounded-pill text-bg-light border text-muted">
                +{assignees.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
