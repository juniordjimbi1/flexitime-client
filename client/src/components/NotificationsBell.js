// client/src/components/NotificationsBell.js
import React, { useEffect, useRef, useState } from 'react';
import { listNotifications, markRead } from '../api/notifications';

const POLL_MS = 15000; // 15s

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [unread, setUnread] = useState(0);
  const timer = useRef(null);

  const load = async (onlyUnread = true) => {
    try {
      const { data } = await listNotifications({ only_unread: onlyUnread ? '1' : '0', limit: 10 });
      const arr = data?.data || [];
      setRows(arr);
      setUnread(arr.filter(x => !x.is_read).length);
    } catch (e) {
      // silencieux
    }
  };

  const start = () => {
    stop();
    timer.current = setInterval(() => load(true), POLL_MS);
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    load(true);
    start();
    return stop;
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await load(false);
  };

  const onMarkAllRead = async () => {
    const ids = rows.filter(x => !x.is_read).map(x => x.id);
    if (!ids.length) return;
    try {
      await markRead(ids);
      await load(false);
    } catch (e) {}
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-sm btn-outline-light position-relative"
        onClick={toggle}
        data-bs-toggle="dropdown"
        aria-expanded={open ? 'true' : 'false'}
      >
        🔔
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <div className="dropdown-menu dropdown-menu-end p-0 show" style={{ display: open ? 'block' : 'none', minWidth: 360 }}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <strong>Notifications</strong>
          <button className="btn btn-sm btn-link" onClick={onMarkAllRead}>Tout marquer lu</button>
        </div>

        {rows.length === 0 ? (
          <div className="px-3 py-3 text-muted">Aucune notification</div>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {rows.map(n => (
              <div key={n.id} className={`px-3 py-2 ${n.is_read ? 'bg-white' : 'bg-light'}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold">{n.title}</div>
                    {n.body ? <div className="small text-muted">{n.body}</div> : null}
                    <div className="small text-muted">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {n.link ? (
                    <a className="btn btn-sm btn-outline-primary ms-2" href={n.link}>Ouvrir</a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
