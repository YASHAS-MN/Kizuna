import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import ProjectsPage from '../pages/ProjectsPage'
import TeamsPage from '../pages/TeamsPage'
import MentorsPage from '../pages/MentorsPage'
import SubmissionsPage from '../pages/SubmissionsPage'
import LoginPage from '../pages/LoginPage'
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
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Main Application Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/mentors" element={<MentorsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
      </Route>

      {/* Wildcard redirect back to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
