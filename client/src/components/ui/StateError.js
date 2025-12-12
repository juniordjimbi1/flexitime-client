// client/src/components/ui/StateError.js
import React from 'react';

export default function StateError({ label = 'Erreur de chargement', detail = '' }) {
  return (
    <div className="state-box">
      <div className="text-danger fw-semibold mb-1">⚠ {label}</div>
      {detail ? <div className="small-muted">{detail}</div> : null}
    </div>
  );
}
