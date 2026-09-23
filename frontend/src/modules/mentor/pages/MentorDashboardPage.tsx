import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { mentorService } from '../services/mentorService'
import type { MentorDashboard } from '../types/mentor.types'
import MentorStatCard from '../components/MentorStatCard'
import MentorTeamCard from '../components/MentorTeamCard'
import MentorProjectCard from '../components/MentorProjectCard'

/**
 * Mentor Dashboard — the primary landing page for authenticated MENTOR users.
 *
 * Renders a summary of the mentor's assigned teams, projects, and derived stats.
 * All data is fetched via mentorService, which composes existing domain services.
 * Subscribes to mentorService for reactive updates when downstream data changes.
 */
export default function MentorDashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<MentorDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadDashboard = useCallback(async () => {
    if (!user) return
    try {
      setErrorMsg('')
      const data = await mentorService.getMentorDashboard(user.id)
      setDashboard(data)
    } catch (err) {
      console.error('Failed to load mentor dashboard:', err)
      setErrorMsg('Failed to load mentor dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    loadDashboard()

    const unsubscribe = mentorService.subscribe(() => {
      loadDashboard()
    })

    return () => unsubscribe()
  }, [loadDashboard])

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading Mentor Dashboard...
      </div>
    )
  }

  // --- Error State ---
  if (errorMsg || !dashboard) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.875rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>
          {errorMsg || 'Unable to load dashboard'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          An error occurred while loading your mentor overview.
        </p>
        <button
          onClick={() => {
            setLoading(true)
            loadDashboard()
          }}
          className="btn btn-secondary"
        >
          Retry
        </button>
      </div>
    )
  }

  const { assignedTeams, assignedProjects, activeProjectCount, pendingSubmissionCount } = dashboard

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Dashboard Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '0.875rem',
          padding: '2rem'
        }}
      >
        <span
          className="hero-tagline"
          style={{ margin: 0, fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}
        >
          Mentor Portal
        </span>
        <h1
          className="hero-title"
          style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'left' }}
        >
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Oversight dashboard for your assigned student teams and projects.
          This is a read-only view — student data is managed by the students.
        </p>
      </div>

      {/* Summary Stats */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem'
          }}
        >
          Overview
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <MentorStatCard
            label="Assigned Teams"
            value={assignedTeams.length}
            description="Teams under your mentorship"
            icon="👥"
            accentColor="#6366f1"
          />
          <MentorStatCard
            label="Assigned Projects"
            value={assignedProjects.length}
            description="Projects across all teams"
            icon="📁"
            accentColor="#8b5cf6"
          />
          <MentorStatCard
            label="Active Projects"
            value={activeProjectCount}
            description="Currently in active development"
            icon="⚡"
            accentColor="#10b981"
          />
          <MentorStatCard
            label="Pending Submissions"
            value={pendingSubmissionCount}
            description="Submitted or under review"
            icon="📤"
            accentColor="#f59e0b"
          />
        </div>
      </div>

      {/* Assigned Teams Section */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem'
          }}
        >
          Assigned Teams
        </h2>

        {assignedTeams.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.875rem',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎓</div>
            <p style={{ fontWeight: 500 }}>No teams assigned yet.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Teams will appear here once they are assigned to you.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {assignedTeams.map((teamView) => (
              <MentorTeamCard key={teamView.team.id} teamView={teamView} />
            ))}
          </div>
        )}
      </div>

      {/* Assigned Projects Section */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem'
          }}
        >
          Assigned Projects
        </h2>

        {assignedProjects.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.875rem',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📁</div>
            <p style={{ fontWeight: 500 }}>No projects assigned yet.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}
          >
            {assignedProjects.map((projectView) => (
              <MentorProjectCard key={projectView.project.id} projectView={projectView} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
