// src/components/KanbanColumn.js
import React from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ title, statusKey, tasks, onDropTask }) {
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const task = JSON.parse(raw);
    onDropTask(task, statusKey);
  };

  return (
    <div className="col-12 col-md-6 col-lg-3 mb-3">
      <div
        className="border rounded-3 p-2 h-100"
        onDragOver={onDragOver}
        onDrop={onDrop}
        aria-label={`Colonne ${title}`}
        style={{ minHeight: 200, background: 'var(--bs-body-bg)' }}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="m-0">{title}</h6>
          <span className="badge text-bg-light">{tasks.length}</span>
        </div>
        {tasks.length === 0 ? (
          <div className="text-muted small py-4 text-center">Aucune tâche</div>
        ) : (
          tasks.map((t) => (
            <KanbanCard
              key={t.id}
              task={t}
              onDragStart={(e, task) => e.dataTransfer.setData('application/json', JSON.stringify(task))}
              onClick={t.onClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
