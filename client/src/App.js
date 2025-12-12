import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import LandingHome from './pages/LandingHome';
import AboutPitchPage from './pages/AboutPitchPage';
import ProfilePage from './pages/ProfilePage';

import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import EmployeeSignupPage from './pages/EmployeeSignupPage';

// import AdminDashboard from './pages/AdminDashboard'; // supprimé
import AdminOrgPage from './pages/AdminOrgPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminKpisPage from './pages/AdminKpisPage';

import ManagerDashboard from './pages/ManagerDashboard';
import ManagerKpisPage from './pages/ManagerKpisPage';

import EmployeeDashboard from './pages/EmployeeDashboard';

import AdminEmployeesPage from './pages/AdminEmployeesPage';

import ManagerValidationsPage from './pages/ManagerValidationsPage';
import AdminValidationsPage from './pages/AdminValidationsPage';
import ManagerPlanPage from './pages/ManagerPlanPage';
import EmployeeHistoryPage from './pages/EmployeeHistoryPage';
import AdminTeamCreatePage from './pages/AdminTeamCreatePage';
import ManagerTeamMembersPage from './pages/ManagerTeamMembersPage';
import ManagerTeamFinalClosePage from './pages/ManagerTeamFinalClosePage';
import AdminTeamValidationsPage from './pages/AdminTeamValidationsPage';
import AdminQuickTasksPage from './pages/AdminQuickTasksPage';

/* P4 — UI Projets */
import ProjectsList from './pages/projects/ProjectsList';
import ProjectBoard from './pages/projects/ProjectBoard';
import BacklogPlanner from './pages/manager/BacklogPlanner';
import PlansViewer from './pages/manager/PlansViewer';
import LabelsAdmin from './pages/admin/LabelsAdmin';
import GDPRDelete from './pages/admin/GDPRDelete';

import ProjectReporting from './pages/projects/ProjectReporting';



/* Redirection unifiée après connexion : TOUJOURS vers "/" */
function HomeRedirect() {
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavbar />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingHome />} />
        <Route path="/about" element={<AboutPitchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<EmployeeSignupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Redirection “après connexion” (tous rôles => Accueil) */}
        <Route path="/home" element={<HomeRedirect />} />

        {/* Profil (protégé) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE','MANAGER','ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin (le chemin /admin redirige maintenant vers l’accueil) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/org"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminOrgPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kpis"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminKpisPage />
            </ProtectedRoute>
          }
        />

        {/* Manager */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/kpis"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ManagerKpisPage />
            </ProtectedRoute>
          }
        />

        {/* Employé */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE','ADMIN','MANAGER']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminEmployeesPage />
            </ProtectedRoute>
          }
        />

        {/* Manager */}
        <Route
          path="/manager/validations"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ManagerValidationsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/validations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminValidationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/plan"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ManagerPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/history"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE','MANAGER','ADMIN']}>
              <EmployeeHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/teams/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTeamCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/team-members"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ManagerTeamMembersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/team-final-close"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <ManagerTeamFinalClosePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/quick-tasks"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminQuickTasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/team-validations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTeamValidationsPage />
            </ProtectedRoute>
          }
        />

        {/* P4 — Projets */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={['ADMIN','MANAGER','EMPLOYEE']}>
              <ProjectsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN','MANAGER','EMPLOYEE']}>
              <ProjectBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/backlog-planner"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <BacklogPlanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/plans"
          element={
            <ProtectedRoute allowedRoles={['MANAGER','ADMIN']}>
              <PlansViewer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/labels"
          element={
            <ProtectedRoute allowedRoles={['ADMIN','MANAGER']}>
              <LabelsAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/gdpr"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <GDPRDelete />
            </ProtectedRoute>
          }
        />

        <Route path="/projects/reporting" element={<ProjectReporting />} />
       

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
