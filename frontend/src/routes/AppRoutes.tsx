import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import ProjectsPage from '../modules/projects/pages/ProjectsPage'
import CreateProjectPage from '../modules/projects/pages/CreateProjectPage'
import ProjectWorkspacePage from '../modules/projects/pages/ProjectWorkspacePage'
import TasksPage from '../modules/tasks/pages/TasksPage'
import TeamsPage from '../modules/teams/pages/TeamsPage'
import CreateTeamPage from '../modules/teams/pages/CreateTeamPage'
import TeamWorkspacePage from '../modules/teams/pages/TeamWorkspacePage'
import MentorsPage from '../pages/MentorsPage'
import SubmissionsPage from '../pages/SubmissionsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../modules/auth/pages/RegisterPage'
import MentorDashboardPage from '../modules/mentor/pages/MentorDashboardPage'
import MentorTeamsPage from '../modules/mentor/pages/MentorTeamsPage'
import MentorTeamPage from '../modules/mentor/pages/MentorTeamPage'
import MentorProjectSubmissionsPage from '../modules/mentor/pages/MentorProjectSubmissionsPage'
import SubmissionReviewPage from '../modules/reviews/pages/SubmissionReviewPage'
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

/**
 * UI-level role gate for the Mentor Portal.
 * Only users with role === "MENTOR" can access /mentor/* routes.
 * Students and other roles are redirected to /dashboard.
 *
 * NOTE: This is frontend application-role gating only.
 * Backend authorization will be enforced in a later implementation slice.
 */
function MentorProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying access...</p>
      </div>
    )
  }

  if (!user || user.role !== 'MENTOR') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
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
        
        {/* Project & Task Routes */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/create" element={<CreateProjectPage />} />
        <Route path="/projects/:projectId" element={<ProjectWorkspacePage />} />
        <Route path="/projects/:projectId/activity" element={<ProjectWorkspacePage />} />
        <Route path="/projects/:projectId/tasks" element={<TasksPage />} />
        
        {/* Team Formation Routes */}
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/create" element={<CreateTeamPage />} />
        <Route path="/teams/:teamId" element={<TeamWorkspacePage />} />

        <Route path="/mentors" element={<MentorsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />

        {/* Mentor Portal Routes — UI-level role gate: MENTOR only */}
        <Route element={<MentorProtectedLayout />}>
          <Route path="/mentor" element={<MentorDashboardPage />} />
          <Route path="/mentor/teams" element={<MentorTeamsPage />} />
          <Route path="/mentor/teams/:teamId" element={<MentorTeamPage />} />
          <Route path="/mentor/projects/:projectId/submissions" element={<MentorProjectSubmissionsPage />} />
          <Route path="/mentor/submissions/:submissionId/review" element={<SubmissionReviewPage />} />
        </Route>
      </Route>

      {/* Wildcard redirect back to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
