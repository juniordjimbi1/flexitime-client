// client/src/pages/admin/GDPRDelete.js
import React, { useState } from 'react';
import { previewGDPR, executeGDPR } from '../../api/gdpr';

export default function GDPRDelete() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [impacts, setImpacts] = useState(null);
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');

  const onPreview = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true); setMsg('');
    try {
      const { data } = await previewGDPR(Number(userId));
      setImpacts(data?.data || null);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || 'Erreur');
      setImpacts(null);
    } finally { setLoading(false); }
  };

  const onExecute = async () => {
    if (!impacts) return;
    if (!window.confirm("Confirmer la suppression/anonymisation ? Cette action est irréversible.")) return;
    setLoading(true); setMsg('');
    try {
      const { data } = await executeGDPR(Number(userId), note);
      setMsg(`OK — tâches réaffectées: ${data?.data?.tasks_reassigned || 0}, fichiers supprimés: ${data?.data?.files_removed || 0}`);
      setImpacts(null);
      setUserId('');
      setNote('');
    } catch (e2) {
      setMsg(e2?.response?.data?.message || 'Erreur exécution');
    } finally { setLoading(false); }
  };

  return (
    <div className="container py-3">
      <h4>GDPR — Effacement d’un utilisateur</h4>

      <div className="card mb-3">
        <div className="card-body">
          <form className="row g-2 align-items-end" onSubmit={onPreview}>
            <div className="col-sm-3">
              <label className="form-label">ID utilisateur</label>
              <input className="form-control" value={userId} onChange={e=>setUserId(e.target.value)} required />
            </div>
            <div className="col-sm-6">
              <label className="form-label">Note (journal)</label>
              <input className="form-control" value={note} onChange={e=>setNote(e.target.value)} placeholder="Contexte / ticket / demande" />
            </div>
            <div className="col-sm-3">
              <button className="btn btn-primary w-100">Prévisualiser</button>
            </div>
          </form>
          {msg && <div className="text-muted mt-2">{msg}</div>}
        </div>
      </div>

      {loading && <div className="alert alert-info">Traitement…</div>}

      {impacts && (
        <div className="card">
          <div className="card-header">Aperçu</div>
          <div className="card-body">
            <div className="mb-2"><strong>Tâches créées par cet utilisateur :</strong> {impacts.tasks_created}</div>
            <div className="mb-2"><strong>Fichiers candidats à la purge :</strong> {impacts.file_candidates?.length || 0}</div>
            {impacts.file_candidates?.length ? (
              <div className="small text-muted" style={{ maxHeight: 160, overflowY: 'auto' }}>
                <ul className="mb-0">
                  {impacts.file_candidates.map((p, i) => <li key={i}><code>{p}</code></li>)}
                </ul>
              </div>
            ) : <div className="small text-muted">Aucun chemin détecté via tables connues.</div>}

            <div className="mt-3">
              <button className="btn btn-danger" onClick={onExecute}>Exécuter GDPR Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
