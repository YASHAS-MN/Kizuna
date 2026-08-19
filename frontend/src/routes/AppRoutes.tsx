import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import ProjectsPage from '../pages/ProjectsPage'
import TeamsPage from '../modules/teams/pages/TeamsPage'
import CreateTeamPage from '../modules/teams/pages/CreateTeamPage'
import TeamWorkspacePage from '../modules/teams/pages/TeamWorkspacePage'
import MentorsPage from '../pages/MentorsPage'
import SubmissionsPage from '../pages/SubmissionsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../modules/auth/pages/RegisterPage'
import { useAuth } from '../context/AuthContext'

function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying session status...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Main Application Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        
        {/* Team Formation Routes */}
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/create" element={<CreateTeamPage />} />
        <Route path="/teams/:teamId" element={<TeamWorkspacePage />} />

        <Route path="/mentors" element={<MentorsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
      </Route>

      {/* Wildcard redirect back to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
