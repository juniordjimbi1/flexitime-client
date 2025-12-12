// client/src/components/tasks/TasksFilters.js
import React, { useState } from 'react';

export default function TasksFilters({ value, onChange, compact }) {
  const [local, setLocal] = useState(() => ({
    statuses: value?.statuses || [],
    due_from: value?.due_from || '',
    due_to: value?.due_to || '',
    assignees: value?.assignees || '', // csv
    labels: value?.labels || ''        // csv
  }));

  const toggleStatus = (s) => {
    setLocal(prev => {
      const has = prev.statuses.includes(s);
      const statuses = has ? prev.statuses.filter(x => x!==s) : [...prev.statuses, s];
      return { ...prev, statuses };
    });
  };

  const submit = (e) => {
    e?.preventDefault?.();
    onChange && onChange(local);
  };

  const clear = () => {
    const empty = { statuses: [], due_from:'', due_to:'', assignees:'', labels:'' };
    setLocal(empty);
    onChange && onChange(empty);
  };

  return (
    <form className={`row g-2 ${compact ? 'align-items-center' : 'align-items-end'}`} onSubmit={submit}>
      <div className={compact ? 'col-12' : 'col-12'}>
        <div className="d-flex flex-wrap gap-2">
          {['TODO','IN_PROGRESS','BLOCKED','DONE'].map(s => (
            <div className="form-check form-check-inline" key={s}>
              <input className="form-check-input" type="checkbox" id={`st-${s}`}
                     checked={local.statuses.includes(s)} onChange={()=>toggleStatus(s)} />
              <label className="form-check-label" htmlFor={`st-${s}`}>{s}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="col-sm-3">
        <label className="form-label">Échéance min</label>
        <input type="date" className="form-control" value={local.due_from} onChange={e=>setLocal({...local, due_from:e.target.value})} />
      </div>
      <div className="col-sm-3">
        <label className="form-label">Échéance max</label>
        <input type="date" className="form-control" value={local.due_to} onChange={e=>setLocal({...local, due_to:e.target.value})} />
      </div>
      <div className="col-sm-3">
        <label className="form-label">Assignés (ids CSV)</label>
        <input className="form-control" placeholder="ex: 12,18"
               value={local.assignees} onChange={e=>setLocal({...local, assignees:e.target.value})} />
      </div>
      <div className="col-sm-3">
        <label className="form-label">Labels (ids CSV)</label>
        <input className="form-control" placeholder="ex: 2,5"
               value={local.labels} onChange={e=>setLocal({...local, labels:e.target.value})} />
      </div>

      <div className="col-12">
        <button className="btn btn-primary me-2">Filtrer</button>
        <button type="button" className="btn btn-outline-secondary" onClick={clear}>Réinitialiser</button>
      </div>
    </form>
  );
}
