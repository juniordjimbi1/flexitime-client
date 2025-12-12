import React, { useEffect, useState } from 'react';
import api from '../api/axios';

function pad(n){return n<10?('0'+n):''+n;}
function ymd(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function daysAgo(n){const d=new Date(); d.setDate(d.getDate()-n); return ymd(d);}
function fmtMins(m){const n=Number(m||0); const h=Math.floor(n/60); const mm=n%60; return h?`${h} h ${mm} min`:`${mm} min`; }

export default function ManagerKpisPage() {
  const [from, setFrom] = useState(daysAgo(14));
  const [to, setTo] = useState(ymd(new Date()));
  const [ov, setOv] = useState(null);
  const [timeTeams, setTimeTeams] = useState([]);
  const [tasksTeams, setTasksTeams] = useState([]);
  const [closesUsers, setClosesUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const [o, t, s, c] = await Promise.all([
        api.get('/reports/overview', { params: { from, to } }),
        api.get('/reports/time-by-team', { params: { from, to } }),
        api.get('/reports/tasks-stats', { params: { from, to } }),
        api.get('/reports/day-closes', { params: { from, to } }),
      ]);
      setOv(o.data.data);
      setTimeTeams(t.data.data.rows);
      setTasksTeams(s.data.data.rows);
      setClosesUsers(c.data.data.rows);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-3">KPIs — Chef d’équipe</h2>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={(e)=>{e.preventDefault(); load();}}>
            <div className="col-md-3">
              <label className="form-label">Du</label>
              <input type="date" className="form-control" value={from} onChange={(e)=>setFrom(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Au</label>
              <input type="date" className="form-control" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" disabled={loading}>Actualiser</button>
            </div>
            {err && <div className="col-12"><div className="alert alert-danger py-2">{err}</div></div>}
          </form>
        </div>
      </div>

      {ov && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="p-3 border rounded bg-light h-100">
              <div className="text-muted small">Période</div>
              <div className="fw-bold fs-6">{ov.range.from} → {ov.range.to}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 border rounded bg-light h-100">
              <div className="text-muted small">Temps cumulé (équipe)</div>
              <div className="fw-bold fs-5">{fmtMins(ov.sessions.total_minutes)}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 border rounded bg-light h-100">
              <div className="text-muted small">Tâches</div>
              <div className="fw-bold fs-6">DONE {ov.tasks.done}</div>
              <div className="text-muted small">TODO {ov.tasks.todo} · IN PROGRESS {ov.tasks.in_progress}</div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Temps par équipe (tes équipes)</h5>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead><tr><th>Équipe</th><th>Temps</th></tr></thead>
                  <tbody>
                    {timeTeams.map(r=>(
                      <tr key={r.team_id}>
                        <td>{r.department_name} / {r.subdep_name} / <strong>{r.team_name}</strong></td>
                        <td>{fmtMins(r.minutes)}</td>
                      </tr>
                    ))}
                    {!timeTeams.length && <tr><td colSpan="2" className="text-muted">Aucune donnée</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Tâches par statut</h5>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead><tr><th>Équipe</th><th>TODO</th><th>IN PROGRESS</th><th>DONE</th></tr></thead>
                  <tbody>
                    {tasksTeams.map(r=>(
                      <tr key={r.team_id}>
                        <td>{r.department_name} / {r.subdep_name} / <strong>{r.team_name}</strong></td>
                        <td>{r.todo || 0}</td>
                        <td>{r.in_progress || 0}</td>
                        <td>{r.done || 0}</td>
                      </tr>
                    ))}
                    {!tasksTeams.length && <tr><td colSpan="4" className="text-muted">Aucune donnée</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Clôtures (employés de tes équipes)</h5>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead><tr><th>Employé</th><th>Équipes</th><th>Clôtures</th><th>Temps total</th></tr></thead>
                  <tbody>
                    {closesUsers.map(u=>(
                      <tr key={u.user_id}>
                        <td>{u.first_name} {u.last_name} — {u.email}</td>
                        <td className="small">{u.teams || <span className="text-muted">—</span>}</td>
                        <td>{u.closes}</td>
                        <td>{fmtMins(u.minutes)}</td>
                      </tr>
                    ))}
                    {!closesUsers.length && <tr><td colSpan="4" className="text-muted">Aucune donnée</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
