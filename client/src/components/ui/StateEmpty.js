// client/src/components/ui/StateEmpty.js
import React from 'react';

export default function StateEmpty({ label = 'Aucun résultat', children = null }) {
  return (
    <div className="state-box">
      <div className="mb-1">{label}</div>
      {children ? <div className="small-muted">{children}</div> : null}
    </div>
  );
}
