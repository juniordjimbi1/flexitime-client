// client/src/pages/projects/ProjectBoard.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


import {
  getProject,
  listTasksByProject,
  updateTaskStatus,
  listMyTasks,
} from '../../services/projectsApi';

import TasksFilters from '../../components/tasks/TasksFilters';
import KanbanColumn from '../../components/KanbanColumn';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskDrawer from '../../components/tasks/TaskDrawer';
import ProjectMembersPanel from './ProjectMembersPanel';

const STATUSES = [
  { code: 'TODO', label: 'À faire' },
  { code: 'IN_PROGRESS', label: 'En cours' },
  { code: 'BLOCKED', label: 'Bloqué' },
  { code: 'DONE', label: 'Terminé' },
];

function groupByStatus(tasks) {
  const byStatus = {};
  STATUSES.forEach(({ code }) => {
    byStatus[code] = [];
  });

  for (const t of tasks || []) {
    const st = t.status || 'TODO';
    if (!byStatus[st]) byStatus[st] = [];
    byStatus[st].push(t);
  }
  return byStatus;
}

export default function ProjectBoard() {
  const { id } = useParams();
  const projectId = Number(id);

  const { user } = useAuth() || {};
const currentUserId = user?.id;

// On récupère le rôle sous toutes les formes possibles
let rawRole = '';

if (typeof user?.role_code === 'string') {
  rawRole = user.role_code;
} else if (typeof user?.role === 'string') {
  rawRole = user.role;
} else if (typeof user?.role?.code === 'string') {
  // cas où user.role est un objet { code: 'ADMIN', ... }
  rawRole = user.role.code;
}

const role = rawRole.toUpperCase();
const canManage = role === 'ADMIN' || role === 'MANAGER';
// L’employé ne crée pas de tâches
const canCreateTasks = canManage;


  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [errorProject, setErrorProject] = useState('');

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState('');

  const [filters, setFilters] = useState({
    statuses: [],
    due_from: '',
    due_to: '',
    assignees: '',
    labels: '',
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [drawerTask, setDrawerTask] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // --------- Chargement projet ---------
  useEffect(() => {
    let alive = true;
    async function run() {
      setLoadingProject(true);
      setErrorProject('');
      try {
        const res = await getProject(projectId);
        const data = res.data?.data || res.data || res;
        if (alive) setProject(data.project || data);
      } catch (e) {
        console.error(e);
        if (alive) setErrorProject('Impossible de charger le projet.');
      } finally {
        if (alive) setLoadingProject(false);
      }
    }
    if (projectId) run();
    return () => {
      alive = false;
    };
  }, [projectId]);

  // --------- Chargement tâches ---------
const loadTasks = React.useCallback(
  async (opts = {}) => {
    setLoadingTasks(true);
    setErrorTasks('');
    try {
      const payload = {
        ...filters,
        ...opts,
        project_id: projectId,
      };

      // Désormais, tous les rôles passent par /tasks?project_id=...
      const res = await listTasksByProject(projectId, payload);

      const data = res.data?.data || res.data || res;
      const arr = Array.isArray(data) ? data : data.tasks || [];
      setTasks(arr);
    } catch (e) {
      console.error(e);
      setErrorTasks('Impossible de charger les tâches.');
    } finally {
      setLoadingTasks(false);
    }
  },
  [projectId, filters]
);



  useEffect(() => {
    if (!projectId) return;
    loadTasks();
  }, [projectId, loadTasks]);

  // --------- Dérivés : mes tâches / tâches équipe ---------
  // --------- Dérivés : mes tâches / tâches équipe ---------
  const myTasks = useMemo(() => {
    if (!currentUserId) return [];
    return (tasks || []).filter((t) =>
      (t.assignees || []).some((a) => {
        const assignedId = a.user_id ?? a.id;
        return String(assignedId) === String(currentUserId);
      })
    );
  }, [tasks, currentUserId]);


const myTasksByStatus = useMemo(
  () => groupByStatus(myTasks || []),
  [myTasks]
);

const teamTasksByStatus = useMemo(() => {
  // IDs des tâches qui sont déjà dans "Mes tâches"
  const myIds = new Set((myTasks || []).map((t) => String(t.id)));

  // Tâches de l’équipe = toutes les tâches du projet
  // moins celles qui sont dans "Mes tâches"
  const teamList = (tasks || []).filter(
    (t) => !myIds.has(String(t.id))
  );

  return groupByStatus(teamList);
}, [tasks, myTasks]);



  // --------- Actions ---------
  const handleDropTask = async (task, newStatus) => {
    if (!task || task.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      await updateTaskStatus(task.id, newStatus);
      await loadTasks();
    } catch (e) {
      console.error(e);
      // le toast global gère déjà les erreurs via axios interceptor
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenTask = (task) => {
    setDrawerTask(task);
  };

  const handleTaskUpdated = () => {
    // callback venant du drawer ou du modal
    loadTasks();
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    loadTasks();
  };

  const handleFiltersChange = (next) => {
    setFilters(next || {});
  };

  // --------- Rendu ---------
  const title =
    project?.name || project?.title || `Projet #${projectId || ''}`;

  const endDateLabel = project?.end_date
    ? new Date(project.end_date).toLocaleDateString()
    : '';

  return (
    <div className="ft-page-centered">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-start align-items-md-center mb-3">
        <div>
          <h4 className="mb-1">
            {title}
            {project?.code && (
              <span className="text-muted ms-2">({project.code})</span>
            )}
          </h4>
          {endDateLabel && (
            <div className="text-muted small">
              Échéance du projet : {endDateLabel}
            </div>
          )}
          <div className="small mt-1">
            <Link to="/projects">← Retour à la liste des projets</Link>
          </div>
        </div>

        {canCreateTasks && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowTaskModal(true)}
          >
            Nouvelle tâche…
          </button>
        )}
      </div>

      {loadingProject && <div>Chargement du projet…</div>}
      {errorProject && (
        <div className="alert alert-danger">{errorProject}</div>
      )}

      {/* Filtres */}
      <div className="card mb-3">
        <div className="card-body">
          <TasksFilters
            value={filters}
            onChange={(v) => handleFiltersChange(v)}
          />
          <div className="mt-2 d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => loadTasks()}
              disabled={loadingTasks}
            >
              Filtrer
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setFilters({
                  statuses: [],
                  due_from: '',
                  due_to: '',
                  assignees: '',
                  labels: '',
                });
                loadTasks({
                  statuses: [],
                  due_from: '',
                  due_to: '',
                  assignees: '',
                  labels: '',
                });
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Deux blocs : Mes tâches / Tâches de l'équipe */}
      <div className="row">
        <div className="col-lg-9">
          {/* Bloc Mes tâches */}
          {currentUserId && (
            <section className="mb-4">
              <h5 className="mb-3">Mes tâches sur ce projet</h5>
              {myTasks.length === 0 && !loadingTasks ? (
                <div className="text-muted small">
                  Aucune tâche ne vous est assignée pour l’instant.
                </div>
              ) : null}
              <div className="row">
                {STATUSES.map(({ code, label }) => (
                  <KanbanColumn
                    key={`me-${code}`}
                    title={label}
                    statusKey={code}
                    tasks={(myTasksByStatus[code] || []).map((t) => ({
                      ...t,
                      onClick: () => handleOpenTask(t),
                    }))}
                    onDropTask={canManage ? handleDropTask : () => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Bloc Tâches de l'équipe */}
          {/* Bloc Tâches de l'équipe */}
{/* Bloc Tâches de l'équipe – visible pour tous, drag & drop seulement pour admin/manager */}
<section>
  <h5 className="mb-3">Tâches de l’équipe sur ce projet</h5>
  {tasks.length === 0 && !loadingTasks ? (
    <div className="text-muted small">
      Aucune tâche pour l’instant.
    </div>
  ) : null}
  <div className="row">
    {STATUSES.map(({ code, label }) => (
      <KanbanColumn
        key={`team-${code}`}
        title={label}
        statusKey={code}
        tasks={(teamTasksByStatus[code] || []).map((t) => ({
          ...t,
          onClick: () => handleOpenTask(t),
        }))}
        // EMPLOYÉ : lecture seule (pas de drag)
        onDropTask={canManage ? handleDropTask : undefined}
      />
    ))}
  </div>
</section>


        </div>

        {/* Panneau membres du projet */}
        <div className="col-lg-3">
          <ProjectMembersPanel
            projectId={projectId}
            canManage={canManage}
          />
        </div>
      </div>

      {loadingTasks && (
        <div className="mt-3 text-muted small">Chargement des tâches…</div>
      )}
      {errorTasks && (
        <div className="mt-3 alert alert-danger">{errorTasks}</div>
      )}
      {updatingStatus && (
        <div className="mt-2 small text-muted">
          Mise à jour du statut…
        </div>
      )}

      {/* Modal création */}
      {showTaskModal && canCreateTasks && (
        <TaskFormModal
          projectId={projectId}
          show={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* Drawer détail tâche */}
      {drawerTask && (
        <TaskDrawer
          task={drawerTask}
          onClose={() => setDrawerTask(null)}
          onUpdated={handleTaskUpdated}
          onEdit={() => {
            // pour plus tard si tu veux réutiliser le même modal en édition
          }}
        />
      )}
    </div>
  );
}
