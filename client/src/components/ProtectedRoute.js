import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles: ['ADMIN','MANAGER','EMPLOYEE'] ou undefined
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '60vh'}}>
        <div className="spinner-border" role="status" aria-hidden="true"></div>
        <span className="ms-2">Chargement…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role?.code)) {
    // Redirige selon rôle actuel
    if (user.role.code === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role.code === 'MANAGER') return <Navigate to="/manager" replace />;
    if (user.role.code === 'EMPLOYEE') return <Navigate to="/employee" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
