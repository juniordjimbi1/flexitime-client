// client/src/components/ui/StateLoading.js
import React from 'react';

export default function StateLoading({ label = 'Chargement…' }) {
  return (
    <div className="state-box">
      <div className="spinner-border me-2" role="status" aria-hidden="true"></div>
      <span className="align-middle">{label}</span>
    </div>
  );
}
