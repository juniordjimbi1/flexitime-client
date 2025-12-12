// client/src/components/ProjectFilterGlobal.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ProjectFilterGlobal() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(() => {
    const s = localStorage.getItem('ft_project_filter');
    return s ? Number(s) : null;
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects'); // listing simple
      setRows(data?.data || data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (open && rows.length === 0) fetchProjects();
  }, [open]); // eslint-disable-line

  const selectProject = (idOrNull) => {
    if (idOrNull) {
      localStorage.setItem('ft_project_filter', String(idOrNull));
      setActive(Number(idOrNull));
    } else {
      localStorage.removeItem('ft_project_filter');
      setActive(null);
    }
    // notifier les pages d’éventuels refreshs
    window.dispatchEvent(new Event('ft_project_filter_changed'));
    // petite UX: fermer le menu
    setOpen(false);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm btn-outline-light"
        onClick={()=>setOpen(v=>!v)}
        data-bs-toggle="dropdown"
        aria-expanded={open ? 'true' : 'false'}
      >
        {active ? <>Projet #{active}</> : <>Filtre projet</>}
      </button>
      <ul className="dropdown-menu dropdown-menu-end show" style={{ display: open ? 'block' : 'none' }}>
        <li><button className="dropdown-item" onClick={()=>selectProject(null)}>— Tous les projets</button></li>
        <li><hr className="dropdown-divider" /></li>
        {loading ? (
          <li className="px-3 py-2 text-muted small">Chargement…</li>
        ) : rows.length === 0 ? (
          <li className="px-3 py-2 text-muted small">Aucun projet</li>
        ) : rows.map(p => (
          <li key={p.id}>
            <button className="dropdown-item" onClick={()=>selectProject(p.id)}>
              #{p.id} — {p.name}{p.code ? ` (${p.code})` : ''}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
