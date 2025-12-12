import React from 'react';
import { FiAlertTriangle, FiInbox } from 'react-icons/fi';

export function Spinner({ small=false }) {
  return (
    <div className={`spinner-border ${small ? 'spinner-border-sm' : ''}`} role="status" aria-hidden="true"></div>
  );
}

export function LoadingOverlay({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position:'absolute', inset:0, background:'rgba(255,255,255,.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:10
    }}>
      <Spinner />
    </div>
  );
}

export function EmptyState({ title='Aucune donnée', subtitle='Rien à afficher pour le moment.' }) {
  return (
    <div className="text-center text-muted py-4">
      <FiInbox size={28} className="mb-2" />
      <div className="fw-semibold">{title}</div>
      <div className="small">{subtitle}</div>
    </div>
  );
}

export function ConfirmModal({ show, title='Confirmer', body='Êtes-vous sûr ?', confirmText='Confirmer', confirmVariant='danger', onCancel, onConfirm }) {
  if (!show) return null;
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background:'rgba(0,0,0,.4)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{body}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Annuler</button>
            <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DangerNote({ children }) {
  return (
    <div className="d-flex align-items-start gap-2 text-danger small">
      <FiAlertTriangle className="mt-1" />
      <span>{children}</span>
    </div>
  );
}
